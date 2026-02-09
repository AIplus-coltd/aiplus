"use client";

import React from "react";

export default function AIScoreBadge({ score = 90, size = 48 }: { score?: number; size?: number }) {
  // グラデーションとフィルターのID
  const gradId = `grad-${Math.random().toString(36).substring(7)}`;
  const glowId = `glow-${Math.random().toString(36).substring(7)}`;
  
  // 六角形頂点を計算（上を0度とする）
  const createHexagon = (cx: number, cy: number, r: number): string => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180 - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return `M ${points.join(' L ')} Z`;
  };

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const innerR = size / 2 - 10;

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
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        style={{ position: "absolute", top: 0, left: 0 }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* 背景六角形 */}
        <path
          d={createHexagon(cx, cy, innerR)}
          fill="#111827"
        />
        
        {/* グラデーション六角形枠 */}
        <path
          d={createHexagon(cx, cy, outerR)}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
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
