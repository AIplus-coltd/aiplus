"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  privacy: "public" | "private" | "friends";
  themeColor: "pink" | "blue" | "green" | "purple";
  backgroundColor: "dark" | "light";
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    privacy: "public",
    themeColor: "pink",
    backgroundColor: "dark",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // ローカルストレージから設定を取得
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      
      // テーマ色を更新
      const themeMap: Record<string, string> = {
        pink: "#ff1493",
        blue: "#64b5f6",
        green: "#81c784",
        purple: "#9d4edd",
      };
      setThemeColor(themeMap[parsed.themeColor] || "#ff1493");
      setBackgroundColor(parsed.backgroundColor || "dark");
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("appSettings", JSON.stringify(settings));
    
    // カスタムイベントをディスパッチしてテーマを再適用
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: settings }));
    
    setTimeout(() => {
      setIsSaving(false);
      router.back();
    }, 300);
  };

  const privacyOptions = [
    { value: "public" as const, label: "公開", description: "誰でも見られます" },
    { value: "friends" as const, label: "フレンドのみ", description: "フレンドだけが見られます" },
    { value: "private" as const, label: "非公開", description: "自分だけが見られます" },
  ];

  const themeOptions = [
    { value: "pink" as const, label: "ピンク", color: "#ff1493" },
    { value: "blue" as const, label: "ブルー", color: "#64b5f6" },
    { value: "green" as const, label: "グリーン", color: "#81c784" },
    { value: "purple" as const, label: "パープル", color: "#9d4edd" },
  ];

  const backgroundOptions = [
    { value: "dark" as const, label: "ダーク", emoji: "🌙" },
    { value: "light" as const, label: "ライト", emoji: "☀️" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: backgroundColor === "light" 
          ? "#f8f8f8" 
          : "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
        color: backgroundColor === "light" ? "#333" : "white",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "12px 16px",
          borderBottom: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}26`,
          background: backgroundColor === "light"
            ? "#ffffff"
            : `linear-gradient(180deg, rgba(26,10,40,.98) 0%, ${themeColor}12)`,
          backdropFilter: "blur(20px) saturate(180%)",
          boxShadow: `0 2px 16px ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}33`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            color: themeColor,
            cursor: "pointer",
            fontSize: 20,
            padding: 4,
          }}
        >
          ←
        </button>
        <div style={{ fontSize: 16, fontWeight: "700", color: themeColor, letterSpacing: "0.02em" }}>
          設定
        </div>
        <div style={{ width: 28 }} />
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, overflow: "auto", paddingBottom: 200 }}>
        {/* プライバシー設定 */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: "700", color: themeColor, marginBottom: 12 }}>
            🔒 プライバシー設定
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {privacyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings((p) => ({ ...p, privacy: option.value }))}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: settings.privacy === option.value ? `2px solid ${themeColor}` : `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : "rgba(157,78,221,.2)"}`,
                  background:
                    settings.privacy === option.value
                      ? `${themeColor}15`
                      : backgroundColor === "light" ? "rgba(0,0,0,.02)" : "rgba(26,10,40,.6)",
                  color: backgroundColor === "light" ? "#333" : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ fontWeight: "600" }}>{option.label}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* テーマ設定 */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: "700", color: themeColor, marginBottom: 12 }}>
            🎨 テーマカラー
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSettings((p) => ({ ...p, themeColor: option.value }));
                  setThemeColor(option.color);
                }}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: settings.themeColor === option.value ? "2px solid " + option.color : `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : "rgba(157,78,221,.2)"}`,
                  background: backgroundColor === "light" ? "rgba(0,0,0,.02)" : "rgba(26,10,40,.6)",
                  color: backgroundColor === "light" ? "#333" : "white",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${option.color}, ${option.color}dd)`,
                    boxShadow: `0 0 12px ${option.color}88`,
                  }}
                />
                <div style={{ fontSize: 12, fontWeight: "600" }}>{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 背景設定 */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: "700", color: themeColor, marginBottom: 12 }}>
            🌈 背景色
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {backgroundOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSettings((p) => ({ ...p, backgroundColor: option.value }));
                  setBackgroundColor(option.value);
                }}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: settings.backgroundColor === option.value ? `2px solid ${themeColor}` : `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : "rgba(157,78,221,.2)"}`,
                  background: option.value === "light" ? "#ffffff" : backgroundColor === "light" ? "#ffffff" : "rgba(26,10,40,.6)",
                  color: option.value === "light" ? "#333" : backgroundColor === "light" ? "#333" : "white",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 24 }}>{option.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: "600" }}>{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* プロフィール編集 */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: "700", color: themeColor, marginBottom: 12 }}>
            👤 アカウント
          </div>
          <button
            onClick={() => router.push("/tabs/me")}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: backgroundColor === "light"
                ? "1px solid rgba(0,0,0,.1)"
                : `1px solid ${themeColor}55`,
              background: backgroundColor === "light" ? "#ffffff" : "rgba(26,10,40,.6)",
              color: backgroundColor === "light" ? "#333" : "white",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.3s ease",
              fontWeight: "500",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: backgroundColor === "light" ? "0 8px 20px rgba(0,0,0,.06)" : `0 8px 20px ${themeColor}1f`,
            }}
          >
            <span>プロフィール編集</span>
            <span style={{ opacity: 0.8, color: themeColor }}>→</span>
          </button>
        </div>

        {/* その他 */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: "700", color: themeColor, marginBottom: 12 }}>
            ℹ️ その他
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border: backgroundColor === "light"
                  ? "1px solid rgba(0,0,0,.08)"
                  : `1px solid ${themeColor}33`,
                background: backgroundColor === "light" ? "#ffffff" : "rgba(26,10,40,.6)",
                fontSize: 12,
                color: backgroundColor === "light" ? "#444" : "rgba(255,255,255,.8)",
              }}
            >
              <div style={{ fontWeight: "600", marginBottom: 4 }}>アプリバージョン</div>
              <div>1.0.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div
        style={{
          position: "fixed",
          bottom: 90,
          left: 0,
          right: 0,
          padding: 16,
          maxWidth: 430,
          margin: "0 auto",
          zIndex: 40,
          background:
            backgroundColor === "light"
              ? "linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.86) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.4) 100%)",
        }}
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: `1px solid ${themeColor}80`,
            background: `linear-gradient(135deg, ${themeColor}b3, ${themeColor}80)`,
            color: "#ffffff",
            cursor: isSaving ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: 14,
            boxShadow: `0 0 16px ${themeColor}44`,
            transition: "all 0.3s ease",
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
