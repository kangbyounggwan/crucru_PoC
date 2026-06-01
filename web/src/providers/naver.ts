import { env } from "@/config/env";
import { ensureOk, type NormalizedProfile, type OAuthProvider } from "./types";

const AUTHORIZE_URL = "https://nid.naver.com/oauth2.0/authorize";
const TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const USERINFO_URL = "https://openapi.naver.com/v1/nid/me";

interface NaverUserInfo {
  resultcode: string;
  message: string;
  response?: {
    id: string;
    email?: string;
    name?: string;
    nickname?: string;
    profile_image?: string;
  };
}

export const naverProvider: OAuthProvider = {
  name: "naver",

  getAuthorizeUrl({ redirectUri, state }) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.NAVER_CLIENT_ID,
      redirect_uri: redirectUri,
      state,
    });
    return `${AUTHORIZE_URL}?${params.toString()}`;
  },

  async exchangeCode({ code, state }) {
    // Naver requires the same `state` value at the token step.
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.NAVER_CLIENT_ID,
      client_secret: env.NAVER_CLIENT_SECRET,
      code,
      state,
    });
    const res = await fetch(`${TOKEN_URL}?${params.toString()}`, {
      method: "GET",
    });
    await ensureOk(res, "Naver token exchange");
    const data = (await res.json()) as { access_token?: string; error?: string };
    if (!data.access_token) {
      throw new Error(`Naver token exchange returned no access_token: ${data.error ?? "unknown"}`);
    }
    return data.access_token;
  },

  async getProfile(accessToken): Promise<NormalizedProfile> {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    await ensureOk(res, "Naver userinfo");
    const u = (await res.json()) as NaverUserInfo;
    if (u.resultcode !== "00" || !u.response) {
      throw new Error(`Naver userinfo error: ${u.message}`);
    }
    const r = u.response;
    return {
      provider: "naver",
      providerUserId: r.id,
      email: r.email ?? null,
      name: r.name ?? r.nickname ?? null,
      avatarUrl: r.profile_image ?? null,
    };
  },
};
