import React, { useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>Jane Doe Realty</div>
        <button
          className={styles.hamburger}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>
      <nav
        className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ""}`}
      >
        <a href="#about" onClick={closeMobileMenu}>
          About
        </a>
        <a href="#services" onClick={closeMobileMenu}>
          Services
        </a>
        <a href="#gallery" onClick={closeMobileMenu}>
          Gallery
        </a>
        <a href="#contact" onClick={closeMobileMenu}>
          Contact
        </a>
      </nav>
    </header>
  );
}
