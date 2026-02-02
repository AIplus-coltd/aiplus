"use client";

import React from "react";

export default function AIScoreBadge({ score = 90, size = 48 }: { score?: number; size?: number }) {
  // グラデーションID
  const gradId = `ai-score-grad-${Math.random().toString(36).slice(2)}`;
  const glowId = `ai-score-glow-${Math.random().toString(36).slice(2)}`;
  
  // 六角形のパスを生成
  const hexagonPath = (centerX: number, centerY: number, radius: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度から開始して上向きに
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')} Z`;
  };

  const center = size / 2;
  const outerRadius = (size - 4) / 2;
  const innerRadius = (size - 16) / 2;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        filter: "drop-shadow(0 0 16px rgba(34, 211, 238, 0.6)) drop-shadow(0 0 8px rgba(250, 204, 21, 0.4))",
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* 外側の六角形ボーダー */}
        <path
          d={hexagonPath(center, center, outerRadius)}
          stroke={`url(#${gradId})`}
          strokeWidth={4}
          fill="none"
          filter={`url(#${glowId})`}
        />
        {/* 内側の背景六角形 */}
        <path
          d={hexagonPath(center, center, innerRadius)}
          fill="#111827"
        />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          position: "relative",
        }}
      >
        <span style={{ 
          fontSize: size * 0.38, 
          fontWeight: 800, 
          color: "#fff", 
          lineHeight: 1,
          textShadow: "0 0 8px rgba(34, 211, 238, 0.5)"
        }}>{score}</span>
        <span style={{ 
          fontSize: size * 0.18, 
          fontWeight: 700, 
          background: "linear-gradient(135deg, #22D3EE 0%, #FACC15 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 1, 
          marginTop: -2 
        }}>AI</span>
      </div>
    </div>
  );
}
