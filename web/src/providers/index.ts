import { env } from "@/config/env";
import { googleProvider } from "./google";
import { kakaoProvider } from "./kakao";
import { naverProvider } from "./naver";
import { appleProvider } from "./apple";
import type { OAuthProvider, ProviderName } from "./types";

/** A provider is enabled only when its required credentials are configured. */
const enabled: Partial<Record<ProviderName, OAuthProvider>> = {};

if (env.KAKAO_CLIENT_ID) enabled.kakao = kakaoProvider; // Kakao secret is optional
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) enabled.google = googleProvider;
if (env.NAVER_CLIENT_ID && env.NAVER_CLIENT_SECRET) enabled.naver = naverProvider;
if (
  env.APPLE_CLIENT_ID &&
  env.APPLE_TEAM_ID &&
  env.APPLE_KEY_ID &&
  env.APPLE_PRIVATE_KEY
) {
  enabled.apple = appleProvider;
}

export function getProvider(name: string): OAuthProvider | null {
  return (enabled as Record<string, OAuthProvider>)[name] ?? null;
}

export function isProviderEnabled(name: ProviderName): boolean {
  return Boolean(enabled[name]);
}

export const providerNames = Object.keys(enabled) as ProviderName[];

/** All providers the UI knows about, regardless of whether creds are set. */
export const allProviderNames: ProviderName[] = [
  "kakao",
  "google",
  "apple",
  "naver",
];
