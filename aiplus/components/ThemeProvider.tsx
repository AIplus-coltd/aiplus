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
    
    const themeColor = settings.themeColor || "pink";
    const backgroundColor = settings.backgroundColor || "dark";

    // CSS変数を設定
    const themeColors: Record<string, { primary: string; light: string; dark: string }> = {
      pink: { primary: "#ff1493", light: "#ff69b4", dark: "#c71585" },
      blue: { primary: "#64b5f6", light: "#90caf9", dark: "#1e88e5" },
      green: { primary: "#81c784", light: "#a5d6a7", dark: "#388e3c" },
      purple: { primary: "#9d4edd", light: "#c77dff", dark: "#7b2cbf" },
    };

    const colors = themeColors[themeColor] || themeColors.pink;

    document.documentElement.style.setProperty("--theme-primary", colors.primary);
    document.documentElement.style.setProperty("--theme-light", colors.light);
    document.documentElement.style.setProperty("--theme-dark", colors.dark);

    const bgColors = {
      dark: { primary: "#0a0014", secondary: "#0f0519", text: "#ffffff" },
      light: { primary: "#ffffff", secondary: "#f5f5f5", text: "#000000" },
    };

    const bg = bgColors[backgroundColor as keyof typeof bgColors] || bgColors.dark;
    document.documentElement.style.setProperty("--bg-primary", bg.primary);
    document.documentElement.style.setProperty("--bg-secondary", bg.secondary);
    document.documentElement.style.setProperty("--text-primary", bg.text);

    // body の背景を更新
    if (backgroundColor === "light") {
      document.body.style.background = "linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #eeeeee 100%)";
      document.body.style.color = "#000000";
    } else {
      document.body.style.background = "linear-gradient(135deg, #0a0014 0%, #0f0519 50%, #1a0a28 100%)";
      document.body.style.color = "#ffffff";
    }
  };

  if (!mounted) return null;

  return <>{children}</>;
}
