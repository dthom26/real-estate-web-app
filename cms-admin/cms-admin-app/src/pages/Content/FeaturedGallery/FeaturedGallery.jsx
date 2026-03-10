import { useState } from "react";
import { useFeaturedGallery } from "../../../hooks/useFeaturedGallery";
import styles from "./FeaturedGallery.module.css";

export default function FeaturedGallery() {
  const {
    featured,
    allProperties,
    loading,
    error,
    addToFeatured,
    removeFromFeatured,
    updateOrder,
  } = useFeaturedGallery();

  const [showModal, setShowModal] = useState(false);

  if (loading) return <div className={styles.status}>Loading...</div>;
  if (error)
    return <div className={styles.statusError}>Error: {error.message}</div>;

  const unfeatured = allProperties.filter((p) => !p.featured);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.description}>
          Manage which listings appear in the featured 3D gallery and control
          their display order.
        </p>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setShowModal(true)}
          disabled={unfeatured.length === 0}
          title={
            unfeatured.length === 0
              ? "All listings are already featured"
              : "Add a listing to the gallery"
          }
        >
          + Add Listing
        </button>
      </div>

      {featured.length === 0 ? (
        <p className={styles.empty}>
          No featured listings yet. Add one to get started.
        </p>
      ) : (
        <ul className={styles.list}>
          {featured.map((property, index) => (
            <li key={property._id} className={styles.listItem}>
              <div className={styles.itemImage}>
                {property.featuredImage ||
                (Array.isArray(property.images) && property.images[0]) ? (
                  <img
                    src={property.featuredImage || property.images[0]}
                    alt={property.alt}
                  />
                ) : (
                  <div className={styles.noImage}>No image</div>
                )}
              </div>

              <div className={styles.itemInfo}>
                <span className={styles.itemAddress}>
                  {property.address || property.alt}
                </span>
                <span className={styles.itemPrice}>{property.price}</span>
              </div>

              <div className={styles.itemControls}>
                <button
                  type="button"
                  className={styles.orderBtn}
                  onClick={() =>
                    updateOrder(
                      property._id,
                      (property.featuredOrder ?? index) - 1,
                    )
                  }
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  ▲
                </button>
                <span className={styles.orderNum}>{index + 1}</span>
                <button
                  type="button"
                  className={styles.orderBtn}
                  onClick={() =>
                    updateOrder(
                      property._id,
                      (property.featuredOrder ?? index) + 1,
                    )
                  }
                  disabled={index === featured.length - 1}
                  aria-label="Move down"
                >
                  ▼
                </button>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeFromFeatured(property._id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Select a Listing to Feature</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            {unfeatured.length === 0 ? (
              <p className={styles.empty}>All listings are already featured.</p>
            ) : (
              <ul className={styles.modalList}>
                {unfeatured.map((property) => (
                  <li key={property._id} className={styles.modalItem}>
                    <div className={styles.modalItemImage}>
                      {Array.isArray(property.images) && property.images[0] ? (
                        <img src={property.images[0]} alt={property.alt} />
                      ) : (
                        <div className={styles.noImage}>No image</div>
                      )}
                    </div>
                    <div className={styles.modalItemInfo}>
                      <span className={styles.itemAddress}>
                        {property.address || property.alt}
                      </span>
                      <span className={styles.itemPrice}>{property.price}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.addBtn}
                      onClick={() => {
                        addToFeatured(property._id);
                        setShowModal(false);
                      }}
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
