import React from "react";

export default function StarRating({ value = 0, onChange, size = "1.3rem", readOnly = false }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`star ${i <= value ? "filled" : ""}`}
          style={{ fontSize: size, cursor: readOnly ? "default" : "pointer" }}
          onClick={() => !readOnly && onChange?.(i === value ? 0 : i)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
