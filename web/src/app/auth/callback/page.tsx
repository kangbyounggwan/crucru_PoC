"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface DisplayUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  via: string;
}

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [user, setUser] = useState<DisplayUser | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
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

    // Path B — Supabase Auth (Kakao/Google/Apple): session is in the URL hash.
    supabaseBrowser.auth
      .getSession()
      .then(({ data }) => {
        const s = data.session;
        if (!s) {
          setStatus("error");
          return;
        }
        const u = s.user;
        const meta = u.user_metadata ?? {};
        setUser({
          id: u.id,
          email: u.email ?? null,
          name: meta.name ?? meta.full_name ?? meta.nickname ?? null,
          avatarUrl: meta.avatar_url ?? meta.picture ?? null,
          via: u.app_metadata?.provider ?? "supabase",
        });
        setStatus("ok");
        window.history.replaceState({}, "", "/auth/callback");
      })
      .catch(() => setStatus("error"));
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
