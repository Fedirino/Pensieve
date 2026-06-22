import React from "react";

// Generated placeholder that matches the Pensieve visual identity
export default function BookPlaceholder({ title = "", style = {} }) {
  const initial = (title || "?")[0].toUpperCase();
  // Generate a subtle hue shift from the title for variety
  const hash = [...(title || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = (hash % 40) + 240; // stay in the indigo-purple range

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: `linear-gradient(135deg, hsl(${hue}, 30%, 18%) 0%, var(--midnight-soft) 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius)",
      border: "1px solid rgba(212,175,106,0.15)",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}>
      {/* Faint basin mark */}
      <svg width="40" height="30" viewBox="0 0 80 60" fill="none" style={{ opacity: 0.12, position: "absolute", top: "20%" }}>
        <path d="M8 12 C8 12 20 8 40 8 C60 8 72 12 72 12 L72 20 C72 20 68 44 40 44 C12 44 8 20 8 20 Z"
          stroke="var(--gold)" strokeWidth="2" fill="none" />
      </svg>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: "2.2rem",
        color: "var(--gold)",
        opacity: 0.6,
        fontWeight: 600,
      }}>
        {initial}
      </span>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: "0.65rem",
        color: "var(--lavender)",
        opacity: 0.4,
        marginTop: 4,
        maxWidth: "80%",
        textAlign: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {title}
      </span>
    </div>
  );
}
