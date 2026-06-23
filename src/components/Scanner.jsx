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
  const cameraRef = useRef();
  const uploadRef = useRef();
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

      {/* Preview area */}
      {preview && (
        <div style={{
          border: "2px solid var(--indigo)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: 16,
        }}>
          <img src={preview} alt="Preview"
            style={{ width: "100%", maxHeight: 400, objectFit: "contain", display: "block" }} />
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        <button
          className="btn btn-primary"
          onClick={() => cameraRef.current?.click()}
          style={{ flex: 1, justifyContent: "center", padding: "14px 16px", fontSize: "0.95rem" }}
          disabled={scanning}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, flexShrink: 0 }}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Take Photo
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => uploadRef.current?.click()}
          style={{ flex: 1, justifyContent: "center", padding: "14px 16px", fontSize: "0.95rem" }}
          disabled={scanning}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, flexShrink: 0 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Upload Image
        </button>
      </div>
      <p style={{ color: "var(--lavender)", fontSize: "0.78rem", opacity: 0.5, textAlign: "center", marginBottom: 8 }}>
        JPG, PNG, or HEIC
      </p>

      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />

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
