import Image from "next/image";
import styles from "./page.module.css";

const categories = [
  { label: "전체", icon: "🔥", hot: true, active: true },
  { label: "패션", icon: "👗" },
  { label: "뷰티", icon: "💄" },
  { label: "푸드", icon: "🍔" },
  { label: "테크", icon: "💻" },
];

const lives = [
  { img: "/home/live1.png", title: "뷰티 크루 BATTLE 시작!", tier: "DIA", viewers: "1.2k", score: "45k" },
  { img: "/home/live2.png", title: "야식 배틀: 떡볶이 vs 치킨", tier: "GOLD", viewers: "980", score: "12k" },
];

const crew = [
  { name: "HoneyBee", rank: 1, img: "/home/crew1.png" },
  { name: "PowerZ", rank: 2, color: "#7b2ff7" },
  { name: "GamerX", rank: 3, color: "#00b8a9" },
  { name: "LillyP", rank: 4, color: "#ffb703" },
];

const navTabs = [
  { label: "홈", icon: "🏠", active: true },
  { label: "배틀", icon: "⚔️" },
  { label: "스토어", icon: "🛍️" },
  { label: "마이", icon: "👤" },
];

export default function HomePage() {
  return (
    <div className={styles.stage}>
      <div className={styles.app}>
        {/* Top bar — login top-right */}
        <header className={styles.topbar}>
          <span className={styles.logo}>Crucru</span>
          <div className={styles.search}>
            <span className={styles.searchIcon}>🔍</span>
            <span className={styles.searchText}>검색</span>
          </div>
          <a href="/login" className={styles.loginBtn}>
            로그인
          </a>
        </header>

        <div className={styles.scroll}>
          {/* Hero banner */}
          <section className={styles.hero}>
            <Image src="/home/hero.png" alt="" fill sizes="430px" className={styles.heroImg} priority />
            <div className={styles.heroOverlay}>
              <h2 className={styles.heroTitle}>크루 배틀 시즌 12 오픈!</h2>
              <p className={styles.heroSub}>지금 참여하고 상금 ₩1,234,567의 주인공이 되세요</p>
            </div>
            <div className={styles.dots}>
              <span className={styles.dotActive} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </section>

          {/* Jackpot */}
          <section className={styles.jackpot}>
            <div className={styles.jackpotText}>
              <span className={styles.jackpotDday}>D-12 남아있음</span>
              <span className={styles.jackpotLabel}>CURRENT JACKPOT</span>
              <span className={styles.jackpotValue}>₩1,234,567</span>
            </div>
            <Image src="/home/jackpot.png" alt="" width={92} height={92} className={styles.jackpotImg} />
          </section>

          {/* Categories */}
          <section className={styles.cats}>
            {categories.map((c) => (
              <div key={c.label} className={styles.cat}>
                <div className={`${styles.catIcon} ${c.active ? styles.catIconActive : ""}`}>
                  <span>{c.icon}</span>
                  {c.hot && <span className={styles.hotBadge}>HOT</span>}
                </div>
                <span className={styles.catLabel}>{c.label}</span>
              </div>
            ))}
          </section>
          <div className={styles.tabs}>
            <span className={styles.tabActive}>추천</span>
            <span className={styles.tab}>팔로잉</span>
          </div>

          {/* Live streaming */}
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}>라이브 스트리밍</h3>
              <span className={styles.liveLabel}>● LIVE</span>
              <a className={styles.more}>더보기 ›</a>
            </div>
            <div className={styles.liveRow}>
              {lives.map((l) => (
                <article key={l.title} className={styles.liveCard}>
                  <div className={styles.liveThumb}>
                    <Image src={l.img} alt="" fill sizes="200px" className={styles.liveImg} />
                    <span className={styles.liveBadge}>LIVE</span>
                    <span className={styles.tierBadge}>{l.tier}</span>
                    <span className={styles.viewers}>👁 {l.viewers}</span>
                    <div className={styles.liveBottom}>
                      <span className={styles.liveCardTitle}>{l.title}</span>
                      <span className={styles.score}>Score: {l.score}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Top crew */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>금주 TOP 크루 ✨</h3>
            <div className={styles.crewRow}>
              {crew.map((m) => (
                <div key={m.name} className={styles.crew}>
                  <div className={styles.crewAvatarWrap}>
                    {m.img ? (
                      <Image src={m.img} alt="" width={64} height={64} className={styles.crewImg} />
                    ) : (
                      <div className={styles.crewImg} style={{ background: m.color }} />
                    )}
                    <span className={styles.crewRank}>RANK {m.rank}</span>
                  </div>
                  <span className={styles.crewName}>{m.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>예고 라이브</h3>
            <article className={styles.upcoming}>
              <div className={styles.upcomingThumb}>🛍️</div>
              <div className={styles.upcomingText}>
                <span className={styles.upcomingTime}>오늘 오후 8:00</span>
                <span className={styles.upcomingTitle}>신규 스트릿 브랜드 런칭 배틀</span>
                <span className={styles.upcomingHost}>MC Cru & Special Guest</span>
              </div>
              <button className={styles.notifyBtn}>알림받기</button>
            </article>
          </section>

          <div style={{ height: 16 }} />
        </div>

        {/* Bottom nav */}
        <nav className={styles.bottomNav}>
          {navTabs.map((t) => (
            <div key={t.label} className={`${styles.navItem} ${t.active ? styles.navActive : ""}`}>
              <span className={styles.navIcon}>{t.icon}</span>
              <span className={styles.navLabel}>{t.label}</span>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
