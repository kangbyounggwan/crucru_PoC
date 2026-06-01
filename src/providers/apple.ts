import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { ensureOk, type NormalizedProfile, type OAuthProvider } from "./types";

const AUTHORIZE_URL = "https://appleid.apple.com/auth/authorize";
const TOKEN_URL = "https://appleid.apple.com/auth/token";

/**
 * Apple's client_secret is a short-lived ES256 JWT signed with the .p8 key.
 * https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens
 */
function buildClientSecret(): string {
  const privateKey = env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: env.APPLE_TEAM_ID,
      iat: now,
      exp: now + 60 * 5,
      aud: "https://appleid.apple.com",
      sub: env.APPLE_CLIENT_ID,
    },
    privateKey,
    { algorithm: "ES256", keyid: env.APPLE_KEY_ID },
  );
}

export const appleProvider: OAuthProvider = {
  name: "apple",

  getAuthorizeUrl({ redirectUri, state }) {
    // Requesting name/email forces response_mode=form_post → callback is a POST.
    const params = new URLSearchParams({
      client_id: env.APPLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "name email",
      response_mode: "form_post",
      state,
    });
    return `${AUTHORIZE_URL}?${params.toString()}`;
  },

  async exchangeCode({ code, redirectUri }) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.APPLE_CLIENT_ID,
        client_secret: buildClientSecret(),
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    await ensureOk(res, "Apple token exchange");
    const data = (await res.json()) as { id_token?: string };
    if (!data.id_token) throw new Error("Apple token exchange returned no id_token");
    // Apple has no userinfo endpoint — the profile lives in the id_token.
    return data.id_token;
  },

  async getProfile(idToken): Promise<NormalizedProfile> {
    // id_token came directly from Apple's token endpoint over TLS; decode payload.
    const payload = jwt.decode(idToken) as
      | { sub: string; email?: string }
      | null;
    if (!payload?.sub) throw new Error("Apple id_token missing sub");
    return {
      provider: "apple",
      providerUserId: payload.sub,
      email: payload.email ?? null,
      name: null, // Apple only sends the name on first auth via the form_post `user` field
      avatarUrl: null,
    };
  },
};
