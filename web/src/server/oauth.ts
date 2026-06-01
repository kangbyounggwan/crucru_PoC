import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { getProvider } from "@/providers";
import { issueTokens, upsertUserFromProfile } from "@/services/auth.service";

/** Redirect URI this app exposes for a provider (must match the console). */
export function callbackUri(provider: string): string {
  return `${env.APP_BASE_URL}/api/auth/${provider}/callback`;
}

/**
 * CSRF state as a short-lived signed token (stateless). Works for both GET
 * callbacks (Kakao/Google/Naver) and Apple's cross-site form_post POST,
 * where a SameSite cookie would be dropped.
 */
export function signState(provider: string): string {
  return jwt.sign({ t: "oauth_state", p: provider }, env.JWT_ACCESS_SECRET, {
    expiresIn: 600,
  });
}

export function verifyState(state: string, provider: string): boolean {
  try {
    const d = jwt.verify(state, env.JWT_ACCESS_SECRET) as {
      t?: string;
      p?: string;
    };
    return d.t === "oauth_state" && d.p === provider;
  } catch {
    return false;
  }
}

/**
 * Exchange code → profile → user → JWTs, then redirect to the frontend with
 * the tokens. Shared by the GET and POST (Apple) callback handlers.
 */
export async function completeOAuth(opts: {
  providerName: string;
  code: string | null;
  state: string | null;
}): Promise<NextResponse> {
  const provider = getProvider(opts.providerName);
  if (!provider) {
    return NextResponse.json(
      { error: `Unknown or disabled provider: ${opts.providerName}` },
      { status: 404 },
    );
  }
  if (!opts.code || !opts.state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }
  if (!verifyState(opts.state, provider.name)) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  try {
    const token = await provider.exchangeCode({
      code: opts.code,
      redirectUri: callbackUri(provider.name),
      state: opts.state,
    });
    const profile = await provider.getProfile(token);
    const user = await upsertUserFromProfile(profile);
    const tokens = await issueTokens(user);

    const redirect = new URL(env.FRONTEND_REDIRECT_URL);
    redirect.searchParams.set("access_token", tokens.accessToken);
    redirect.searchParams.set("refresh_token", tokens.refreshToken);
    return NextResponse.redirect(redirect.toString());
  } catch (err) {
    console.error(`[${provider.name}] callback error:`, err);
    const redirect = new URL(env.FRONTEND_REDIRECT_URL);
    redirect.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(redirect.toString());
  }
}
