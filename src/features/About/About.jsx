import React, { useEffect, useRef, useState } from "react";
import styles from "./About.module.css";
import { useAbout } from "../../hooks/useAbout";
import TextImageSection from "../../components/TextImageSection/TextImageSection";

export default function About() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const {data, loading, error} = useAbout();
  

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
  }, [loading]);

  if (loading) return null;
  if (error) return null;

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
            src={data.image}
            alt={data.header}
          />
        </div>
        <div className={styles.contentWrapper}>
          <TextImageSection.Content>
            <TextImageSection.Header>
              {data.header}
            </TextImageSection.Header>
            <TextImageSection.TextContent>
              {data.textContent}
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
