import Image from "next/image";
import styles from "./page.module.css";

const navLinks = [
  { label: "홈", active: true },
  { label: "배틀" },
  { label: "스토어" },
  { label: "마이" },
];

const categories = [
  { label: "전체", icon: "🔥", hot: true, active: true },
  { label: "패션", icon: "👗" },
  { label: "뷰티", icon: "💄" },
  { label: "푸드", icon: "🍔" },
  { label: "테크", icon: "💻" },
];

const lives = [
  { img: "/home/live1.png", title: "뷰티 크루 BATTLE 시작!", host: "HoneyBee", tier: "DIA", viewers: "1.2k", score: "45k" },
  { img: "/home/live2.png", title: "야식 배틀: 떡볶이 vs 치킨", host: "PowerZ", tier: "GOLD", viewers: "980", score: "12k" },
  { img: "/home/live1.png", title: "스트릿 패션 픽 LIVE", host: "GamerX", tier: "PLAT", viewers: "640", score: "8.1k" },
  { img: "/home/live2.png", title: "심야 테크 언박싱", host: "LillyP", tier: "GOLD", viewers: "510", score: "6.7k" },
];

const crew = [
  { name: "HoneyBee", rank: 1, img: "/home/crew1.png" },
  { name: "PowerZ", rank: 2, color: "#7b2ff7" },
  { name: "GamerX", rank: 3, color: "#00b8a9" },
  { name: "LillyP", rank: 4, color: "#ffb703" },
  { name: "NeoCru", rank: 5, color: "#ff5c8a" },
  { name: "BlueJay", rank: 6, color: "#2f80ed" },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Top navigation */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>Crucru</span>
          <nav className={styles.nav}>
            {navLinks.map((n) => (
              <a key={n.label} className={n.active ? styles.navActive : styles.navLink}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className={styles.search}>
            <span className={styles.searchIcon}>🔍</span>
            <span className={styles.searchText}>크루 · 셀러 · 상품 검색</span>
          </div>
          <a href="/login" className={styles.loginBtn}>
            로그인
          </a>
        </div>
      </header>

      <main className={styles.main}>
        {/* Hero + Jackpot */}
        <section className={styles.heroRow}>
          <div className={styles.hero}>
            <Image src="/home/hero.png" alt="" fill sizes="(max-width:1000px) 100vw, 760px" className={styles.heroImg} priority />
            <div className={styles.heroOverlay}>
              <span className={styles.heroBadge}>LIVE BATTLE</span>
              <h2 className={styles.heroTitle}>크루 배틀 시즌 12 오픈!</h2>
              <p className={styles.heroSub}>지금 참여하고 상금 ₩1,234,567의 주인공이 되세요</p>
            </div>
            <div className={styles.dots}>
              <span className={styles.dotActive} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>

          <aside className={styles.jackpot}>
            <Image src="/home/jackpot.png" alt="" width={96} height={96} className={styles.jackpotImg} />
            <span className={styles.jackpotDday}>D-12 남아있음</span>
            <span className={styles.jackpotLabel}>CURRENT JACKPOT</span>
            <span className={styles.jackpotValue}>₩1,234,567</span>
            <button className={styles.jackpotCta}>잭팟 참여하기</button>
          </aside>
        </section>

        {/* Categories */}
        <section className={styles.catRow}>
          <div className={styles.cats}>
            {categories.map((c) => (
              <div key={c.label} className={`${styles.cat} ${c.active ? styles.catActive : ""}`}>
                <span className={styles.catIcon}>{c.icon}</span>
                {c.label}
                {c.hot && <span className={styles.hotBadge}>HOT</span>}
              </div>
            ))}
          </div>
          <div className={styles.tabs}>
            <span className={styles.tabActive}>추천</span>
            <span className={styles.tab}>팔로잉</span>
          </div>
        </section>

        {/* Live streaming */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>라이브 스트리밍</h3>
            <span className={styles.liveLabel}>● LIVE</span>
            <a className={styles.more}>더보기 ›</a>
          </div>
          <div className={styles.liveGrid}>
            {lives.map((l, i) => (
              <article key={i} className={styles.liveCard}>
                <div className={styles.liveThumb}>
                  <Image src={l.img} alt="" fill sizes="(max-width:1000px) 50vw, 280px" className={styles.liveImg} />
                  <span className={styles.liveBadge}>LIVE</span>
                  <span className={styles.tierBadge}>{l.tier}</span>
                  <span className={styles.viewers}>👁 {l.viewers}</span>
                </div>
                <div className={styles.liveMeta}>
                  <span className={styles.liveCardTitle}>{l.title}</span>
                  <div className={styles.liveMetaRow}>
                    <span className={styles.liveHost}>{l.host}</span>
                    <span className={styles.score}>Score {l.score}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Two-column: Top crew + Upcoming */}
        <section className={styles.twoCol}>
          <div className={styles.panel}>
            <h3 className={styles.sectionTitle}>금주 TOP 크루 ✨</h3>
            <div className={styles.crewRow}>
              {crew.map((m) => (
                <div key={m.name} className={styles.crew}>
                  <div className={styles.crewAvatarWrap}>
                    {m.img ? (
                      <Image src={m.img} alt="" width={68} height={68} className={styles.crewImg} />
                    ) : (
                      <div className={styles.crewImg} style={{ background: m.color }} />
                    )}
                    <span className={styles.crewRank}>{m.rank}</span>
                  </div>
                  <span className={styles.crewName}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
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
          </div>
        </section>

        <footer className={styles.footer}>★ 함께 만드는 승부, 함께 얻는 가치 · © Crucru</footer>
      </main>
    </div>
  );
}
