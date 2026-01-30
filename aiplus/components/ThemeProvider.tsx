"use client";

import { useEffect, useState, ReactNode } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    applyTheme();

    // ストレージ変更をリッスン
    const handleStorageChange = () => {
      applyTheme();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const applyTheme = () => {
    const savedSettings = localStorage.getItem("appSettings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    
    const themeColor = "blue";
    const backgroundColor = "light";

    localStorage.setItem("appSettings", JSON.stringify({ ...settings, themeColor, backgroundColor }));

    // CSS変数を設定（すべて青系で統一）
    const themeColors: Record<string, { primary: string; light: string; dark: string }> = {
      blue: { primary: "#2b7ba8", light: "#3c8ec4", dark: "#1f5f88" },
      pink: { primary: "#2b7ba8", light: "#3c8ec4", dark: "#1f5f88" },
      green: { primary: "#2b7ba8", light: "#3c8ec4", dark: "#1f5f88" },
      purple: { primary: "#2b7ba8", light: "#3c8ec4", dark: "#1f5f88" },
    };

    const colors = themeColors[themeColor] || themeColors.blue;

    document.documentElement.style.setProperty("--theme-primary", colors.primary);
    document.documentElement.style.setProperty("--theme-light", colors.light);
    document.documentElement.style.setProperty("--theme-dark", colors.dark);

    // 背景は常に白に固定
    document.documentElement.style.setProperty("--bg-primary", "#ffffff");
    document.documentElement.style.setProperty("--bg-secondary", "#ffffff");
    document.documentElement.style.setProperty("--text-primary", "#1f2933");

    // body の背景を白に固定
    document.body.style.background = "#ffffff";
    document.body.style.color = "#1f2933";
  };

  if (!mounted) return null;

  return <>{children}</>;
}
