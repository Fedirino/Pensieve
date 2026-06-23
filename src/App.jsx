import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "./firebase";
import Header from "./components/Header";
import Auth from "./components/Auth";
import Library from "./components/Library";
import BookDetail from "./components/BookDetail";
import Scanner from "./components/Scanner";
import Stats from "./components/Stats";
import Recommendations from "./components/Recommendations";
import MistLoader from "./components/MistLoader";
import Toast from "./components/Toast";

export const GENRES = [
  "Fiction","Non-Fiction","Sci-Fi","Fantasy","Mystery","Romance",
  "History","Science","Philosophy","Biography","Self-Help","Poetry","Art","Other"
];

export const STATUSES = ["Want to Read", "Reading", "Finished", "DNF"];

export const APP_VERSION = "1.7.0";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) { setBooks([]); return; }
    const q = query(
      collection(db, "users", user.uid, "books"),
      orderBy("dateAdded", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("Firestore listen error:", err);
      addToast("Failed to load books", "error");
    });
    return unsub;
  }, [user, addToast]);

  if (authLoading) return <MistLoader text="Entering the Pensieve..." />;

  if (!user) return <Auth />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header user={user} />
      <main style={{ flex: 1, paddingBottom: 48 }}>
        <Routes>
          <Route path="/" element={<Library books={books} user={user} addToast={addToast} />} />
          <Route path="/book/:id" element={<BookDetail books={books} user={user} addToast={addToast} />} />
          <Route path="/scan" element={<Scanner user={user} addToast={addToast} />} />
          <Route path="/stats" element={<Stats books={books} />} />
          <Route path="/recommendations" element={<Recommendations books={books} addToast={addToast} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer style={{
        textAlign: "center",
        padding: "16px",
        color: "var(--lavender)",
        opacity: 0.5,
        fontSize: "0.8rem",
        fontFamily: "var(--font-display)"
      }}>
        Pensieve v{APP_VERSION}
      </footer>
      <Toast toasts={toasts} />
    </div>
  );
}
