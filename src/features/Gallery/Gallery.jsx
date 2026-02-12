import React from "react";
import styles from "./Gallery.module.css";
import { galleryImages } from "../../data/gallery";
import BaseCard from "../../components/BaseCard/BaseCard";

export default function Gallery() {
  return (
    <section className={`${styles.gallerySection} section`}>
      <h2>Featured Listings</h2>
      <div className={styles.galleryGrid}>
        {galleryImages.map((img, idx) => (
          <BaseCard
            key={idx}
            image={img}
            variant="elevated"
            clickable={true}
            className={styles.galleryCard}
          >
            <BaseCard.Image src={img} cover />
          </BaseCard>
        ))}
      </div>
    </section>
  );
}
