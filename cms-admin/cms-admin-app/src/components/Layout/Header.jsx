import styles from "./Header.module.css";
import LogoutButton from "../Auth/LogoutButton";

export default function Header({ onMenuToggle }) {
  return (
    <header className={styles.header}>
      <button
        className={styles.menuToggle}
        onClick={onMenuToggle}
        aria-label="Open navigation"
      >
        <span />
        <span />
        <span />
      </button>
      <div className={styles.brand}>CMS Admin</div>
      <div className={styles.actions}>
        <LogoutButton />
      </div>
    </header>
  );
}
