import React, { useState, useEffect } from "react";
import BaseCard from "../../components/BaseCard/BaseCard";
import styles from "./GalleryCarousel3D.module.css";
import { useCarousel } from "../../hooks/useCarousel";
import PropertyInfoOverlay from "../../components/PropertyInfoOverlay/PropertyInfoOverlay";

export default function GalleryCarousel3D() {
  const { data: galleryData, loading, error } = useCarousel(5);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const items = galleryData || [];
  const total = items.length;

  useEffect(() => {
    if (!loading) setCurrent(0);
  }, [loading]);

  useEffect(() => {
    if (current >= total) setCurrent(0);
  }, [total]);

  if (loading) return null; // or render a skeleton
  if (error) return <div>Sorry, featured listings are unavailable.</div>;
  if (!loading && total === 0)
    return <div>No featured listings right now.</div>;

  const goPrev = () => {
    if (isAnimating || total === 0) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 400);
  };

  const goNext = () => {
    if (isAnimating || total === 0) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 400);
  };

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
        {items.map((item, idx) => {
          const isNeighbor =
            idx === current ||
            idx === (current === 0 ? total - 1 : current - 1) ||
            idx === (current === total - 1 ? 0 : current + 1);
          return (
            <div
              key={item._id}
              className={styles.carousel3dSlide + " " + getSlideClass(idx)}
              aria-hidden={idx !== current}
            >
              <BaseCard
                className={styles.galleryCard}
                variant="elevated"
                clickable
              >
                <div className={styles.imageShadowBorder}>
                  <BaseCard.Image
                    src={item.image}
                    alt={item.alt}
                    cover
                    loading={isNeighbor ? "eager" : "lazy"}
                  />
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
          );
        })}
      </div>
      <div className={styles.arrowRow}>
        <button
          onClick={goPrev}
          aria-label="Previous image"
          className={styles.arrowBtn + " " + styles.left}
          disabled={isAnimating || total === 0}
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
        <button
          onClick={goNext}
          aria-label="Next image"
          className={styles.arrowBtn + " " + styles.right}
          disabled={isAnimating || total === 0}
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
