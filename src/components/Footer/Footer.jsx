import React from "react";
import styles from "./Footer.module.css";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

const socials = [
  { href: "https://facebook.com", label: "Facebook", Icon: FaFacebookF },
  { href: "https://instagram.com", label: "Instagram", Icon: FaInstagram },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: FaLinkedinIn },
  { href: "https://x.com", label: "X (Twitter)", Icon: FaXTwitter },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.socials}>
        {socials.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={styles.socialLink}
          >
            <Icon />
          </a>
        ))}
      </div>
      <div className={styles.info}>
        &copy; {new Date().getFullYear()} Jane Doe Realty. All rights reserved.
      </div>
    </footer>
  );
}
