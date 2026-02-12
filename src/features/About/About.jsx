import React, { useEffect, useRef, useState } from "react";
import styles from "./About.module.css";
import { aboutData } from "../../data/about";
import TextImageSection from "../../components/TextImageSection/TextImageSection";

export default function About() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 },
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

  return (
    <section
      ref={sectionRef}
      className={`${styles.aboutSection} section ${
        isVisible ? styles.animate : ""
      }`}
    >
      <TextImageSection imageFirst={false}>
        <div className={styles.imageWrapper}>
          <TextImageSection.Image
            src={aboutData.image}
            alt={aboutData.header}
          />
        </div>
        <div className={styles.contentWrapper}>
          <TextImageSection.Content>
            <TextImageSection.Header>
              {aboutData.header}
            </TextImageSection.Header>
            <TextImageSection.TextContent>
              {aboutData.textContent}
            </TextImageSection.TextContent>
            <TextImageSection.Actions>
              <button>Learn More</button>
            </TextImageSection.Actions>
          </TextImageSection.Content>
        </div>
      </TextImageSection>
    </section>
  );
}
