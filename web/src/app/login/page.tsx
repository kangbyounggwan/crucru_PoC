import Image from "next/image";
import styles from "./login.module.css";
import { ArrowRight } from "../_components/icons";
import SocialButtons from "./_components/SocialButtons";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className={styles.split}>
      {/* Left: brand panel */}
      <aside className={styles.brandPanel}>
        <a href="/" className={styles.brandLogo}>
          Crucru
        </a>
        <div className={styles.brandCenter}>
          <div className={styles.heroImageWrap}>
            <Image
              src="/mascot.png"
              alt="Crucru 마스코트"
              fill
              priority
              sizes="360px"
              className={styles.heroImage}
            />
            <span className={styles.sticker}>WIN TOGETHER!</span>
          </div>
          <p className={styles.brandTagline}>Crew. Battle. Win Together.</p>
        </div>
        <p className={styles.brandFootnote}>★ 함께 만드는 승부, 함께 얻는 가치</p>
      </aside>

      {/* Right: login card */}
      <section className={styles.formPanel}>
        <div className={styles.card}>
          <h1 className={styles.title}>로그인 / 회원가입</h1>
          <p className={styles.lead}>소셜 계정으로 3초 만에 시작하세요.</p>

          {searchParams?.error && (
            <p className={styles.error}>로그인에 실패했어요. 다시 시도해 주세요.</p>
          )}

          <SocialButtons />

          <div className={styles.divider}>
            <span className={styles.dividerText}>또는</span>
          </div>

          <a href="/login/email" className={styles.emailLink}>
            이메일로 로그인
          </a>

          <a href="/seller/start" className={styles.sellerCta}>
            셀러로 시작하기
            <span className={styles.arrow}>
              <ArrowRight />
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}
