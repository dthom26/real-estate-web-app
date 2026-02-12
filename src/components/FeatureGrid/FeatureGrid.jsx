import React from "react";
import styles from "./FeatureGrid.module.css";

/**
 * FeatureGrid Component
 *
 * A reusable component that displays content in a responsive grid layout
 * with background images and text overlays.
 *
 * DESIGN PATTERN: Compound Component Pattern
 * - Main component (FeatureGrid) manages the grid layout
 * - Child component (FeatureItem) handles individual items
 * - This keeps concerns separated and makes the API intuitive
 *
 * @example
 * <FeatureGrid>
 *   <FeatureGrid.Item image="..." title="..." link="/path" />
 *   <FeatureGrid.Item image="..." title="..." link="/path" />
 * </FeatureGrid>
 */
const FeatureGrid = ({ children, className = "", columns = 3 }) => {
  return (
    <div
      className={`${styles.featureGrid} ${className}`}
      style={{ "--columns": columns }} // CSS custom property for flexibility
    >
      {children}
    </div>
  );
};

/**
 * FeatureItem Component
 *
 * Individual item within the FeatureGrid
 *
 * BEST PRACTICES:
 * 1. Uses semantic HTML (<article> for content)
 * 2. Background image via CSS for better control
 * 3. Overlay for text readability
 * 4. Keyboard accessible (when clickable)
 */
const FeatureItem = ({
  image,
  title,
  description = null,
  link = null,
  onClick = null,
  className = "",
  style = {},
}) => {
  // PATTERN: Determine if this should be interactive
  const isInteractive = link || onClick;

  // PATTERN: Use the right semantic element
  const Component = link ? "a" : "article";

  // PATTERN: Build props object conditionally
  const componentProps = {
    className: `${styles.featureItem} ${isInteractive ? styles.interactive : ""} ${className}`,
    style,
    ...(link && { href: link }),
    ...(onClick && { onClick }),
    ...(isInteractive && { role: link ? undefined : "button", tabIndex: 0 }),
  };

  return (
    <Component {...componentProps}>
      {/* Background Image: Using inline style for dynamic images */}
      <div
        className={styles.imageBackground}
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden="true" // Decorative image, not needed for screen readers
      />

      {/* Overlay: Provides contrast for text readability */}
      <div className={styles.overlay} aria-hidden="true" />

      {/* Content: Always visible and readable */}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </Component>
  );
};

// PATTERN: Compound Components - Attach child to parent
FeatureGrid.Item = FeatureItem;

export default FeatureGrid;
