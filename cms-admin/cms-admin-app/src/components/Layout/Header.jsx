import styles from "./Header.module.css";
import LogoutButton from "../Auth/LogoutButton";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>CMS Admin</div>
      <div className={styles.actions}>
        <LogoutButton />
      </div>
    </header>
  );
}
