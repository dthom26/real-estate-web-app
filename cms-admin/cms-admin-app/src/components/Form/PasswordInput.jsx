import React, { useState } from "react";

const wrapperStyle = { marginBottom: 12 };
const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 14,
  color: "#111",
};
const inputRow = { display: "flex", alignItems: "center", gap: 8 };
const inputStyle = {
  flex: 1,
  padding: "10px 12px",
  fontSize: 14,
  borderRadius: 6,
  border: "1px solid #ccc",
};
const toggleStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
};
const errorStyle = { color: "#b00020", marginTop: 6, fontSize: 13 };

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={wrapperStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label} {required ? <span aria-hidden>•</span> : null}
        </label>
      )}
      <div style={inputRow}>
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-required={required || undefined}
          aria-invalid={!!error}
          style={inputStyle}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          style={toggleStyle}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error && (
        <div id={`${id}-error`} style={errorStyle} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
