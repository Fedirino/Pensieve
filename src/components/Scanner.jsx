import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { collection, addDoc } from "firebase/firestore";
import { functions, db } from "../firebase";
import MistLoader from "./MistLoader";
import BookPlaceholder from "./BookPlaceholder";

// Resize image to max dimension while preserving aspect ratio, returns {base64, mediaType}
function resizeImage(file, maxDim = 1600) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      // Use JPEG at 85% quality for a good size/quality tradeoff
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mediaType: "image/jpeg" });
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function Scanner({ user, addToast }) {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState(null);
  const [adding, setAdding] = useState({});

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setScanning(true);
    setResults(null);

    try {
      // Resize image to consistent dimensions before sending
      const { base64, mediaType } = await resizeImage(file, 1600);

      const scanFn = httpsCallable(functions, "scanBookCover");
      const res = await scanFn({ imageBase64: base64, mediaType });
      setResults(res.data.books || []);

      if (res.data.books?.length === 0) {
        addToast("No books detected in the image", "error");
      }
    } catch (err) {
      console.error("Scan error:", err);
      addToast("Scan failed: " + (err.message || "Unknown error"), "error");
    }
    setScanning(false);
  };

  const addBook = async (book) => {
    setAdding(prev => ({ ...prev, [book.title]: true }));
    try {
      await addDoc(collection(db, "users", user.uid, "books"), {
        title: book.title || "",
        author: book.author || "",
        genre: book.genre || "Other",
        status: "Want to Read",
        rating: 0,
        pages: book.pages || 0,
        currentPage: 0,
        cover: book.cover || "",
        notes: book.summary || "",
        dateAdded: new Date().toISOString().split("T")[0],
        dateFinished: null,
        favorite: false,
      });
      addToast(`Added "${book.title}"`);
    } catch (err) {
      addToast("Failed to add: " + err.message, "error");
    }
    setAdding(prev => ({ ...prev, [book.title]: false }));
  };

  return (
    <div className="container" style={{ paddingTop: 32, maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.6rem",
        color: "var(--gold)",
        marginBottom: 8,
      }}>
        Scan a Book Cover
      </h2>
      <p style={{ color: "var(--lavender)", fontSize: "0.9rem", marginBottom: 24, opacity: 0.7 }}>
        Take a photo or upload an image of a book cover. Pensieve will identify it and fill in the details.
      </p>

      {/* Upload area */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: "2px dashed var(--indigo)",
          borderRadius: "var(--radius-lg)",
          padding: preview ? 0 : 48,
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color var(--transition)",
          overflow: "hidden",
          position: "relative",
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = "var(--gold)"}
        onMouseOut={e => e.currentTarget.style.borderColor = "var(--indigo)"}
      >
        {preview ? (
          <img src={preview} alt="Preview"
            style={{ width: "100%", maxHeight: 400, objectFit: "contain" }} />
        ) : (
          <>
            <svg width="48" height="36" viewBox="0 0 80 60" fill="none" style={{ opacity: 0.3, marginBottom: 12 }}>
              <path d="M8 12 C8 12 20 8 40 8 C60 8 72 12 72 12 L72 20 C72 20 68 44 40 44 C12 44 8 20 8 20 Z"
                stroke="var(--gold)" strokeWidth="2" fill="none" />
              <line x1="40" y1="8" x2="40" y2="44" stroke="var(--gold)" strokeWidth="1" opacity="0.5" />
            </svg>
            <p style={{ color: "var(--lavender)", fontSize: "0.95rem" }}>
              Click to upload or take a photo
            </p>
            <p style={{ color: "var(--lavender)", fontSize: "0.8rem", opacity: 0.5, marginTop: 4 }}>
              JPG, PNG, or HEIC
            </p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </div>

      {/* Scanning state */}
      {scanning && <MistLoader text="Identifying books..." />}

      {/* Results */}
      {results && results.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            color: "var(--gold)",
            marginBottom: 16,
          }}>
            {results.length} book{results.length !== 1 ? "s" : ""} found
          </h3>
          {results.map((book, i) => (
            <div key={i} className="card" style={{
              display: "flex",
              gap: 16,
              marginBottom: 12,
              padding: 16,
            }}>
              <div style={{ width: 80, height: 120, flexShrink: 0, borderRadius: "var(--radius)", overflow: "hidden" }}>
                {book.cover ? (
                  <img src={book.cover} alt={book.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <BookPlaceholder title={book.title} author={book.author} genre={book.genre} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  color: "var(--silver)",
                  marginBottom: 2,
                }}>
                  {book.title}
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--lavender)", marginBottom: 4 }}>
                  {book.author}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--lavender)", opacity: 0.6, marginBottom: 8 }}>
                  {book.genre}{book.pages ? ` · ${book.pages} pages` : ""}
                </p>
                {book.summary && (
                  <p style={{ fontSize: "0.82rem", color: "var(--silver)", opacity: 0.7, marginBottom: 10 }}>
                    {book.summary}
                  </p>
                )}
                <button
                  className="btn btn-primary"
                  style={{ padding: "6px 16px", fontSize: "0.85rem" }}
                  disabled={adding[book.title]}
                  onClick={() => addBook(book)}
                >
                  {adding[book.title] ? "Adding..." : "+ Add to Library"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && !scanning && (
        <p style={{ textAlign: "center", color: "var(--lavender)", opacity: 0.5, marginTop: 24 }}>
          No books detected. Try a clearer photo of the cover.
        </p>
      )}

      {/* Reset button */}
      {(preview || results) && !scanning && (
        <button className="btn btn-secondary" onClick={() => { setPreview(null); setResults(null); }}
          style={{ marginTop: 16, width: "100%", justifyContent: "center" }}>
          Scan Another
        </button>
      )}
    </div>
  );
}
