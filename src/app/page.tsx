import Image from "next/image";
import styles from "./page.module.css";
import {
  AppleIcon,
  ArrowRight,
  GoogleIcon,
  KakaoIcon,
  NaverIcon,
} from "./_components/icons";

const socialButtons = [
  { provider: "kakao", label: "카카오로 시작하기", className: styles.kakao, icon: <KakaoIcon /> },
  { provider: "google", label: "구글로 시작하기", className: styles.google, icon: <GoogleIcon /> },
  { provider: "apple", label: "Apple로 시작하기", className: styles.apple, icon: <AppleIcon /> },
  { provider: "naver", label: "네이버로 시작하기", className: styles.naver, icon: <NaverIcon /> },
];

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className={styles.viewport}>
      <div className={styles.frame}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroImageWrap}>
            <Image
              src="/mascot.png"
              alt="Crucru 마스코트"
              fill
              priority
              sizes="350px"
              className={styles.heroImage}
            />
          </div>
          <span className={styles.sticker}>WIN TOGETHER!</span>
        </div>

        {/* Brand */}
        <div className={styles.brand}>
          <h1 className={styles.title}>Crucru</h1>
          <p className={styles.subtitle}>Crew. Battle. Win Together.</p>
          <div className={styles.tags}>
            <span className={styles.tag}>#트렌디한</span>
            <span className={styles.tag}>#에너지넘치는</span>
          </div>
        </div>

        {searchParams?.error && (
          <p className={styles.error}>로그인에 실패했어요. 다시 시도해 주세요.</p>
        )}

        {/* Social buttons */}
        <div className={styles.buttons}>
          {socialButtons.map((b) => (
            <a
              key={b.provider}
              href={`/api/auth/${b.provider}`}
              className={`${styles.btn} ${b.className}`}
            >
              <span className={styles.btnIcon}>{b.icon}</span>
              {b.label}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>또는</span>
        </div>

        <a href="/login/email" className={styles.emailLink}>
          이메일로 로그인
        </a>

        {/* Seller CTA */}
        <a href="/seller/start" className={styles.sellerCta}>
          셀러로 시작하기
          <span className={styles.arrow}>
            <ArrowRight />
          </span>
        </a>

        <p className={styles.footnote}>★ 함께 만드는 승부, 함께 얻는 가치</p>
      </div>
    </main>
  );
}
