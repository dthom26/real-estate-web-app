import { useState } from "react";
import About from "./About/About";
import Contact from "./Contact/Contact";
import HeroSection from "./HeroSection/HeroSection";
import FeaturedGallery from "./FeaturedGallery/FeaturedGallery";
import styles from "./Content.module.css";

/**
 * Content - Page container for singleton content sections.
 * Manages accordion open/close state — only one section open at a time.
 */
export default function Content() {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>Site Content</h1>
        <p>Manage the content displayed on your public-facing pages.</p>
      </div>

      <div className={styles.accordion}>
        {/* Hero Section */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => toggle("hero")}
            aria-expanded={openSection === "hero"}
          >
            <span>Hero Section</span>
            <span
              className={
                openSection === "hero" ? styles.chevronOpen : styles.chevron
              }
            >
              ▼
            </span>
          </button>
          <div
            className={`${styles.accordionBody}${
              openSection === "hero" ? "" : ` ${styles.hidden}`
            }`}
          >
            <HeroSection />
          </div>
        </div>

        {/* About Section */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => toggle("about")}
            aria-expanded={openSection === "about"}
          >
            <span>About Section</span>
            <span
              className={
                openSection === "about" ? styles.chevronOpen : styles.chevron
              }
            >
              ▼
            </span>
          </button>
          <div
            className={`${styles.accordionBody}${
              openSection === "about" ? "" : ` ${styles.hidden}`
            }`}
          >
            <About />
          </div>
        </div>

        {/* Featured 3D Gallery */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => toggle("featuredGallery")}
            aria-expanded={openSection === "featuredGallery"}
          >
            <span>Featured 3D Gallery</span>
            <span
              className={
                openSection === "featuredGallery"
                  ? styles.chevronOpen
                  : styles.chevron
              }
            >
              ▼
            </span>
          </button>
          <div
            className={`${styles.accordionBody}${
              openSection === "featuredGallery" ? "" : ` ${styles.hidden}`
            }`}
          >
            <FeaturedGallery />
          </div>
        </div>

        {/* Contact Section */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            className={styles.accordionHeader}
            onClick={() => toggle("contact")}
            aria-expanded={openSection === "contact"}
          >
            <span>Contact Section</span>
            <span
              className={
                openSection === "contact" ? styles.chevronOpen : styles.chevron
              }
            >
              ▼
            </span>
          </button>
          <div
            className={`${styles.accordionBody}${
              openSection === "contact" ? "" : ` ${styles.hidden}`
            }`}
          >
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
}
