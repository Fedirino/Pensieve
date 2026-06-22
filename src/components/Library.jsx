import React, { useState, useMemo } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { GENRES, STATUSES } from "../App";
import BookCard from "./BookCard";
import BookForm from "./BookForm";
import ReadingGoal from "./ReadingGoal";
import MistLoader from "./MistLoader";

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Added" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "rating", label: "Rating" },
];

export default function Library({ books, user, addToast }) {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const reading = useMemo(() =>
    books.filter(b => b.status === "Reading"), [books]);

  const filtered = useMemo(() => {
    let result = [...books];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
      );
    }
    if (genreFilter) result = result.filter(b => b.genre === genreFilter);
    if (statusFilter) result = result.filter(b => b.status === statusFilter);

    result.sort((a, b) => {
      switch (sortBy) {
        case "title": return (a.title || "").localeCompare(b.title || "");
        case "author": return (a.author || "").localeCompare(b.author || "");
        case "rating": return (b.rating || 0) - (a.rating || 0);
        default: return (b.dateAdded || "").localeCompare(a.dateAdded || "");
      }
    });
    return result;
  }, [books, search, genreFilter, statusFilter, sortBy]);

  const finishedThisYear = useMemo(() => {
    const year = new Date().getFullYear().toString();
    return books.filter(b => b.status === "Finished" && b.dateFinished?.startsWith(year)).length;
  }, [books]);

  const handleAdd = async (data) => {
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "books"), {
        ...data,
        dateAdded: new Date().toISOString().split("T")[0],
      });
      setShowAddForm(false);
      addToast("Book added to your library");
    } catch (err) {
      addToast("Failed to add book: " + err.message, "error");
    }
    setSaving(false);
  };

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      {/* Continue Reading shelf */}
      {reading.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.3rem",
            color: "var(--gold)",
            marginBottom: 16,
          }}>
            Continue Reading
          </h2>
          <div style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            paddingBottom: 8,
          }}>
            {reading.map(book => (
              <div key={book.id} style={{ minWidth: 160, maxWidth: 180, flexShrink: 0 }}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
          <div className="mist-divider"><span className="wisp" /></div>
        </section>
      )}

      {/* Reading Goal */}
      <ReadingGoal finishedCount={finishedThisYear} user={user} />

      {/* Toolbar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        marginBottom: 20,
        marginTop: 24,
      }}>
        <input
          className="input"
          placeholder="Search title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 260, flex: "1 1 200px" }}
        />
        <select className="select" value={genreFilter} onChange={e => setGenreFilter(e.target.value)}
          style={{ maxWidth: 160 }}>
          <option value="">All Genres</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ maxWidth: 160 }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ maxWidth: 160 }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          + Add Book
        </button>
      </div>

      {/* Book count */}
      <p style={{ fontSize: "0.85rem", color: "var(--lavender)", marginBottom: 16, opacity: 0.7 }}>
        {filtered.length} book{filtered.length !== 1 ? "s" : ""}
        {(genreFilter || statusFilter || search) ? " (filtered)" : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <svg width="60" height="45" viewBox="0 0 80 60" fill="none" style={{ opacity: 0.2, marginBottom: 12 }}>
            <path d="M8 12 C8 12 20 8 40 8 C60 8 72 12 72 12 L72 20 C72 20 68 44 40 44 C12 44 8 20 8 20 Z"
              stroke="var(--gold)" strokeWidth="2" fill="none" />
            <line x1="40" y1="8" x2="40" y2="44" stroke="var(--gold)" strokeWidth="1" opacity="0.5" />
          </svg>
          <p style={{ color: "var(--lavender)", opacity: 0.5, fontFamily: "var(--font-display)" }}>
            {books.length === 0 ? "Your Pensieve is empty. Add a book or scan a cover to begin." : "No books match your filters."}
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: 20,
        }}>
          {filtered.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      )}

      {/* Add book modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddForm(false)}>
          <div className="modal">
            <h2>Add a Book</h2>
            <BookForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} saving={saving} />
          </div>
        </div>
      )}
    </div>
  );
}
