import React from "react";

const containerStyle = { marginBottom: 12 };
const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 14,
  color: "#111",
};
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  borderRadius: 6,
  border: "1px solid #ccc",
};
const errorStyle = { color: "#b00020", marginTop: 6, fontSize: 13 };

const Input = React.forwardRef(function Input(
  {
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    name,
    required,
    error,
  },
  ref,
) {
  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label} {required ? <span aria-hidden>•</span> : null}
        </label>
      )}
      <input
        id={id}
        name={name || id}
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-required={required || undefined}
        aria-invalid={!!error}
        style={inputStyle}
      />
      {error && (
        <div id={`${id}-error`} style={errorStyle} role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

export default Input;
