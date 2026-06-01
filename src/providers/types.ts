export type ProviderName = "google" | "kakao" | "naver" | "apple";

/** Normalized profile shape every provider maps into. */
export interface NormalizedProfile {
  provider: ProviderName;
  providerUserId: string; // unique id within the provider
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export interface OAuthProvider {
  readonly name: ProviderName;

  /** Build the provider's authorize URL the user is redirected to. */
  getAuthorizeUrl(params: { redirectUri: string; state: string }): string;

  /** Exchange the authorization `code` for the provider's access token. */
  exchangeCode(params: {
    code: string;
    redirectUri: string;
    state: string;
  }): Promise<string>;

  /** Fetch the user profile with the provider access token, normalized. */
  getProfile(accessToken: string): Promise<NormalizedProfile>;
}

/** Small helper to throw readable errors on non-2xx responses. */
export async function ensureOk(res: Response, context: string): Promise<Response> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${context} failed: ${res.status} ${res.statusText} ${body}`);
  }
  return res;
}
