import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import BookPlaceholder from "./BookPlaceholder";

const STATUS_COLORS = {
  "Want to Read": "var(--lavender)",
  "Reading": "var(--gold)",
  "Finished": "#7ec87e",
  "DNF": "#c87e7e",
};

export default function BookCard({ book }) {
  const progress = book.pages > 0 && book.status === "Reading"
    ? Math.min(Math.round((book.currentPage / book.pages) * 100), 100)
    : null;

  return (
    <Link to={`/book/${book.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="card" style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 0,
        overflow: "hidden",
      }}>
        {/* Cover */}
        <div style={{ width: "100%", aspectRatio: "2/3", position: "relative", flexShrink: 0 }}>
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
              }}
              loading="lazy"
            />
          ) : (
            <BookPlaceholder title={book.title} author={book.author} genre={book.genre} />
          )}

          {/* Favorite badge */}
          {book.favorite && (
            <span style={{
              position: "absolute", top: 8, right: 8,
              background: "rgba(22,20,43,0.7)",
              borderRadius: "50%", width: 26, height: 26,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem",
            }}>
              ★
            </span>
          )}

          {/* Status badge */}
          <span style={{
            position: "absolute", bottom: 8, left: 8,
            background: "rgba(22,20,43,0.8)",
            color: STATUS_COLORS[book.status] || "var(--silver)",
            fontSize: "0.7rem",
            padding: "3px 8px",
            borderRadius: 4,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}>
            {book.status}
          </span>
        </div>

        {/* Info */}
        <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            color: "var(--silver)",
            fontWeight: 600,
            lineHeight: 1.3,
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {book.title}
          </h3>
          <p style={{
            fontSize: "0.82rem",
            color: "var(--lavender)",
            marginBottom: 8,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {book.author}
          </p>

          <div style={{ marginTop: "auto" }}>
            {book.rating > 0 && <StarRating value={book.rating} readOnly size="0.9rem" />}

            {/* Reading progress bar */}
            {progress !== null && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  height: 4,
                  background: "var(--indigo)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, var(--gold), var(--lavender))",
                    borderRadius: 2,
                    transition: "width 0.3s ease",
                  }} />
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--lavender)", opacity: 0.7 }}>
                  {progress}% · p.{book.currentPage}/{book.pages}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
