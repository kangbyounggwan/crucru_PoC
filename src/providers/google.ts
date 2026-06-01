import { env } from "@/config/env";
import { ensureOk, type NormalizedProfile, type OAuthProvider } from "./types";

const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export const googleProvider: OAuthProvider = {
  name: "google",

  getAuthorizeUrl({ redirectUri, state }) {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });
    return `${AUTHORIZE_URL}?${params.toString()}`;
  },

  async exchangeCode({ code, redirectUri }) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    await ensureOk(res, "Google token exchange");
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  },

  async getProfile(accessToken): Promise<NormalizedProfile> {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    await ensureOk(res, "Google userinfo");
    const u = (await res.json()) as GoogleUserInfo;
    return {
      provider: "google",
      providerUserId: u.sub,
      email: u.email ?? null,
      name: u.name ?? null,
      avatarUrl: u.picture ?? null,
    };
  },
};
