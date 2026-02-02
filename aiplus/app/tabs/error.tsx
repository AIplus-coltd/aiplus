"use client";
import React from "react";

export default function TabsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>エラーが発生しました</h1>
      <pre style={{ color: "#c00", background: "#fff0f0", padding: 16, borderRadius: 8 }}>{error?.message}</pre>
      <button onClick={reset} style={{ marginTop: 24, padding: "10px 24px", borderRadius: 8, background: "#2b7ba8", color: "#fff", fontWeight: 600 }}>
        リロード
      </button>
    </div>
  );
}
