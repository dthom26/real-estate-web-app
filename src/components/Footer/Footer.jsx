import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.info}>
        &copy; {new Date().getFullYear()} Jane Doe Realty. All rights reserved.
      </div>
      <div className={styles.socials}>
        {/* Add social icons/links here if needed */}
      </div>
    </footer>
  );
}
