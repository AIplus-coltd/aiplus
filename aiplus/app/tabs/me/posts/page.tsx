"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  description?: string;
  video_url: string;
  created_at: string;
};

export default function MyPostsPage() {
  const router = useRouter();
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
  const [videos, setVideos] = useState<VideoRow[]>([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    const color = settings.themeColor || "pink";
    const bgColor = settings.backgroundColor || "dark";
    const themeMap: Record<string, string> = {
      pink: "#ff1493",
      blue: "#64b5f6",
      green: "#81c784",
      purple: "#9d4edd",
    };
    setThemeColor(themeMap[color] || "#ff1493");
    setBackgroundColor(bgColor);

    const mockVideos = localStorage.getItem("mockVideos");
    const allVideos = mockVideos ? JSON.parse(mockVideos) : [];
    setVideos(allVideos);

    const handleThemeChange = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail) {
        const c = ce.detail.themeColor || "pink";
        const bg = ce.detail.backgroundColor || "dark";
        const tm: Record<string, string> = {
          pink: "#ff1493",
          blue: "#64b5f6",
          green: "#81c784",
          purple: "#9d4edd",
        };
        setThemeColor(tm[c] || "#ff1493");
        setBackgroundColor(bg);
      }
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const orderedVideos = useMemo(() => {
    return [...videos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [videos]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: backgroundColor === "light"
          ? "#ffffff"
          : "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
        color: backgroundColor === "light" ? "#333" : "white",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: backgroundColor === "light" ? `1px solid ${themeColor}26` : `1px solid ${themeColor}40`,
          background: backgroundColor === "light"
            ? "linear-gradient(180deg, rgba(245,245,245,.95) 0%, rgba(240,240,240,.93) 100%)"
            : "linear-gradient(180deg, rgba(20,0,40,.95) 0%, rgba(30,5,60,.93) 100%)",
          boxShadow: backgroundColor === "light"
            ? "0 2px 16px rgba(0,0,0,.08), inset 0 -1px 0 rgba(0,0,0,.05)"
            : `0 2px 16px ${themeColor}33, inset 0 -1px 0 ${themeColor}1a`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ background: "transparent", border: "none", color: themeColor, cursor: "pointer", fontSize: 18 }}
        >
          ←
        </button>
        <div style={{ fontWeight: "bold", color: themeColor, textShadow: `0 0 16px ${themeColor}66`, fontSize: 18 }}>
          投稿一覧
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>投稿数: {orderedVideos.length}</div>
          {orderedVideos.length > 0 && (
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              新しい順に表示
            </div>
          )}
        </div>

        {orderedVideos.length === 0 ? (
          <div style={{ opacity: 0.75, fontSize: 14 }}>まだ投稿がありません</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
            {orderedVideos.map((v) => (
              <div
                key={v.id}
                style={{
                  position: "relative",
                  paddingBottom: "130%",
                  overflow: "hidden",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}33`,
                  boxShadow: backgroundColor === "light" ? "0 3px 12px rgba(0,0,0,.05)" : `0 4px 14px ${themeColor}1f`,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)`,
                }}
              >
                <video
                  src={v.video_url}
                  controls
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    right: 6,
                    bottom: 6,
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,.55)",
                    color: "white",
                    fontSize: 11,
                    lineHeight: 1.4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {v.title || "タイトルなし"}
                  </span>
                  {v.created_at && (
                    <span style={{ opacity: 0.8 }}>
                      {new Date(v.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
