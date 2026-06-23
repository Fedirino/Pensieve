import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const NAV = [
  { to: "/", label: "Library", icon: "M4 6h16M4 12h16M4 18h16" },
  { to: "/scan", label: "Scan", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M12 16a3 3 0 100-6 3 3 0 000 6z" },
  { to: "/stats", label: "Stats", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { to: "/recommendations", label: "For You", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
];

export default function Header({ user }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      borderBottom: "1px solid rgba(46,139,87,0.1)",
      background: "rgba(10,13,11,0.95)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Subtle emerald accent line at top */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, transparent, var(--emerald-dim), var(--gold), var(--emerald-dim), transparent)",
        opacity: 0.4,
      }} />

      <div className="container flex items-center justify-between" style={{ height: 58 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="22" viewBox="0 0 80 60" fill="none">
            <path d="M8 12 C8 12 20 8 40 8 C60 8 72 12 72 12 L72 20 C72 20 68 44 40 44 C12 44 8 20 8 20 Z"
              stroke="var(--gold)" strokeWidth="2" fill="none" />
            <line x1="40" y1="8" x2="40" y2="44" stroke="var(--gold)" strokeWidth="1" opacity="0.5" />
            <path d="M32 32 C30 22 34 14 30 4" stroke="var(--emerald)" strokeWidth="2.5" opacity="0.5"
              strokeLinecap="round" fill="none" />
            <path d="M50 30 C52 20 48 12 52 2" stroke="var(--emerald)" strokeWidth="2.5" opacity="0.4"
              strokeLinecap="round" fill="none" />
          </svg>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.3rem",
            color: "var(--gold)",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}>
            Pensieve
          </span>
        </Link>

        <nav className="flex items-center gap-sm" style={{ display: "flex" }}>
          {NAV.map(n => {
            const active = location.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: "var(--radius)",
                  fontSize: "0.9rem",
                  color: active ? "var(--gold)" : "var(--lavender)",
                  background: active ? "rgba(46,139,87,0.1)" : "transparent",
                  borderBottom: active ? "2px solid var(--emerald)" : "2px solid transparent",
                  transition: "all var(--transition)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={n.icon} />
                </svg>
                <span className="nav-label">{n.label}</span>
              </Link>
            );
          })}

          <div style={{ position: "relative", marginLeft: 8 }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn-ghost"
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "var(--indigo)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", color: "var(--gold)",
                border: "1px solid rgba(46,139,87,0.15)",
                transition: "all var(--transition)",
              }}
            >
              {(user.displayName || user.email || "?")[0].toUpperCase()}
            </button>
            {menuOpen && (
              <div style={{
                position: "absolute", right: 0, top: 42,
                background: "var(--midnight-soft)",
                border: "1px solid rgba(46,139,87,0.15)",
                borderRadius: "var(--radius)",
                padding: 8, minWidth: 160,
                boxShadow: "var(--shadow-lg)",
              }}>
                <p style={{ padding: "6px 12px", fontSize: "0.8rem", color: "var(--lavender)", opacity: 0.7 }}>
                  {user.email}
                </p>
                <button
                  className="btn-ghost"
                  style={{ width: "100%", textAlign: "left", padding: "8px 12px", fontSize: "0.9rem" }}
                  onClick={() => { signOut(auth); setMenuOpen(false); }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nav-label { display: none; }
        }
      `}</style>
    </header>
  );
}
