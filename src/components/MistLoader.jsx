import React from "react";

export default function MistLoader({ text = "Loading..." }) {
  return (
    <div className="mist-loader">
      <div className="basin">
        <div className="ribbon" />
        <div className="ribbon" />
      </div>
      <span className="label">{text}</span>
    </div>
  );
}
