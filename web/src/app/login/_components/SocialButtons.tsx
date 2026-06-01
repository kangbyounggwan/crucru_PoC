"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  AppleIcon,
  GoogleIcon,
  KakaoIcon,
  NaverIcon,
} from "../../_components/icons";
import styles from "../login.module.css";

type SupabaseProvider = "kakao" | "google" | "apple";

const buttons: Array<{
  provider: SupabaseProvider | "naver";
  label: string;
  className: string;
  icon: React.ReactNode;
}> = [
  { provider: "kakao", label: "카카오로 시작하기", className: styles.kakao, icon: <KakaoIcon /> },
  { provider: "google", label: "구글로 시작하기", className: styles.google, icon: <GoogleIcon /> },
  { provider: "apple", label: "Apple로 시작하기", className: styles.apple, icon: <AppleIcon /> },
  { provider: "naver", label: "네이버로 시작하기", className: styles.naver, icon: <NaverIcon /> },
];

export default function SocialButtons() {
  const [busy, setBusy] = useState<string | null>(null);

  async function onClick(provider: SupabaseProvider | "naver") {
    setBusy(provider);
    // Naver isn't supported by Supabase Auth → use our custom backend.
    if (provider === "naver") {
      window.location.href = "/api/auth/naver";
      return;
    }
    // Kakao / Google / Apple via Supabase Auth.
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      console.error(error);
      setBusy(null);
    }
    // On success the browser is redirected to the provider, so no further work.
  }

  return (
    <div className={styles.buttons}>
      {buttons.map((b) => (
        <button
          key={b.provider}
          onClick={() => onClick(b.provider)}
          disabled={busy !== null}
          className={`${styles.btn} ${b.className}`}
        >
          <span className={styles.btnIcon}>{b.icon}</span>
          {busy === b.provider ? "연결 중…" : b.label}
        </button>
      ))}
    </div>
  );
}
