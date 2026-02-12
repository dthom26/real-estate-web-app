import styles from './BaseCard.module.css';

const BaseCard = ({ children, className = '', variant = 'default', clickable = false, ...props }) => {
    const cardClasses = [
        styles.baseCard,
        styles[variant],
        clickable ? styles.clickable : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div 
            className={cardClasses} 
            role={clickable ? 'button' : 'article'}
            tabIndex={clickable ? 0 : undefined}
            {...props}
        >
            {children}
        </div>
    );
};

const Header = ({ children, className = '' }) => (
    <div className={`${styles.cardHeader} ${className}`}>{children}</div>
);

const Title = ({ children, className = '', as: Component = 'h2' }) => (
    <Component className={`${styles.cardTitle} ${className}`}>{children}</Component>
);

const Subtitle = ({ children, className = '', as: Component = 'h3' }) => (
    <Component className={`${styles.cardSubtitle} ${className}`}>{children}</Component>
);

const Body = ({ children, className = '' }) => (
    <div className={`${styles.cardBody} ${className}`}>{children}</div>
);

const Content = ({ children, className = '' }) => (
    <div className={`${styles.cardContent} ${className}`}>{children}</div>
);

const Image = ({ src, alt = '', className = '', cover = false, ...rest }) => (
    <div className={`${styles.imageWrapper} ${cover ? styles.coverImage : ''}`}>
        <img 
            className={`${styles.cardImage} ${className}`} 
            src={src} 
            alt={alt} 
            loading="lazy"
            {...rest} 
        />
    </div>
);

const Footer = ({ children, className = '' }) => (
    <div className={`${styles.cardFooter} ${className}`}>{children}</div>
);

const Badge = ({ children, className = '', variant = 'primary' }) => (
    <span className={`${styles.badge} ${styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} ${className}`}>
        {children}
    </span>
);

const Actions = ({ children, className = '' }) => (
    <div className={`${styles.cardActions} ${className}`}>{children}</div>
);

// Attach subcomponents to main component
BaseCard.Header = Header;
BaseCard.Title = Title;
BaseCard.Subtitle = Subtitle;
BaseCard.Body = Body;
BaseCard.Content = Content;
BaseCard.Image = Image;
BaseCard.Footer = Footer;
BaseCard.Badge = Badge;
BaseCard.Actions = Actions;

export default BaseCard;