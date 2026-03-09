import styles from "./Button.module.css";

/**
 * Shared button component.
 *
 * @param {'primary'|'secondary'|'danger'} variant
 * @param {'sm'|'md'} size
 * @param {boolean} fullWidth
 * @param {boolean} disabled
 * @param {'button'|'submit'|'reset'} type
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
