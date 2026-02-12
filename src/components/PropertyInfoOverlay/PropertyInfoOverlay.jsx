import React from 'react';
import styles from './PropertyInfoOverlay.module.css';

const PropertyInfoOverlay = ({ isVisible, children }) => {
return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.content}>
            {children}
        </div>
    </div>
)
}

export default PropertyInfoOverlay;