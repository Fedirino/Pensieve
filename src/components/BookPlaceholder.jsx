import React from "react";

// Slytherin library genre palettes (dark greens, teals, forest tones)
const GENRE_PALETTES = {
  "Fiction":      ["#0D1F15", "#1A3828"],
  "Non-Fiction":  ["#121D18", "#1E3025"],
  "Sci-Fi":       ["#0D1A1A", "#163030"],
  "Fantasy":      ["#141F1A", "#1F3528"],
  "Mystery":      ["#0F1510", "#1A251C"],
  "Romance":      ["#1A1518", "#2D2025"],
  "History":      ["#181A10", "#2A2D18"],
  "Science":      ["#0F1A18", "#182E28"],
  "Philosophy":   ["#121815", "#1E2D22"],
  "Biography":    ["#151815", "#252E25"],
  "Self-Help":    ["#101D15", "#1A3020"],
  "Poetry":       ["#121A18", "#1E302A"],
  "Art":          ["#181518", "#2D2230"],
  "Other":        ["#111A15", "#1E2E22"],
};

function hashStr(s) {
  return [...(s || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
}

export default function BookPlaceholder({ title = "", author = "", genre = "", style = {} }) {
  const palette = GENRE_PALETTES[genre] || GENRE_PALETTES["Other"];
  const hash = hashStr(title + author);
  const angle = 130 + (hash % 40);

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
      border: "1px solid rgba(46,139,87,0.12)",
      position: "relative",
      overflow: "hidden",
      padding: "15% 10% 12%",
      boxSizing: "border-box",
      ...style,
    }}>
      {/* Decorative top line — emerald/gold */}
      <div style={{
        position: "absolute",
        top: "8%",
        left: "15%",
        right: "15%",
        height: 1,
        background: "linear-gradient(90deg, transparent, var(--emerald-dim), var(--gold), var(--emerald-dim), transparent)",
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
          color: "var(--gold-soft, #DDBE68)",
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
        background: "linear-gradient(90deg, transparent, var(--emerald), transparent)",
        opacity: 0.3,
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
        background: "linear-gradient(90deg, transparent, var(--emerald-dim), var(--gold), var(--emerald-dim), transparent)",
        opacity: 0.3,
      }} />
    </div>
  );
}
