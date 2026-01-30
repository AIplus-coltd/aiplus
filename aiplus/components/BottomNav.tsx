import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

// グラデーション定義
const GRAD = "linear-gradient(135deg, #7C3AED 0%, #38BDF8 100%)";
const BG_DARK = "#0B1020";
const BG_CARD = "#111827";
const COLOR_TEXT = "#FFFFFF";
const COLOR_SUB = "#9CA3AF";
const COLOR_INACTIVE = "#23263a";

const TABS = [
  { key: "feed", label: "Feed", icon: "play" },
  { key: "chats", label: "Chats", icon: "chat" },
  { key: "shop", label: "Shop", icon: "shop" },
  { key: "mail", label: "Mail", icon: "mail" },
  { key: "profile", label: "Profile", icon: "profile" },
];

function GradIcon({ type, active }: { type: string; active?: boolean }) {
  // SVGアイコンをtypeで切替
  const size = type === "play" ? 32 : 22;
  const grad = GRAD;
  if (type === "play") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" fill={active ? grad : COLOR_INACTIVE} opacity={active ? 1 : 0.7} />
        <polygon points="19,15 36,24 19,33" fill="#fff" />
      </svg>
    );
  }
  if (type === "chat") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? grad : COLOR_SUB} strokeWidth="2.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (type === "shop") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? grad : COLOR_SUB} strokeWidth="2" strokeLinecap="round">
        <path d="M3 4h2l2 12h10l2-8H7" />
        <circle cx="9" cy="20" r="2" />
        <circle cx="17" cy="20" r="2" />
      </svg>
    );
  }
  if (type === "mail") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? grad : COLOR_SUB} strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3,7 12,13 21,7" />
      </svg>
    );
  }
  if (type === "profile") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? grad : COLOR_SUB} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
      </svg>
    );
  }
  return null;
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // ルーティング判定
  const isActive = (key: string) => {
    if (key === "feed") return pathname === "/tabs/feed";
    if (key === "chats") return pathname?.includes("inbox");
    if (key === "shop") return pathname?.includes("shop");
    if (key === "mail") return pathname?.includes("mail");
    if (key === "profile") return pathname?.includes("me");
    return false;
  };

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        maxWidth: 480,
        margin: "0 auto",
        padding: "8px 0 max(env(safe-area-inset-bottom), 10px)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        background: BG_DARK,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -2px 24px #000a",
        backdropFilter: "blur(16px)",
      }}
    >
      {TABS.map((tab, i) => (
        <button
          key={tab.key}
          onClick={() => {
            if (tab.key === "feed") router.push("/tabs/feed");
            else if (tab.key === "chats") router.push("/tabs/inbox");
            else if (tab.key === "shop") router.push("/tabs/shop");
            else if (tab.key === "mail") router.push("/tabs/mail");
            else if (tab.key === "profile") router.push("/tabs/me/view");
          }}
          style={{
            background: "none",
            border: "none",
            outline: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: tab.key === "feed" ? "1.2" : "1",
            padding: tab.key === "feed" ? "0 8px" : "0 2px",
            marginTop: tab.key === "feed" ? -18 : 0,
            zIndex: tab.key === "feed" ? 2 : 1,
            filter: isActive(tab.key) ? "drop-shadow(0 2px 12px #38BDF8cc)" : "none",
            transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
          }}
          aria-label={tab.label}
        >
          <GradIcon type={tab.icon} active={isActive(tab.key)} />
          <span
            style={{
              fontSize: 10,
              fontWeight: isActive(tab.key) ? 700 : 500,
              color: isActive(tab.key) ? "#fff" : COLOR_SUB,
              marginTop: 2,
              letterSpacing: 0.01,
              userSelect: "none",
              textShadow: isActive(tab.key) ? "0 2px 8px #38BDF8cc" : "none",
              display: "block",
            }}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
