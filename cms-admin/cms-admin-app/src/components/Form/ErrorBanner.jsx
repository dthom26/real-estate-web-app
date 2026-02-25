import React from "react";

const bannerStyle = {
  background: "#fee",
  border: "1px solid #f2a",
  color: "#700",
  padding: "10px 12px",
  borderRadius: 6,
  marginBottom: 12,
};

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div role="alert" aria-live="assertive" style={bannerStyle}>
      {message}
    </div>
  );
}
