"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

function GradIcon({ type, active, themeColor }: { type: "home" | "chat" | "shop" | "add" | "profile" | "score" | "news"; active?: boolean; themeColor?: string }) {
  const id = `grad-${type}`;
  const baseColor = themeColor || "#9d4edd";
  
  // Lighten color for active state
  const lightenColor = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    r = Math.min(255, r + 50);
    g = Math.min(255, g + 50);
    b = Math.min(255, b + 50);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };
  
  const colorA = active ? lightenColor(baseColor) : baseColor;
  const colorB = active ? baseColor : baseColor.replace(/\d{2}(?=[A-Fa-f0-9]{4}$)/, match => Math.max(0, parseInt(match, 16) - 30).toString(16).padStart(2, "0"));
  const common = { width: 22, height: 22 } as const;
  return (
    <svg {...common} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colorA} />
          <stop offset="100%" stopColor={colorB} />
        </linearGradient>
      </defs>
      {type === "home" && (
        <g fill="url(#grad-home)" stroke="none">
          <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
          <rect x="9" y="14" width="6" height="6" fill="#00000040" />
        </g>
      )}
      {type === "chat" && (
        <g fill="none" stroke="url(#grad-chat)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </g>
      )}
      {type === "shop" && (
        <g fill="none" stroke="url(#grad-shop)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4h2l2 12h10l2-8H7" />
          <circle cx="9" cy="20" r="2" />
          <circle cx="17" cy="20" r="2" />
        </g>
      )}
      {type === "add" && (
        <g fill="none" stroke="url(#grad-add)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 12 17 12" />
          <polyline points="12 7 17 12 12 17" />
        </g>
      )}
      {type === "profile" && (
        <g fill="none" stroke="url(#grad-profile)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17h11A2.5 2.5 0 0 1 20 19.5v.5H4v-.5z" />
          <circle cx="12" cy="7" r="2.5" />
        </g>
      )}
      {type === "score" && (
        <g fill="none" stroke="url(#grad-score)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l4 2" />
        </g>
      )}
      {type === "news" && (
        <g fill="none" stroke="url(#grad-news)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="6" width="14" height="12" rx="2" ry="2" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="15" x2="13" y2="15" />
        </g>
      )}
    </svg>
  );
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [themeColor, setThemeColor] = useState<string>("#9d4edd");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem("appSettings");
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      const color = settings.themeColor || "purple";
      const bgColor = settings.backgroundColor || "dark";
      
      const themeMap: Record<string, string> = {
        pink: "#ff1493",
        blue: "#64b5f6",
        green: "#81c784",
        purple: "#9d4edd",
      };
      
      setThemeColor(themeMap[color] || "#9d4edd");
      setBackgroundColor(bgColor);
    };

    loadSettings();

    // カスタムイベント "themeChanged" をリッスンして設定変更を監視
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const color = customEvent.detail.themeColor || "purple";
        const bgColor = customEvent.detail.backgroundColor || "dark";
        
        const themeMap: Record<string, string> = {
          pink: "#ff1493",
          blue: "#64b5f6",
          green: "#81c784",
          purple: "#9d4edd",
        };
        
        setThemeColor(themeMap[color] || "#9d4edd");
        setBackgroundColor(bgColor);
      }
    };
    
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const isActive = (path: string) => pathname?.includes(path);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        maxWidth: 430,
        margin: "0 auto",
        padding: "8px 0 max(env(safe-area-inset-bottom), 10px)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        background: backgroundColor === "light"
          ? "linear-gradient(180deg, rgba(245,245,245,.98) 0%, rgba(240,240,240,.96) 100%)"
          : "linear-gradient(180deg, rgba(26,10,40,.98) 0%, rgba(20,5,35,.96) 100%)",
        borderTop: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}26`,
        backdropFilter: "blur(20px) saturate(180%)",
        boxShadow: `0 -2px 12px ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}1f`,
      }}
    >
      <NavItem
        label="Feed"
        icon={<GradIcon type="home" active={isActive("feed")} themeColor={themeColor} />}
        active={isActive("feed")}
        onClick={() => router.push("/tabs/feed")}
        themeColor={themeColor}
        backgroundColor={backgroundColor}
      />
      <NavItem
        label="投稿"
        icon={<GradIcon type="add" active={isActive("upload")} themeColor={themeColor} />}
        active={isActive("upload")}
        onClick={() => router.push("/upload")}
        themeColor={themeColor}
        backgroundColor={backgroundColor}
      />
      <NavItem
        label="Chats"
        icon={<GradIcon type="chat" active={isActive("inbox")} themeColor={themeColor} />}
        active={isActive("inbox")}
        onClick={() => router.push("/tabs/inbox")}
        themeColor={themeColor}
        backgroundColor={backgroundColor}
      />
      <NavItem
        label="Shop"
        icon={<GradIcon type="shop" active={isActive("shop")} themeColor={themeColor} />}
        active={isActive("shop")}
        onClick={() => router.push("/tabs/shop")}
        themeColor={themeColor}
        backgroundColor={backgroundColor}
      />
      <NavItem
        label="スコア"
        icon={<GradIcon type="score" active={isActive("score")} themeColor={themeColor} />}
        active={isActive("score")}
        onClick={() => router.push("/tabs/score")}
        themeColor={themeColor}
        backgroundColor={backgroundColor}
      />
      <NavItem
        label="ネタ"
        icon={<GradIcon type="news" active={isActive("ideas")} themeColor={themeColor} />}
        active={isActive("ideas")}
        onClick={() => router.push("/tabs/ideas")}
        themeColor={themeColor}
        backgroundColor={backgroundColor}
      />
      <NavItem
        label="プロフィール"
        icon={<GradIcon type="profile" active={isActive("me")} themeColor={themeColor} />}
        active={isActive("me")}
        onClick={() => router.push("/tabs/me/view")}
        themeColor={themeColor}
        backgroundColor={backgroundColor}
      />
    </div>
  );
}

function NavItem({
  label,
  icon,
  active,
  onClick,
  themeColor,
  backgroundColor,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  themeColor?: string;
  backgroundColor?: "dark" | "light";
}) {
  const baseColor = themeColor || "#9d4edd";
  const lightenColor = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
    r = Math.min(255, r + 50);
    g = Math.min(255, g + 50);
    b = Math.min(255, b + 50);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };
  
  const activeColor = lightenColor(baseColor);
  return (
    <button
      onClick={onClick}
      style={{
        background: active 
          ? backgroundColor === "light"
            ? `linear-gradient(135deg, ${baseColor}20, ${activeColor}28)`
            : `linear-gradient(135deg, ${baseColor}38, ${activeColor}40)`
          : "transparent",
        border: "none",
        color: active ? activeColor : backgroundColor === "light" ? baseColor : baseColor,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        padding: "6px 18px",
        borderRadius: 10,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontWeight: active ? 700 : 500,
        boxShadow: active ? `0 0 16px ${baseColor}${backgroundColor === "light" ? "28" : "40"}` : "none",
      }}
      title={label}
    >
      <div style={{ color: active ? activeColor : baseColor }}>{icon}</div>
      <div style={{ letterSpacing: "0.01em", display: "none" }}>{label}</div>
    </button>
  );
}
