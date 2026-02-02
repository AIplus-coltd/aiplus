"use client";

import { useRouter, usePathname } from "next/navigation";

const ACTIVE_COLOR = "#38BDF8";
const BG_DARK = "#0B1020";
const COLOR_SUB = "#9CA3AF";

const TABS = [
  { key: "feed", label: "Feed", icon: "home" },
  { key: "shop", label: "Shop", icon: "shop" },
  { key: "post", label: "投稿", icon: "play" },
  { key: "sell", label: "出品", icon: "upload" },
  { key: "profile", label: "Profile", icon: "profile" },
];

function GradIcon({ type, active }: { type: string; active?: boolean }) {
  const size = type === "play" ? 30 : 26;

  if (type === "play") {
    return (
      <svg width={size + 10} height={size + 2} viewBox="0 0 34 26" fill="none">
        <defs>
          <linearGradient id="play-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F3F4F6" />
            <stop offset="50%" stopColor="#D1D5DB" />
            <stop offset="100%" stopColor="#9CA3AF" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="30" height="22" rx="7" fill="url(#play-silver)" />
        <rect x="2" y="2" width="30" height="22" rx="7" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        <polygon points="14,8 22,13 14,18" fill="#FFFFFF" />
      </svg>
    );
  }

  if (type === "home") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? ACTIVE_COLOR : COLOR_SUB} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5L12 4l9 7.5" />
        <path d="M5 10.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9.5" />
      </svg>
    );
  }

  if (type === "shop") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? ACTIVE_COLOR : COLOR_SUB} strokeWidth="2" strokeLinecap="round">
        <path d="M3 4h2l2 12h10l2-8H7" />
        <circle cx="9" cy="20" r="2" />
        <circle cx="17" cy="20" r="2" />
      </svg>
    );
  }

  if (type === "profile") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? ACTIVE_COLOR : COLOR_SUB} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
      </svg>
    );
  }

  if (type === "upload") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? ACTIVE_COLOR : COLOR_SUB} strokeWidth="2" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? ACTIVE_COLOR : COLOR_SUB} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7a2 2 0 0 1 2-2h2l2-2h4l2 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="18" cy="9" r="1" />
    </svg>
  );
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (key: string) => {
    if (key === "feed") return pathname === "/tabs/feed";
    if (key === "post") return pathname?.includes("/upload");
    if (key === "shop") return pathname?.includes("shop");
    if (key === "sell") return pathname?.includes("sell");
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
        height: 70,
        backgroundColor: "transparent",
        borderTop: "none",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 999,
        backdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => {
            if (tab.key === "feed") router.push("/tabs/feed");
            if (tab.key === "shop") router.push("/tabs/shop");
            if (tab.key === "post") router.push("/upload/camera");
            if (tab.key === "sell") router.push("/sell");
            if (tab.key === "profile") router.push("/tabs/me/view");
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            color: isActive(tab.key) ? ACTIVE_COLOR : COLOR_SUB,
            transition: "all 0.3s ease",
            filter: isActive(tab.key)
              ? "drop-shadow(0 0 10px rgba(56,189,248,0.9)) drop-shadow(0 0 20px rgba(56,189,248,0.5))"
              : "none",
          }}
        >
          <GradIcon type={tab.icon} active={isActive(tab.key)} />
        </button>
      ))}
    </nav>
  );
}
