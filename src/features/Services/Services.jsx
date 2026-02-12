import React, { useEffect, useRef, useState } from "react";
import styles from "./Services.module.css";
import { servicesData } from "../../data/services";
import BaseCard from "../../components/BaseCard/BaseCard";

export default function Services() {
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

  return (
    <section ref={sectionRef} className={`${styles.servicesSection} section`}>
      <h2 className={isVisible ? styles.fadeInUp : ""}>Our Services</h2>
      <div className={styles.servicesGrid}>
        {servicesData.map((service, idx) => (
          <BaseCard
            key={idx}
            variant="elevated"
            clickable={true}
            className={`${styles.serviceCard} ${
              isVisible ? styles.fadeInUp : ""
            }`}
            style={{
              animationDelay: `${0.2 + idx * 0.1}s`,
            }}
          >
            <BaseCard.Image
              src={service.image}
              alt={service.title}
              cover={true}
            />
            <BaseCard.Content>
              <BaseCard.Title>{service.title}</BaseCard.Title>
              <BaseCard.Body>
                <p>{service.description}</p>
              </BaseCard.Body>
            </BaseCard.Content>
            <BaseCard.Footer>
              <BaseCard.Actions>
                <button>Learn More</button>
                <button className="primary">Get Started</button>
              </BaseCard.Actions>
            </BaseCard.Footer>
          </BaseCard>
        ))}
      </div>
    </section>
  );
}
