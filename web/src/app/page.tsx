import Image from "next/image";
import Header from "./_components/Header";
import { ArrowRight } from "./_components/icons";
import styles from "./page.module.css";

const features = [
  {
    emoji: "⚔️",
    title: "라이브 배틀 · PK",
    desc: "크루끼리 실시간 배틀로 시청자를 모으고 매출을 끌어올려요.",
  },
  {
    emoji: "🔔",
    title: "골든벨 · 잭팟",
    desc: "골든벨과 잭팟 이벤트로 시청자 참여와 구매 전환을 높여요.",
  },
  {
    emoji: "📊",
    title: "실시간 정산 · 대시보드",
    desc: "방송별 매출·점수·등급을 한눈에. 셀러 대시보드로 바로 관리.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.badge}>SELLER STUDIO</span>
            <h1 className={styles.title}>
              크루와 함께 이기는
              <br />
              <span className={styles.titleAccent}>라이브 커머스</span>
            </h1>
            <p className={styles.subtitle}>
              Crew. Battle. Win Together. 셀러를 위한 방송·배틀·정산을 한 곳에서.
            </p>
            <div className={styles.heroCtas}>
              <a href="/login" className={styles.primaryCta}>
                셀러로 시작하기
                <ArrowRight />
              </a>
              <a href="/login" className={styles.secondaryCta}>
                로그인
              </a>
            </div>
            <div className={styles.tags}>
              <span className={styles.tag}>#트렌디한</span>
              <span className={styles.tag}>#에너지넘치는</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroImageWrap}>
              <Image
                src="/mascot.png"
                alt="Crucru 마스코트"
                fill
                priority
                sizes="(max-width: 900px) 80vw, 420px"
                className={styles.heroImage}
              />
            </div>
            <span className={styles.sticker}>WIN TOGETHER!</span>
            <div className={styles.jackpot}>
              <span className={styles.jackpotLabel}>CURRENT JACKPOT</span>
              <span className={styles.jackpotValue}>₩1,234,567</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className={styles.features}>
          {features.map((f) => (
            <article key={f.title} className={styles.featureCard}>
              <span className={styles.featureEmoji}>{f.emoji}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </article>
          ))}
        </section>

        <footer className={styles.footer}>
          ★ 함께 만드는 승부, 함께 얻는 가치 · © Crucru
        </footer>
      </main>
    </>
  );
}
