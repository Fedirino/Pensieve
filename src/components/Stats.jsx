import React, { useMemo } from "react";
import { GENRES } from "../App";

export default function Stats({ books }) {
  const stats = useMemo(() => {
    const total = books.length;
    const finished = books.filter(b => b.status === "Finished").length;
    const reading = books.filter(b => b.status === "Reading").length;
    const wantToRead = books.filter(b => b.status === "Want to Read").length;
    const dnf = books.filter(b => b.status === "DNF").length;
    const favorites = books.filter(b => b.favorite).length;
    const totalPages = books.reduce((s, b) => s + (b.pages || 0), 0);
    const pagesRead = books.reduce((s, b) => {
      if (b.status === "Finished") return s + (b.pages || 0);
      return s + (b.currentPage || 0);
    }, 0);
    const avgRating = books.filter(b => b.rating > 0).length > 0
      ? (books.filter(b => b.rating > 0).reduce((s, b) => s + b.rating, 0) / books.filter(b => b.rating > 0).length).toFixed(1)
      : "—";

    const genreCounts = {};
    books.forEach(b => {
      genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    });
    const genres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const maxGenreCount = genres.length > 0 ? genres[0][1] : 1;

    return { total, finished, reading, wantToRead, dnf, favorites, totalPages, pagesRead, avgRating, genres, maxGenreCount };
  }, [books]);

  const StatCard = ({ label, value, color = "var(--gold)", accent = "var(--emerald-dim)" }) => (
    <div style={{
      padding: 16,
      background: "rgba(26,46,34,0.2)",
      borderRadius: "var(--radius)",
      border: "1px solid rgba(46,139,87,0.06)",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      transition: "all var(--transition)",
    }}>
      {/* Subtle top accent */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "20%",
        right: "20%",
        height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        opacity: 0.3,
      }} />
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.8rem",
        color,
        fontWeight: 600,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "0.8rem",
        color: "var(--lavender)",
        opacity: 0.7,
        marginTop: 2,
      }}>
        {label}
      </div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 32, maxWidth: 720, margin: "0 auto" }}>
      <h2 className="section-title" style={{ fontSize: "1.6rem", marginBottom: 24 }}>
        Your Reading Stats
      </h2>

      {books.length === 0 ? (
        <p style={{ color: "var(--lavender)", opacity: 0.5, textAlign: "center", padding: 48 }}>
          Add some books to see your stats.
        </p>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}>
            <StatCard label="Total Books" value={stats.total} />
            <StatCard label="Finished" value={stats.finished} color="#5EAF5E" accent="#5EAF5E" />
            <StatCard label="Reading" value={stats.reading} color="var(--emerald)" accent="var(--emerald)" />
            <StatCard label="Want to Read" value={stats.wantToRead} color="var(--lavender)" accent="var(--lavender)" />
            <StatCard label="DNF" value={stats.dnf} color="#b86868" accent="#b86868" />
            <StatCard label="Favorites" value={stats.favorites} />
            <StatCard label="Pages Read" value={stats.pagesRead.toLocaleString()} />
            <StatCard label="Avg Rating" value={stats.avgRating} />
          </div>

          <h3 className="section-title" style={{ fontSize: "1.2rem", marginBottom: 16 }}>
            Genre Breakdown
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.genres.map(([genre, count]) => (
              <div key={genre} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 100,
                  fontSize: "0.85rem",
                  color: "var(--lavender)",
                  textAlign: "right",
                  flexShrink: 0,
                }}>
                  {genre}
                </span>
                <div style={{
                  flex: 1,
                  height: 20,
                  background: "var(--indigo)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${(count / stats.maxGenreCount) * 100}%`,
                    background: "linear-gradient(90deg, var(--emerald-dim), var(--emerald), var(--gold))",
                    borderRadius: 4,
                    transition: "width 0.3s ease",
                    minWidth: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: 8,
                  }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--midnight)", fontWeight: 600 }}>
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
