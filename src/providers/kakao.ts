import { env } from "@/config/env";
import { ensureOk, type NormalizedProfile, type OAuthProvider } from "./types";

const AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const USERINFO_URL = "https://kapi.kakao.com/v2/user/me";

interface KakaoUserInfo {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

export const kakaoProvider: OAuthProvider = {
  name: "kakao",

  getAuthorizeUrl({ redirectUri, state }) {
    const params = new URLSearchParams({
      client_id: env.KAKAO_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      state,
      // Scopes must be enabled in the Kakao developer console first.
      scope: "account_email profile_nickname profile_image",
    });
    return `${AUTHORIZE_URL}?${params.toString()}`;
  },

  async exchangeCode({ code, redirectUri }) {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.KAKAO_CLIENT_ID,
      redirect_uri: redirectUri,
      code,
    });
    // client_secret is optional in Kakao; only sent when configured.
    if (env.KAKAO_CLIENT_SECRET) body.set("client_secret", env.KAKAO_CLIENT_SECRET);

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    await ensureOk(res, "Kakao token exchange");
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  },

  async getProfile(accessToken): Promise<NormalizedProfile> {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    await ensureOk(res, "Kakao userinfo");
    const u = (await res.json()) as KakaoUserInfo;
    const account = u.kakao_account;
    return {
      provider: "kakao",
      providerUserId: String(u.id),
      email: account?.email ?? null,
      name: account?.profile?.nickname ?? null,
      avatarUrl: account?.profile?.profile_image_url ?? null,
    };
  },
};
