import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const navGroups = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", path: "/admin", end: true }],
  },
  {
    label: "Listings",
    items: [{ name: "Properties", path: "/admin/properties" }],
  },
  {
    label: "Content",
    items: [
      { name: "Reviews", path: "/admin/reviews" },
      { name: "Services", path: "/admin/services" },
      { name: "Content", path: "/admin/content" },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const sidebarClass = [styles.sidebar, isOpen ? styles.sidebarOpen : null]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={sidebarClass} aria-label="Admin navigation">
      <div className={styles.brand}>
        CMS Admin
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close navigation"
        >
          ✕
        </button>
      </div>
      <div className={styles.nav}>
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className={styles.groupLabel}>{group.label}</div>
            <ul className={styles.list}>
              {group.items.map((item) => (
                <li className={styles.item} key={item.name}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [styles.link, isActive ? styles.active : null]
                        .filter(Boolean)
                        .join(" ")
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
