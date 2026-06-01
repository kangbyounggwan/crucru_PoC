import styles from "./Header.module.css";

/** Top bar shown on the desktop (seller/admin) web. Login sits top-right. */
export default function Header() {
  return (
    <header className={styles.header}>
      <a href="/" className={styles.logo}>
        Crucru
      </a>
      <nav className={styles.nav}>
        <a href="#features" className={styles.navLink}>
          기능
        </a>
        <a href="#how" className={styles.navLink}>
          셀러 안내
        </a>
        <a href="/login" className={styles.loginBtn}>
          로그인
        </a>
      </nav>
    </header>
  );
}
