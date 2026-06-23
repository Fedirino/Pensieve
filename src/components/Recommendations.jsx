import React, { useState, useMemo } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import BookPlaceholder from "./BookPlaceholder";
import MistLoader from "./MistLoader";

export default function Recommendations({ books, addToast }) {
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);

  const eligibleBooks = useMemo(() =>
    books.filter(b => b.favorite || (b.rating && b.rating >= 4)),
    [books]
  );

  const fetchRecs = async () => {
    if (eligibleBooks.length === 0) {
      addToast("Rate or favorite some books first so Pensieve can learn your taste.", "error");
      return;
    }
    setLoading(true);
    try {
      const fn = httpsCallable(functions, "getRecommendations");
      const res = await fn({
        favoriteBooks: eligibleBooks.map(b => ({
          title: b.title, author: b.author, genre: b.genre,
        })),
      });
      setRecs(res.data.recommendations || []);
    } catch (err) {
      console.error("Recommendation error:", err);
      addToast("Failed to get recommendations: " + (err.message || "Unknown error"), "error");
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ paddingTop: 32, maxWidth: 720, margin: "0 auto" }}>
      <h2 className="section-title" style={{ fontSize: "1.6rem", marginBottom: 8 }}>
        For You
      </h2>
      <p style={{ color: "var(--lavender)", fontSize: "0.9rem", marginBottom: 24, opacity: 0.7 }}>
        Personalized recommendations based on your favorites and highly-rated books.
      </p>

      {!recs && !loading && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <p style={{ color: "var(--lavender)", marginBottom: 16, fontSize: "0.9rem" }}>
            {eligibleBooks.length === 0
              ? "Favorite or rate (4+) some books, then come back for recommendations."
              : `Based on ${eligibleBooks.length} of your top-rated books.`}
          </p>
          <button className="btn btn-primary" onClick={fetchRecs}
            disabled={eligibleBooks.length === 0}>
            Get Recommendations
          </button>
        </div>
      )}

      {loading && <MistLoader text="Consulting the Pensieve..." />}

      {recs && recs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {recs.map((rec, i) => (
            <div key={i} className="card" style={{
              display: "flex",
              gap: 16,
              padding: 16,
            }}>
              <div style={{
                width: 70, height: 105, flexShrink: 0,
                borderRadius: "var(--radius)", overflow: "hidden",
                border: "1px solid rgba(46,139,87,0.08)",
              }}>
                {rec.cover ? (
                  <img src={rec.cover} alt={rec.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <BookPlaceholder title={rec.title} author={rec.author} genre={rec.genre} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  color: "var(--silver)",
                  marginBottom: 2,
                }}>
                  {rec.title}
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--lavender)", marginBottom: 4 }}>
                  {rec.author}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--lavender)", opacity: 0.6, marginBottom: 6 }}>
                  {rec.genre}
                </p>
                {rec.reason && (
                  <p style={{ fontSize: "0.82rem", color: "var(--silver)", opacity: 0.7, fontStyle: "italic" }}>
                    {rec.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={fetchRecs}
            style={{ alignSelf: "center", marginTop: 8 }}>
            Refresh Recommendations
          </button>
        </div>
      )}

      {recs && recs.length === 0 && !loading && (
        <p style={{ textAlign: "center", color: "var(--lavender)", opacity: 0.5, padding: 24 }}>
          No recommendations generated. Try adding more rated books.
        </p>
      )}
    </div>
  );
}
