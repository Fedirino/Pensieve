import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";
import BookForm from "./BookForm";
import BookPlaceholder from "./BookPlaceholder";
import StarRating from "./StarRating";
import MistLoader from "./MistLoader";

export default function BookDetail({ books, user, addToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [refreshingCover, setRefreshingCover] = useState(false);
  const [showCoverPaste, setShowCoverPaste] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");

  const book = useMemo(() => books.find(b => b.id === id), [books, id]);

  if (!book) return <MistLoader text="Searching the mist..." />;

  const ref = doc(db, "users", user.uid, "books", id);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      await updateDoc(ref, data);
      setEditing(false);
      addToast("Book updated");
    } catch (err) {
      addToast("Failed to update: " + err.message, "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(ref);
      addToast("Book removed");
      navigate("/");
    } catch (err) {
      addToast("Failed to delete: " + err.message, "error");
    }
  };

  const refreshCover = async () => {
    setRefreshingCover(true);
    try {
      const resolveFn = httpsCallable(functions, "resolveCover");
      const res = await resolveFn({ title: book.title, author: book.author, isbn13: book.isbn13 || "" });
      const cover = res.data.cover;
      if (cover) {
        await updateDoc(ref, { cover });
        addToast("Cover updated!");
      } else {
        addToast("No cover found for this book", "error");
      }
    } catch (err) {
      addToast("Failed to resolve cover: " + err.message, "error");
    }
    setRefreshingCover(false);
  };

  const toggleFavorite = async () => {
    try {
      await updateDoc(ref, { favorite: !book.favorite });
    } catch {}
  };

  const updatePage = async (page) => {
    const p = Math.max(0, Math.min(parseInt(page, 10) || 0, book.pages || 99999));
    try {
      await updateDoc(ref, { currentPage: p });
    } catch {}
  };

  const progress = book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
  const avgPagesPerDay = 30;
  const pagesLeft = Math.max(0, (book.pages || 0) - (book.currentPage || 0));
  const estDays = pagesLeft > 0 ? Math.ceil(pagesLeft / avgPagesPerDay) : 0;

  if (editing) {
    return (
      <div className="container" style={{ paddingTop: 32, maxWidth: 560 }}>
        <h2 className="section-title" style={{ fontSize: "1.4rem", marginBottom: 20 }}>
          Edit Book
        </h2>
        <BookForm initial={book} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <button className="btn btn-ghost" onClick={() => navigate("/")}
        style={{ marginBottom: 16, fontSize: "0.9rem" }}>
        ← Back to Library
      </button>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* Cover */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{
            width: "100%",
            aspectRatio: "2/3",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid rgba(46,139,87,0.1)",
            boxShadow: "var(--shadow-lg)",
          }}>
            {book.cover ? (
              <img src={book.cover} alt={book.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <BookPlaceholder title={book.title} author={book.author} genre={book.genre} />
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {!book.cover && (
              <button
                className="btn btn-secondary"
                onClick={refreshCover}
                disabled={refreshingCover}
                style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem" }}
              >
                {refreshingCover ? "Searching..." : "Find Cover"}
              </button>
            )}
            <button
              className="btn btn-ghost"
              onClick={() => {
                const q = encodeURIComponent(`${book.title} ${book.author} book cover`);
                window.open(`https://www.google.com/search?tbm=isch&q=${q}`, "_blank");
              }}
              style={{ width: "100%", justifyContent: "center", fontSize: "0.78rem", opacity: 0.7 }}
            >
              Search Google Images
            </button>
            {!showCoverPaste ? (
              <button
                className="btn btn-ghost"
                onClick={() => setShowCoverPaste(true)}
                style={{ width: "100%", justifyContent: "center", fontSize: "0.78rem", opacity: 0.5 }}
              >
                Paste Cover URL
              </button>
            ) : (
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  className="input"
                  placeholder="https://..."
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  style={{ flex: 1, padding: "6px 8px", fontSize: "0.8rem" }}
                />
                <button
                  className="btn btn-primary"
                  style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                  onClick={async () => {
                    if (!coverUrl.trim()) return;
                    try {
                      await updateDoc(ref, { cover: coverUrl.trim() });
                      addToast("Cover updated!");
                      setShowCoverPaste(false);
                      setCoverUrl("");
                    } catch (err) {
                      addToast("Failed: " + err.message, "error");
                    }
                  }}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="flex items-center gap-md" style={{ marginBottom: 8 }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              color: "var(--silver)",
              flex: 1,
            }}>
              {book.title}
            </h1>
            <button onClick={toggleFavorite}
              style={{
                fontSize: "1.5rem",
                background: "none",
                color: book.favorite ? "var(--gold)" : "var(--indigo)",
                transition: "color var(--transition)",
              }}>
              ★
            </button>
          </div>

          <p style={{ fontSize: "1.1rem", color: "var(--lavender)", marginBottom: 12 }}>
            {book.author}
          </p>

          <div className="flex gap-sm items-center" style={{ marginBottom: 16 }}>
            <span style={{
              padding: "4px 12px",
              background: "var(--indigo)",
              borderRadius: "var(--radius)",
              fontSize: "0.8rem",
              color: "var(--lavender)",
              borderLeft: "2px solid var(--emerald-dim)",
            }}>
              {book.genre}
            </span>
            <span style={{
              padding: "4px 12px",
              background: "rgba(201,168,76,0.08)",
              borderRadius: "var(--radius)",
              fontSize: "0.8rem",
              color: "var(--gold)",
              borderLeft: "2px solid var(--gold)",
            }}>
              {book.status}
            </span>
          </div>

          {book.rating > 0 && (
            <div style={{ marginBottom: 16 }}>
              <StarRating value={book.rating} readOnly size="1.4rem" />
            </div>
          )}

          {/* Reading progress */}
          {book.status === "Reading" && book.pages > 0 && (
            <div style={{
              padding: 16,
              background: "rgba(26,46,34,0.25)",
              borderRadius: "var(--radius)",
              marginBottom: 16,
              border: "1px solid rgba(46,139,87,0.08)",
            }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--lavender)" }}>
                  Reading Progress
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--emerald)" }}>
                  {progress}%
                </span>
              </div>
              <div style={{
                height: 6,
                background: "var(--indigo)",
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 10,
              }}>
                <div style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--emerald-dim), var(--emerald), var(--gold))",
                  borderRadius: 3,
                  transition: "width 0.3s ease",
                }} />
              </div>
              <div className="flex gap-sm items-center">
                <label className="label" style={{ marginBottom: 0 }}>Page</label>
                <input className="input" type="number" min="0" max={book.pages}
                  value={book.currentPage}
                  onChange={e => updatePage(e.target.value)}
                  style={{ width: 80, padding: "6px 10px" }} />
                <span style={{ fontSize: "0.85rem", color: "var(--lavender)", opacity: 0.7 }}>
                  / {book.pages}
                </span>
              </div>
              {estDays > 0 && (
                <p style={{ fontSize: "0.8rem", color: "var(--lavender)", opacity: 0.5, marginTop: 8 }}>
                  ~{estDays} day{estDays !== 1 ? "s" : ""} left at ~{avgPagesPerDay} pages/day
                </p>
              )}
            </div>
          )}

          {book.pages > 0 && book.status !== "Reading" && (
            <p style={{ fontSize: "0.85rem", color: "var(--lavender)", opacity: 0.6, marginBottom: 12 }}>
              {book.pages} pages
            </p>
          )}

          {book.notes && (
            <div style={{ marginBottom: 16 }}>
              <h3 className="section-title" style={{ fontSize: "1rem", marginBottom: 10 }}>
                Notes
              </h3>
              <p style={{
                fontSize: "0.9rem",
                color: "var(--silver)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}>
                {book.notes}
              </p>
            </div>
          )}

          {book.dateFinished && (
            <p style={{ fontSize: "0.8rem", color: "var(--lavender)", opacity: 0.5, marginBottom: 16 }}>
              Finished on {book.dateFinished}
            </p>
          )}

          <div className="flex gap-sm" style={{ marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>
              Edit
            </button>
            {confirmDelete ? (
              <>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Confirm Delete
                </button>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
