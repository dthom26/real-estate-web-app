import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const navItems = [
  { name: "Dashboard", path: "/admin", end: true },
  { name: "Properties", path: "/admin/properties" },
  { name: "Reviews", path: "/admin/reviews" },
  { name: "Services", path: "/admin/services" },
  { name: "Content", path: "/admin/content" },
];

export default function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Admin navigation">
      <ul className={styles.list}>
        {navItems.map((item) => (
          <li className={styles.item} key={item.name}>
            <NavLink
              to={item.path}
              end={item.end}
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
    </nav>
  );
}
