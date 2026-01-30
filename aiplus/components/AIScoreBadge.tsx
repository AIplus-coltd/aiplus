"use client";

import React from "react";

export default function AIScoreBadge({ score = 90, size = 48 }: { score?: number; size?: number }) {
  // グラデーションリング
  const gradId = `ai-score-grad-${Math.random().toString(36).slice(2)}`;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 6) / 2}
          stroke={`url(#${gradId})`}
          strokeWidth={5}
          fill="none"
        />
      </svg>
      <div
        style={{
          width: size - 12,
          height: size - 12,
          borderRadius: "50%",
          background: "#111827",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          position: "relative",
        }}
      >
        <span style={{ fontSize: size * 0.38, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.18, fontWeight: 700, color: "#A855F7", letterSpacing: 1, marginTop: -2 }}>AI</span>
      </div>
    </div>
  );
}
