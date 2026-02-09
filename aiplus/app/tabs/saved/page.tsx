"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  description?: string;
  video_url: string;
  created_at: string;
};

type PlayList = {
  id: string;
  name: string;
  videoIds: string[];
  createdAt: string;
};

export default function SavedVideosPage() {
  const router = useRouter();
  const [themeColor, setThemeColor] = useState<string>(() => {
    if (typeof window === "undefined") return "#ff1493";
    const savedSettings = localStorage.getItem("appSettings");
    if (!savedSettings) return "#ff1493";
    try {
      const settings = JSON.parse(savedSettings);
      const color = settings.themeColor || "pink";
      const themeMap: Record<string, string> = {
        pink: "#ff1493",
        blue: "#64b5f6",
        green: "#81c784",
        purple: "#9d4edd",
      };
      return themeMap[color] || "#ff1493";
    } catch {
      return "#ff1493";
    }
  });
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const savedSettings = localStorage.getItem("appSettings");
    if (!savedSettings) return "dark";
    try {
      const settings = JSON.parse(savedSettings);
      return settings.backgroundColor === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  const [savedVideos, setSavedVideos] = useState<VideoRow[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("savedVideos");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [playlists, setPlaylists] = useState<PlayList[]>(() => {
    if (typeof window === "undefined") return [];
    const lists = localStorage.getItem("videoPlaylists");
    if (!lists) return [];
    try {
      const parsed = JSON.parse(lists);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [newListName, setNewListName] = useState("");
  const [showCreateList, setShowCreateList] = useState(false);

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail) {
        const color = ce.detail.themeColor || "pink";
        const bgColor = ce.detail.backgroundColor || "dark";
        const themeMap: Record<string, string> = {
          pink: "#ff1493",
          blue: "#64b5f6",
          green: "#81c784",
          purple: "#9d4edd",
        };
        setThemeColor(themeMap[color] || "#ff1493");
        setBackgroundColor(bgColor);
      }
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newList: PlayList = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      videoIds: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...playlists, newList];
    setPlaylists(updated);
    localStorage.setItem("videoPlaylists", JSON.stringify(updated));
    setNewListName("");
    setShowCreateList(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: backgroundColor === "light" ? "#ffffff" : "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
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
          保存した動画
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* リスト管理 */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>📁 リスト ({playlists.length})</div>
            <button
              onClick={() => setShowCreateList(!showCreateList)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${themeColor}66`,
                background: `linear-gradient(135deg, ${themeColor}4d, ${themeColor}33)`,
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: `0 4px 12px ${themeColor}26`,
              }}
            >
              + 新規リスト
            </button>
          </div>

          {showCreateList && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="リスト名を入力"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                  color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
                }}
              />
              <button
                onClick={handleCreateList}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: `1px solid ${themeColor}80`,
                  background: `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                作成
              </button>
            </div>
          )}

          {playlists.length > 0 && (
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              {playlists.map((list) => (
                <div
                  key={list.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)`,
                    border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}33`,
                    boxShadow: backgroundColor === "light" ? "0 3px 12px rgba(0,0,0,.05)" : `0 4px 14px ${themeColor}1f`,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: themeColor }}>{list.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.65 }}>動画数: {list.videoIds.length}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 保存した動画一覧 */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: themeColor }}>
            保存した動画 ({savedVideos.length})
          </div>
        {savedVideos.length === 0 ? (
          <div style={{ opacity: 0.7, fontSize: 14 }}>まだ保存した動画がありません</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
            {savedVideos.map((v) => (
              <div key={v.id} style={{ position: "relative", paddingBottom: "100%", overflow: "hidden", borderRadius: 8, border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}33` }}>
                <video
                  src={v.video_url}
                  controls
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                />
                <div style={{ position: "absolute", left: 4, right: 4, bottom: 4, fontSize: 9, padding: "4px 6px", borderRadius: 6, background: "rgba(0,0,0,.6)", color: "white", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v.title || "タイトルなし"}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
