"use client";

import { useEffect, useState } from "react";

export default function Splash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("ai_plus_seen_splash");
    if (!seen) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("ai_plus_seen_splash", "1");
      }, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      aria-label="splash"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(1200px 600px at 50% 10%, rgba(0,120,255,.20), transparent 70%), linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
        transition: "opacity .6s ease",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 16 }}>
          <img
            src="/logo/logo.svg"
            alt="AI+"
            style={{ width: 160, height: 160, objectFit: "contain", filter: "drop-shadow(0 8px 24px rgba(0,160,255,.35))" }}
            onError={(e) => {
              // フォールバック表示（テキスト）
              const el = e.currentTarget;
              el.style.display = "none";
              const fallback = document.getElementById("ai-plus-fallback");
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div id="ai-plus-fallback" style={{ display: "none", fontSize: 42, fontWeight: 800, letterSpacing: 1, background: "linear-gradient(90deg, #64b5f6, #9d4edd)", WebkitBackgroundClip: "text", color: "transparent" }}>
            AI+
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, color: "#cfd8dc" }}>Loading your experience...</div>
      </div>
    </div>
  );
}
