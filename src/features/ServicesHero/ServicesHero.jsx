import React, { useEffect, useRef, useState } from "react";
import FeatureGrid from "../../components/FeatureGrid/FeatureGrid";
import styles from "./ServicesHero.module.css";
import { useServices } from "../../hooks/useServices";

export default function ServicesHero() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { data, loading, error } = useServices();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }, // Trigger when 10% of section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [loading]);

  if (loading) return null;
  if (error) return null;

  return (
    <section
      ref={sectionRef}
      className={styles.servicesHero}
      aria-label="Featured Services"
    >
      {/* 
        ACCESSIBILITY NOTE: 
        - aria-label provides context for screen readers
        - Each FeatureGrid.Item will be navigable
      */}

      <FeatureGrid columns={3}>
        {data.map((service, idx) => (
          <FeatureGrid.Item
            key={service._id}
            image={service.image}
            title={service.title}
            description={service.description}
            link={service.link}
            className={isVisible ? styles.fadeInUp : ""}
            style={{
              animationDelay: `${idx * 0.15}s`,
            }}
          />
        ))}
      </FeatureGrid>
    </section>
  );
}

/**
 * EXTENSION IDEAS for you to practice:
 *
 * 1. ADD ANIMATION:
 *    - Install framer-motion: npm install framer-motion
 *    - Wrap items with <motion.div> for scroll animations
 *
 * 2. MAKE IT DYNAMIC:
 *    - Fetch data from an API instead of hardcoding
 *    - Use useState/useEffect to load data
 *
 * 3. ADD FILTERING:
 *    - Add category prop to data
 *    - Create filter buttons above grid
 *    - Use useState to track active filter
 *
 * 4. IMPROVE IMAGES:
 *    - Use next/image or react-lazy-load for optimization
 *    - Add loading states and skeletons
 *
 * 5. ENHANCE INTERACTIONS:
 *    - Add click handlers to track analytics
 *    - Add modal popup on click instead of navigation
 *    - Add "share" functionality
 */
