import React, { useState } from "react";
import BaseCard from "../../components/BaseCard/BaseCard";
import styles from "./GalleryCarousel.module.css";
import { useCarousel } from "../../hooks/useCarousel";

export default function GalleryCarousel() {
  const [current, setCurrent] = useState(0);
  const { data: galleryData = [] } = useCarousel(5);
  const items = galleryData || [];
  const total = items.length || 0;

  const goPrev = () =>
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goNext = () =>
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

  return (
    <section className={"section " + styles.carouselSection}>
      <h2 className={styles.carouselTitle}>Gallery</h2>
      <div className={styles.carouselContainer}>
        reviewsData
        <div className={styles.cardWrapper}>
          <BaseCard className={styles.galleryCard} variant="elevated" clickable>
            <div className={styles.imageShadowBorder}>
              {(() => {
                const item = items[current];
                const src = item ? item.image || item : undefined;
                return <BaseCard.Image src={src} cover />;
              })()}
            </div>
          </BaseCard>
        </div>
        <button
          onClick={goNext}
          aria-label="Next image"
          className={styles.arrowBtn + " " + styles.right}
        >
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>
      <div className={styles.pagination}>
        {galleryImages.map((_, idx) => (
          <button
            key={idx}
            className={
              styles.dot + (idx === current ? " " + styles.activeDot : "")
            }
            onClick={() => setCurrent(idx)}
            aria-label={`Go to image ${idx + 1}`}
            aria-current={idx === current ? "true" : undefined}
          />
        ))}
      </div>
      <div className={styles.srOnly} aria-live="polite">
        Image {current + 1} of {total}
      </div>
    </section>
  );
}
