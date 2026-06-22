import React, { useState, useEffect } from "react";
import { GENRES, STATUSES } from "../App";
import StarRating from "./StarRating";

const empty = {
  title: "", author: "", genre: "Fiction", status: "Want to Read",
  rating: 0, pages: 0, currentPage: 0, cover: "", notes: "",
  favorite: false, dateFinished: null,
};

export default function BookForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...empty, ...initial });

  useEffect(() => {
    if (initial) setForm({ ...empty, ...initial });
  }, [initial]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      pages: parseInt(form.pages, 10) || 0,
      currentPage: parseInt(form.currentPage, 10) || 0,
      rating: form.rating || 0,
    };
    if (data.status === "Finished" && !data.dateFinished) {
      data.dateFinished = new Date().toISOString().split("T")[0];
    }
    if (data.status !== "Finished") {
      data.dateFinished = null;
    }
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label className="label">Title *</label>
        <input className="input" value={form.title} onChange={e => set("title", e.target.value)} required />
      </div>
      <div>
        <label className="label">Author *</label>
        <input className="input" value={form.author} onChange={e => set("author", e.target.value)} required />
      </div>
      <div className="flex gap-md">
        <div style={{ flex: 1 }}>
          <label className="label">Genre</label>
          <select className="select" value={form.genre} onChange={e => set("genre", e.target.value)}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="label">Status</label>
          <select className="select" value={form.status} onChange={e => set("status", e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-md">
        <div style={{ flex: 1 }}>
          <label className="label">Total Pages</label>
          <input className="input" type="number" min="0" value={form.pages} onChange={e => set("pages", e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="label">Current Page</label>
          <input className="input" type="number" min="0" value={form.currentPage} onChange={e => set("currentPage", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Cover Image URL</label>
        <input className="input" value={form.cover} onChange={e => set("cover", e.target.value)}
          placeholder="https://..." />
      </div>
      <div>
        <label className="label">Rating</label>
        <StarRating value={form.rating} onChange={v => set("rating", v)} />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="textarea" value={form.notes} onChange={e => set("notes", e.target.value)}
          placeholder="Your thoughts on this book..." />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input type="checkbox" checked={form.favorite} onChange={e => set("favorite", e.target.checked)}
          style={{ accentColor: "var(--gold)" }} />
        <span style={{ fontSize: "0.9rem", color: "var(--lavender)" }}>Favorite</span>
      </label>
      <div className="flex gap-sm" style={{ marginTop: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={saving}
          style={{ flex: 1, justifyContent: "center" }}>
          {saving ? "Saving..." : "Save"}
        </button>
        {onCancel && (
          <button className="btn btn-secondary" type="button" onClick={onCancel}
            style={{ flex: 1, justifyContent: "center" }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
