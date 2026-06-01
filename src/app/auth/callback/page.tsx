"use client";

import { useEffect, useState } from "react";

interface Me {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setStatus("error");
      return;
    }
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) {
      setStatus("error");
      return;
    }

    // Persist tokens. For production prefer httpOnly cookies over localStorage.
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);

    // Clean tokens out of the URL bar.
    window.history.replaceState({}, "", "/auth/callback");

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Me) => {
        setMe(data);
        setStatus("ok");
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
          <a href="/" style={{ color: "#008092" }}>
            다시 시도하기
          </a>
        </>
      )}
      {status === "ok" && me && (
        <>
          <h1 style={{ color: "#b70051" }}>환영합니다 🎉</h1>
          <p>{me.name ?? me.email ?? me.id}</p>
          <p style={{ color: "#5b3f45", fontSize: 14 }}>로그인이 완료되었습니다.</p>
        </>
      )}
    </main>
  );
}
