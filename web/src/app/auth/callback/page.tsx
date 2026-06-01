"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface DisplayUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  via: string;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [user, setUser] = useState<DisplayUser | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errDesc = params.get("error_description");
    if (params.get("error") || errDesc) {
      setReason(errDesc ? decodeURIComponent(errDesc) : null);
      setStatus("error");
      return;
    }

    // Path A — custom backend (Naver): tokens arrive as query params.
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (accessToken && refreshToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      window.history.replaceState({}, "", "/auth/callback");
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          setUser({ id: d.id, email: d.email, name: d.name, avatarUrl: d.avatar_url, via: "naver" });
          setStatus("ok");
        })
        .catch(() => setStatus("error"));
      return;
    }

    // Path B — Supabase Auth (Kakao/Google/Apple). The PKCE code exchange runs
    // asynchronously (detectSessionInUrl), so wait for the session via the
    // auth listener AND an initial getSession, with a timeout fallback.
    let done = false;
    const settle = (s: Session | null) => {
      if (done || !s) return;
      done = true;
      // New signups (no completed profile) go straight to profile setup.
      const completed = s.user.user_metadata?.profile_completed === true;
      router.replace(completed ? "/" : "/onboarding/profile");
    };

    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_e, session) =>
      settle(session),
    );
    supabaseBrowser.auth.getSession().then(({ data }) => settle(data.session));

    const timer = setTimeout(() => {
      if (!done) setStatus("error");
    }, 5000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: "var(--font-jakarta), sans-serif",
        padding: 24,
        textAlign: "center",
      }}
    >
      {status === "loading" && <p>로그인 처리 중…</p>}
      {status === "error" && (
        <>
          <h1 style={{ color: "#b70051" }}>로그인 실패</h1>
          {reason && <p style={{ color: "#5b3f45", fontSize: 13, maxWidth: 360 }}>{reason}</p>}
          <a href="/login" style={{ color: "#008092" }}>
            다시 시도하기
          </a>
        </>
      )}
      {status === "ok" && user && (
        <>
          <h1 style={{ color: "#b70051" }}>환영합니다 🎉</h1>
          <p style={{ fontSize: 18, fontWeight: 600 }}>{user.name ?? user.email ?? user.id}</p>
          {user.email && <p style={{ color: "#5b3f45", fontSize: 14 }}>{user.email}</p>}
          <p style={{ color: "#9a9aa2", fontSize: 13 }}>via {user.via}</p>
          <a href="/" style={{ marginTop: 12, color: "#008092" }}>
            홈으로
          </a>
        </>
      )}
    </main>
  );
}
