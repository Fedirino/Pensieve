import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ReadingGoal({ finishedCount, user }) {
  const [goal, setGoal] = useState(12);
  const [editing, setEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(12);

  useEffect(() => {
    const ref = doc(db, "users", user.uid, "settings", "readingGoal");
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        setGoal(snap.data().target || 12);
        setTempGoal(snap.data().target || 12);
      }
    }).catch(() => {});
  }, [user.uid]);

  const saveGoal = async () => {
    const val = Math.max(1, parseInt(tempGoal, 10) || 12);
    setGoal(val);
    setEditing(false);
    try {
      await setDoc(doc(db, "users", user.uid, "settings", "readingGoal"), { target: val });
    } catch {}
  };

  const pct = Math.min(Math.round((finishedCount / goal) * 100), 100);
  const year = new Date().getFullYear();

  // Basin-shaped arc progress
  const arcRadius = 42;
  const arcCenterX = 50;
  const arcCenterY = 28;
  const startAngle = Math.PI * 0.15;
  const endAngle = Math.PI * 0.85;
  const sweepAngle = endAngle - startAngle;
  const progressAngle = startAngle + sweepAngle * (pct / 100);

  const polarToCart = (angle, r) => ({
    x: arcCenterX + r * Math.cos(angle),
    y: arcCenterY + r * Math.sin(angle),
  });

  const start = polarToCart(startAngle, arcRadius);
  const end = polarToCart(endAngle, arcRadius);
  const progressEnd = polarToCart(progressAngle, arcRadius);

  const bgArc = `M ${start.x} ${start.y} A ${arcRadius} ${arcRadius} 0 0 1 ${end.x} ${end.y}`;
  const progressArc = `M ${start.x} ${start.y} A ${arcRadius} ${arcRadius} 0 0 1 ${progressEnd.x} ${progressEnd.y}`;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 20,
      padding: "16px 20px",
      background: "rgba(26,46,34,0.2)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid rgba(46,139,87,0.08)",
    }}>
      <svg width="100" height="70" viewBox="0 0 100 70">
        {/* Background arc */}
        <path d={bgArc} fill="none" stroke="var(--indigo)" strokeWidth="5" strokeLinecap="round" />
        {/* Progress arc */}
        <path d={progressArc} fill="none" stroke="var(--gold)" strokeWidth="5" strokeLinecap="round" />
        {/* Mist wisps proportional to progress */}
        {pct > 10 && (
          <path
            d={`M ${arcCenterX - 6} ${arcCenterY - 5} C ${arcCenterX - 8} ${arcCenterY - 18} ${arcCenterX - 2} ${arcCenterY - 22} ${arcCenterX - 4} ${arcCenterY - 32}`}
            stroke="var(--lavender)" strokeWidth="1.5" fill="none" opacity={Math.min(pct / 100, 0.5)}
            strokeLinecap="round"
          />
        )}
        {pct > 30 && (
          <path
            d={`M ${arcCenterX + 6} ${arcCenterY - 3} C ${arcCenterX + 8} ${arcCenterY - 16} ${arcCenterX + 2} ${arcCenterY - 20} ${arcCenterX + 5} ${arcCenterY - 30}`}
            stroke="var(--lavender)" strokeWidth="1.5" fill="none" opacity={Math.min(pct / 100, 0.4)}
            strokeLinecap="round"
          />
        )}
        {/* Count text */}
        <text x={arcCenterX} y={arcCenterY + 2} textAnchor="middle" fill="var(--gold)"
          fontFamily="var(--font-display)" fontSize="14" fontWeight="600">
          {finishedCount}
        </text>
        <text x={arcCenterX} y={arcCenterY + 13} textAnchor="middle" fill="var(--lavender)"
          fontFamily="var(--font-display)" fontSize="7" opacity="0.7">
          of {goal}
        </text>
      </svg>

      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          color: "var(--silver)",
          marginBottom: 4,
        }}>
          {year} Reading Goal
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--lavender)", opacity: 0.7 }}>
          {pct >= 100
            ? "Goal reached! Wonderful."
            : `${goal - finishedCount} book${goal - finishedCount !== 1 ? "s" : ""} to go`}
        </p>
        {editing ? (
          <div className="flex gap-sm items-center mt-sm">
            <input className="input" type="number" min="1" value={tempGoal}
              onChange={e => setTempGoal(e.target.value)}
              style={{ width: 70, padding: "6px 10px" }} />
            <button className="btn btn-primary" onClick={saveGoal}
              style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
              Set
            </button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}
              style={{ fontSize: "0.85rem" }}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn-ghost" onClick={() => { setEditing(true); setTempGoal(goal); }}
            style={{ fontSize: "0.8rem", padding: 0, marginTop: 4, textDecoration: "underline", opacity: 0.6 }}>
            Adjust goal
          </button>
        )}
      </div>
    </div>
  );
}
