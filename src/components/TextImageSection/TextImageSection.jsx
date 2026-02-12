import styles from "./TextImageSection.module.css";

const TextImageSection = ({ children, imageFirst = false, ...props }) => {
  return (
    <div
      className={`${styles.textImageSection} ${imageFirst ? styles.imageFirst : styles.textFirst}`}
      {...props}
    >
      {children}
    </div>
  );
};

const Header = ({ children, className = "" }) => (
  <h2 className={`${styles.sectionHeader} ${className}`}>{children}</h2>
);

const Image = ({ src, alt = "", className = "", cover = false, ...rest }) => (
  <div className={`${styles.imageWrapper} ${cover ? styles.coverImage : ""}`}>
    <img src={src} alt={alt} className={className} {...rest} />
  </div>
);

const TextContent = ({ children, className = "" }) => (
  <p className={`${styles.textContent} ${className}`}>{children}</p>
);

const Content = ({ children, className = "" }) => (
  <div className={`${styles.content} ${className}`}>
    <div className={styles.contentInner}>{children}</div>
  </div>
);

const Actions = ({ children, className = "" }) => (
  <div className={`${styles.sectionActions} ${className}`}>{children}</div>
);

// Attach subcomponents to main component
TextImageSection.Header = Header;
TextImageSection.Image = Image;
TextImageSection.Content = Content;
TextImageSection.TextContent = TextContent;
TextImageSection.Actions = Actions;

export default TextImageSection;
