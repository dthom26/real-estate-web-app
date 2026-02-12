import React from 'react';
import styles from './Hero.module.css';
import Header from '../../components/Header/Header';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <Header />
      <div className={styles.heroContent}>
        <div className={styles.overlay}>
          <h1>Find Your Dream Home</h1>
          <p>With Jane Doe Realty, experience friendly, professional, and trustworthy service for all your real estate needs.</p>
          <a href="#contact" className={styles.ctaButton}>Contact Jane</a>
        </div>
      </div>
      <div className={styles.heroImage}>
        {/* Replace with actual hero image */}
        
      </div>
    </section>
  );
}
