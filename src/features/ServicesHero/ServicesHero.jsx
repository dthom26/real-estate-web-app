import React, { useEffect, useRef, useState } from "react";
import FeatureGrid from "../../components/FeatureGrid/FeatureGrid";
import styles from "./ServicesHero.module.css";

/**
 * ServicesHero Component
 *
 * LEARNING POINT: This component demonstrates the COMPOSITION pattern
 * - We're composing our FeatureGrid component with our data
 * - This component handles the "business logic" (what to display)
 * - FeatureGrid handles the "presentation logic" (how to display it)
 *
 * BENEFIT: FeatureGrid can be reused for other sections!
 */

// BEST PRACTICE: Define data structure near component or import from data file
// This makes the component's requirements clear
const servicesHeroData = [
  {
    id: "buying",
    title: "Buying Homes",
    description:
      "Expert guidance through every step of your home buying journey",
    image: "/src/assets/bailey-anselme-Bkp3gLygyeA-unsplash.jpg",
    link: "#buying", // Optional: Add navigation
  },
  {
    id: "selling",
    title: "Selling Homes",
    description:
      "Strategic marketing and negotiation to maximize your property value",
    image: "/src/assets/todd-kent-178j8tJrNlc-unsplash.jpg",
    link: "#selling",
  },
  {
    id: "consultation",
    title: "Consultation",
    description:
      "Personalized real estate advice tailored to your unique needs",
    image: "/src/assets/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg",
    link: "#consultation",
  },
];

export default function ServicesHero() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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
  }, []);

  /**
   * TEACHING MOMENT: Why separate this from the main Services component?
   *
   * 1. SINGLE RESPONSIBILITY: This component has one job - display hero grid
   * 2. REUSABILITY: Can use FeatureGrid elsewhere with different data
   * 3. MAINTAINABILITY: Easy to modify or replace without affecting other code
   * 4. TESTABILITY: Easier to test in isolation
   */

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
        {servicesHeroData.map((service, idx) => (
          <FeatureGrid.Item
            key={service.id} // BEST PRACTICE: Use stable IDs, not array index
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
