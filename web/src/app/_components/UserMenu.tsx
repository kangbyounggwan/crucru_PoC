"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";
import styles from "./UserMenu.module.css";

interface Profile {
  name: string;
  email: string | null;
  avatarUrl: string | null;
}

function toProfile(s: Session): Profile {
  const u = s.user;
  const m = u.user_metadata ?? {};
  return {
    name: m.name ?? m.full_name ?? m.nickname ?? u.email ?? "사용자",
    email: u.email ?? null,
    avatarUrl: m.avatar_url ?? m.picture ?? null,
  };
}

export default function UserMenu() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setProfile(data.session ? toProfile(data.session) : null);
      setReady(true);
    });
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      setProfile(session ? toProfile(session) : null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function logout() {
    await supabaseBrowser.auth.signOut();
    setOpen(false);
    setProfile(null);
  }

  // Before the session is known, render a stable placeholder to avoid flicker.
  if (!ready) return <span className={styles.placeholder} aria-hidden />;

  if (!profile) {
    return (
      <a href="/login" className={styles.loginBtn}>
        로그인
      </a>
    );
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.chip} onClick={() => setOpen((v) => !v)}>
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt="" className={styles.avatar} />
        ) : (
          <span className={styles.avatarFallback}>{profile.name.slice(0, 1)}</span>
        )}
        <span className={styles.name}>{profile.name}</span>
        <span className={styles.caret}>▾</span>
      </button>

      {open && (
        <div className={styles.menu}>
          <div className={styles.menuHead}>
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className={styles.menuAvatar} />
            ) : (
              <span className={styles.menuAvatarFallback}>{profile.name.slice(0, 1)}</span>
            )}
            <div className={styles.menuInfo}>
              <span className={styles.menuName}>{profile.name}</span>
              {profile.email && <span className={styles.menuEmail}>{profile.email}</span>}
            </div>
          </div>
          <button className={styles.logout} onClick={logout}>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
