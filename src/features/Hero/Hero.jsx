import React from 'react';
import styles from './Hero.module.css';
import Header from '../../components/Header/Header';
import { useHero } from '../../hooks/useHero';

export default function Hero() {
  const { data, loading, error } = useHero();
  
  if (loading) return null;
  if (error) return null;
  
  return (
    <section className={styles.heroSection}>
      <Header />
      <div className={styles.heroContent}>
        <div className={styles.overlay}>
          <h1>{data.title}</h1>
          <p>{data.subtitle}</p>
          <a href="#contact" className={styles.ctaButton}>{data.ctaText}</a>
        </div>
      </div>
      {/* <div className={styles.heroImage}>
       
        
      </div> */}
    </section>
  );
}
