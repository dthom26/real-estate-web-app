import React, { useState } from "react";
import BaseCard from "../../components/BaseCard/BaseCard";
import styles from "./GalleryCarousel3D.module.css";
import { galleryData } from "../../data/gallery";
import PropertyInfoOverlay from "../../components/PropertyInfoOverlay/PropertyInfoOverlay";


export default function GalleryCarousel3D() {
  const [current, setCurrent] = useState(0);
  const total = galleryData.length;
  const goPrev = () =>
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goNext = () =>
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

  // Only show 3 slides: left, center, right
  const getSlideClass = (idx) => {
    if (idx === current) return styles.active;
    if (idx === (current === 0 ? total - 1 : current - 1)) return styles.left;
    if (idx === (current === total - 1 ? 0 : current + 1)) return styles.right;
    return styles.hidden;
  };

  return (
    <section className={"section " + styles.carousel3dSection}>
      <h2 className={styles.carouselTitle}>Featured Listings</h2>
      <div className={styles.carousel3dContainer}>
        {galleryData.map((item, idx) => (
          <div
            key={item.id}
            className={styles.carousel3dSlide + " " + getSlideClass(idx)}
            aria-hidden={idx !== current}
          >
            <BaseCard
              className={styles.galleryCard}
              variant="elevated"
              clickable
            >
              <div className={styles.imageShadowBorder}>
                <BaseCard.Image src={item.image} alt={item.alt} cover />
                  <PropertyInfoOverlay isVisible={idx === current}>
                    {item.address && <p>{item.address}</p>}
                    {item.price && <h3>{item.price}</h3>}
                    <div className={styles.propertyDetails}>
                      {item.bedrooms && <span>{item.bedrooms} bd</span>}
                      {item.bathrooms && <span>{item.bathrooms} ba</span>}
                      {item.sqft && <span>{item.sqft} sqft</span>}
                    </div>
                  </PropertyInfoOverlay>
              </div>
            </BaseCard>
            
          </div>
        ))}
      </div>
      <div className={styles.arrowRow}>
        <button
          onClick={goPrev}
          aria-label="Previous image"
          className={styles.arrowBtn + " " + styles.left}
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
        <button
          onClick={goNext}
          aria-label="Next image"
          className={styles.arrowBtn + " " + styles.right}
        >
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>
      {/* <div className={styles.pagination}>
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
      </div> */}

      <div className={styles.srOnly} aria-live="polite">
        Image {current + 1} of {total}
      </div>
    </section>
  );
}
