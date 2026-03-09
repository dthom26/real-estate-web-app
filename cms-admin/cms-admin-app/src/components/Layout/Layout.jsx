import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./SideBar/Sidebar";
import styles from "./Layout.module.css";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className={styles.layout}>
      <Header onMenuToggle={toggleSidebar} />
      <div className={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        {sidebarOpen && (
          <div
            className={styles.overlay}
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
