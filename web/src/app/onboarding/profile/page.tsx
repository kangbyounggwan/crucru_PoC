"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import styles from "./profile.module.css";

const CATEGORIES = [
  "K-패션",
  "뷰티/라이프",
  "푸드 테크",
  "캐릭터 굿즈",
  "디지털",
  "반려용품",
];
const MAX_CATEGORIES = 3;

export default function ProfileSetupPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [channel, setChannel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (!s) {
        router.replace("/login");
        return;
      }
      const m = s.user.user_metadata ?? {};
      setNickname(m.nickname ?? m.name ?? m.full_name ?? "");
      setAvatarUrl(m.avatar_url ?? m.picture ?? null);
      setReady(true);
    });
  }, [router]);

  const nicknameOk = useMemo(() => nickname.trim().length >= 2, [nickname]);
  const canSubmit = nicknameOk && categories.length > 0 && !saving;

  function toggleCategory(c: string) {
    setCategories((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c);
      if (prev.length >= MAX_CATEGORIES) return prev;
      return [...prev, c];
    });
  }

  async function start() {
    if (!canSubmit) return;
    setSaving(true);
    const { error } = await supabaseBrowser.auth.updateUser({
      data: {
        nickname: nickname.trim(),
        interests: categories,
        channel_url: channel.trim() || null,
        profile_completed: true,
      },
    });
    if (error) {
      setSaving(false);
      alert("저장에 실패했어요. 다시 시도해 주세요.");
      return;
    }
    router.replace("/");
  }

  if (!ready) {
    return (
      <main className={styles.viewport}>
        <p className={styles.loading}>불러오는 중…</p>
      </main>
    );
  }

  return (
    <main className={styles.viewport}>
      <div className={styles.card}>
        <header className={styles.head}>
          <span className={styles.title}>프로필 설정</span>
          <span className={styles.step}>3 / 3</span>
        </header>

        {/* Avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrap}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className={styles.avatar} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/mascot.png" alt="" className={styles.avatar} />
            )}
            <span className={styles.cameraBadge}>📷</span>
          </div>
          <p className={styles.avatarHint}>나를 대표할 마스코트를 선택하거나 직접 업로드하세요</p>
          <div className={styles.mascotRow}>
            <button
              className={`${styles.mascotThumb} ${avatarUrl ? "" : styles.mascotActive}`}
              onClick={() => setAvatarUrl(null)}
              type="button"
              aria-label="마스코트 선택"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascot.png" alt="" />
            </button>
            <button className={styles.mascotAdd} type="button" aria-label="추가">
              +
            </button>
          </div>
        </div>

        {/* Nickname */}
        <label className={styles.field}>
          <span className={styles.label}>닉네임 (닉네임)</span>
          <div className={styles.nicknameRow}>
            <input
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="크루마스터_지니"
              maxLength={20}
            />
            {nicknameOk && <span className={styles.ok}>✓ 사용 가능</span>}
          </div>
        </label>

        {/* Categories */}
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <span className={styles.label}>관심 카테고리</span>
            <span className={styles.max}>최대 {MAX_CATEGORIES}개</span>
          </div>
          <div className={styles.chips}>
            {CATEGORIES.map((c) => {
              const active = categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Channel */}
        <label className={styles.field}>
          <span className={styles.label}>외부 채널 URL (선택)</span>
          <div className={styles.channelRow}>
            <span className={styles.linkIcon}>🔗</span>
            <input
              className={styles.input}
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
        </label>

        <div className={styles.notice}>
          <strong>준비 완료!</strong> 프로필 작성을 마치면 즉시 판매가 가능해요.
        </div>

        <button className={styles.cta} onClick={start} disabled={!canSubmit}>
          {saving ? "저장 중…" : "크루 시작! 🎉"}
        </button>
      </div>
    </main>
  );
}
