import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./SideBar/Sidebar";
import styles from "./Layout.module.css";
// Layout component placeholder
export default function Layout() {
  return (
    <div className={styles.layout}>
        <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}><Outlet /></main>
      </div>
    </div>
  );
}
