import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { APP_VERSION } from "../App";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message.replace("Firebase: ", ""));
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `
        radial-gradient(ellipse at 30% 70%, rgba(46, 139, 87, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 30%, rgba(201, 168, 76, 0.05) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 90%, rgba(26, 46, 34, 0.4) 0%, transparent 50%),
        linear-gradient(180deg, #0A0D0B 0%, #0E1B13 50%, #0A0D0B 100%)
      `,
      padding: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative gothic corner ornaments */}
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none"
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.08 }}>
        <path d="M0 0 L60 0 C40 20 20 40 0 60 Z" fill="var(--emerald)" />
        <path d="M0 0 L40 0 C25 15 15 25 0 40 Z" fill="var(--gold)" />
      </svg>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none"
        style={{ position: "absolute", top: 0, right: 0, opacity: 0.08, transform: "scaleX(-1)" }}>
        <path d="M0 0 L60 0 C40 20 20 40 0 60 Z" fill="var(--emerald)" />
        <path d="M0 0 L40 0 C25 15 15 25 0 40 Z" fill="var(--gold)" />
      </svg>

      <div style={{ textAlign: "center", width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>
        {/* Pensieve mark */}
        <div style={{ marginBottom: 36 }}>
          <svg width="90" height="68" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Basin */}
            <path d="M8 12 C8 12 20 8 40 8 C60 8 72 12 72 12 L72 20 C72 20 68 44 40 44 C12 44 8 20 8 20 Z"
              stroke="var(--gold)" strokeWidth="1.5" fill="none" />
            <line x1="40" y1="8" x2="40" y2="44" stroke="var(--gold)" strokeWidth="0.8" opacity="0.5" />
            <path d="M40 8 C30 10 18 13 8 18" stroke="var(--gold)" strokeWidth="0.6" opacity="0.4" fill="none" />
            <path d="M40 8 C50 10 62 13 72 18" stroke="var(--gold)" strokeWidth="0.6" opacity="0.4" fill="none" />
            {/* Mist ribbon 1 — emerald */}
            <path d="M32 32 C30 22 34 14 30 4" stroke="var(--emerald)" strokeWidth="2" opacity="0.5"
              strokeLinecap="round" fill="none">
              <animate attributeName="d" values="M32 32 C30 22 34 14 30 4;M32 32 C28 20 36 12 32 2;M32 32 C30 22 34 14 30 4"
                dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.3;0.5" dur="3s" repeatCount="indefinite" />
            </path>
            {/* Mist ribbon 2 — emerald */}
            <path d="M50 30 C52 20 48 12 52 2" stroke="var(--emerald)" strokeWidth="2" opacity="0.4"
              strokeLinecap="round" fill="none">
              <animate attributeName="d" values="M50 30 C52 20 48 12 52 2;M50 30 C54 18 46 10 50 0;M50 30 C52 20 48 12 52 2"
                dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.2;0.4" dur="3.5s" repeatCount="indefinite" />
            </path>
          </svg>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.6rem",
            color: "var(--gold)",
            marginTop: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}>
            Pensieve
          </h1>
          <p style={{
            fontFamily: "var(--font-display)",
            color: "var(--emerald)",
            fontSize: "1rem",
            letterSpacing: "0.14em",
            marginTop: 6,
            fontStyle: "italic",
          }}>
            a reading mind
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: "rgba(18, 26, 21, 0.8)",
          border: "1px solid rgba(46, 139, 87, 0.12)",
          borderRadius: "var(--radius-lg)",
          padding: "28px 24px",
          backdropFilter: "blur(8px)",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              className="input"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && (
              <p style={{ color: "#d88", fontSize: "0.85rem" }}>{error}</p>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mist-divider" style={{ margin: "20px 0" }}>
            <span className="wisp" />
          </div>

          <button className="btn btn-secondary" onClick={handleGoogle}
            style={{ width: "100%", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ marginTop: 16, fontSize: "0.9rem", color: "var(--lavender)" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button className="btn-ghost" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              style={{ display: "inline", padding: 0, fontSize: "0.9rem", textDecoration: "underline" }}>
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

        <p style={{
          marginTop: 36,
          fontSize: "0.7rem",
          color: "var(--emerald-dim)",
          opacity: 0.6,
          fontFamily: "var(--font-display)",
          letterSpacing: "0.08em",
        }}>
          v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
