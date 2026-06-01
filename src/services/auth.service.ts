import { supabase } from "@/lib/supabase";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { env } from "@/config/env";
import type { NormalizedProfile } from "@/providers/types";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Find-or-create a user from a normalized social profile, linking the
 * social account. Accounts with the same verified email collapse into one user.
 */
export async function upsertUserFromProfile(
  profile: NormalizedProfile,
): Promise<AuthUser> {
  // 1) Already linked? Return that user.
  const { data: link } = await supabase
    .from("social_accounts")
    .select("user_id")
    .eq("provider", profile.provider)
    .eq("provider_user_id", profile.providerUserId)
    .maybeSingle();

  if (link?.user_id) {
    return getUserById(link.user_id);
  }

  // 2) Match an existing user by email, otherwise create one.
  let userId: string | null = null;

  if (profile.email) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", profile.email)
      .maybeSingle();
    userId = existing?.id ?? null;
  }

  if (!userId) {
    const { data: created, error } = await supabase
      .from("users")
      .insert({
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatarUrl,
      })
      .select("id")
      .single();
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    userId = created.id as string;
  }

  if (!userId) throw new Error("Failed to resolve user id");

  // 3) Link the social account (idempotent on provider + provider_user_id).
  const { error: linkErr } = await supabase.from("social_accounts").insert({
    user_id: userId,
    provider: profile.provider,
    provider_user_id: profile.providerUserId,
    email: profile.email,
  });
  if (linkErr && !linkErr.message.includes("duplicate")) {
    throw new Error(`Failed to link social account: ${linkErr.message}`);
  }

  return getUserById(userId);
}

async function getUserById(id: string): Promise<AuthUser> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, avatar_url")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error(`User not found: ${id}`);
  return data as AuthUser;
}

/** Issue an access + refresh pair and persist the refresh token's hash. */
export async function issueTokens(user: AuthUser): Promise<TokenPair> {
  const accessToken = signAccessToken(user.id, user.email);
  const { token: refreshToken, jti } = signRefreshToken(user.id);

  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL * 1000).toISOString();
  const { error } = await supabase.from("refresh_tokens").insert({
    user_id: user.id,
    jti_hash: hashToken(jti),
    expires_at: expiresAt,
  });
  if (error) throw new Error(`Failed to persist refresh token: ${error.message}`);

  return { accessToken, refreshToken, expiresIn: env.JWT_ACCESS_TTL };
}

/**
 * Rotate a refresh token: verify it, ensure it's still active in the DB,
 * revoke the old one, and issue a fresh pair.
 */
export async function rotateRefreshToken(refreshToken: string): Promise<TokenPair> {
  const payload = verifyRefreshToken(refreshToken);
  const jtiHash = hashToken(payload.jti);

  const { data: row } = await supabase
    .from("refresh_tokens")
    .select("id, revoked_at, expires_at")
    .eq("jti_hash", jtiHash)
    .maybeSingle();

  if (!row || row.revoked_at || new Date(row.expires_at) < new Date()) {
    throw new Error("Refresh token is invalid or expired");
  }

  // Revoke the used token (single-use rotation).
  await supabase
    .from("refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", row.id);

  const user = await getUserById(payload.sub);
  return issueTokens(user);
}

/** Revoke a single refresh token (logout). */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  let jti: string;
  try {
    jti = verifyRefreshToken(refreshToken).jti;
  } catch {
    return; // already invalid — nothing to do
  }
  await supabase
    .from("refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("jti_hash", hashToken(jti))
    .is("revoked_at", null);
}
