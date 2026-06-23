import React from "react";

// Genre-inspired color palettes (background gradient start, accent line)
const GENRE_PALETTES = {
  "Fiction":      ["#2A1F4E", "#3D2D6B"],
  "Non-Fiction":  ["#1E2A3A", "#2A3F55"],
  "Sci-Fi":       ["#1A2535", "#1F3A4D"],
  "Fantasy":      ["#2D1F3D", "#4A2D5E"],
  "Mystery":      ["#1F1A2E", "#2D2440"],
  "Romance":      ["#3A1F2E", "#4D2A3D"],
  "History":      ["#2A2418", "#3D3525"],
  "Science":      ["#1A2A2A", "#243D3D"],
  "Philosophy":   ["#252030", "#383048"],
  "Biography":    ["#2A2220", "#3D3230"],
  "Self-Help":    ["#1F2A25", "#2A3D35"],
  "Poetry":       ["#2A1F35", "#3D2D4A"],
  "Art":          ["#2D2225", "#452D35"],
  "Other":        ["#222035", "#30284A"],
};

function hashStr(s) {
  return [...(s || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
}

export default function BookPlaceholder({ title = "", author = "", genre = "", style = {} }) {
  const palette = GENRE_PALETTES[genre] || GENRE_PALETTES["Other"];
  const hash = hashStr(title + author);
  // Slight rotation variation per book
  const angle = 130 + (hash % 40);

  // Split title for display (show up to 3 lines)
  const displayTitle = title || "Untitled";
  const displayAuthor = author || "";

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: `linear-gradient(${angle}deg, ${palette[0]} 0%, ${palette[1]} 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: "var(--radius)",
      border: "1px solid rgba(212,175,106,0.12)",
      position: "relative",
      overflow: "hidden",
      padding: "15% 10% 12%",
      boxSizing: "border-box",
      ...style,
    }}>
      {/* Decorative top line */}
      <div style={{
        position: "absolute",
        top: "8%",
        left: "15%",
        right: "15%",
        height: 1,
        background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
        opacity: 0.3,
      }} />

      {/* Faint basin watermark */}
      <svg width="60%" viewBox="0 0 80 60" fill="none" style={{
        position: "absolute",
        bottom: "5%",
        opacity: 0.06,
      }}>
        <path d="M8 12 C8 12 20 8 40 8 C60 8 72 12 72 12 L72 20 C72 20 68 44 40 44 C12 44 8 20 8 20 Z"
          stroke="var(--gold)" strokeWidth="2" fill="none" />
        <line x1="40" y1="8" x2="40" y2="44" stroke="var(--gold)" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* Title */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(0.55rem, 2.5vw, 0.85rem)",
          color: "var(--gold-soft, #E8CC8E)",
          fontWeight: 600,
          lineHeight: 1.3,
          textAlign: "center",
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word",
        }}>
          {displayTitle}
        </span>
      </div>

      {/* Divider */}
      <div style={{
        width: "40%",
        height: 1,
        background: "var(--gold)",
        opacity: 0.25,
        margin: "6% 0",
        flexShrink: 0,
      }} />

      {/* Author */}
      {displayAuthor && (
        <span style={{
          fontFamily: "var(--font-body, 'EB Garamond', serif)",
          fontSize: "clamp(0.45rem, 1.8vw, 0.65rem)",
          color: "var(--lavender)",
          opacity: 0.7,
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          flexShrink: 0,
        }}>
          {displayAuthor}
        </span>
      )}

      {/* Decorative bottom line */}
      <div style={{
        position: "absolute",
        bottom: "8%",
        left: "15%",
        right: "15%",
        height: 1,
        background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
        opacity: 0.3,
      }} />
    </div>
  );
}
