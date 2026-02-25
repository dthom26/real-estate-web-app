import React from "react";

const baseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  backgroundColor: "#0066ff",
  color: "#fff",
  fontSize: 15,
};

const disabledStyle = { opacity: 0.6, cursor: "not-allowed" };

export default function Button({ children, loading, style, ...rest }) {
  return (
    <button
      {...rest}
      style={{
        ...baseStyle,
        ...(rest.disabled ? disabledStyle : {}),
        ...style,
      }}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
