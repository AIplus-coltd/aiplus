"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  description?: string;
  video_url: string;
  hashtags?: string[];
  created_at: string;
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VideoRow[]>([]);
  const [allVideos, setAllVideos] = useState<VideoRow[]>([]);
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
  const placeholderColor = backgroundColor === "light" ? "#777" : `${themeColor}cc`;

  useEffect(() => {
    // ローカルストレージから全動画を取得
    const mockVideos = localStorage.getItem("mockVideos");
    const videos = mockVideos ? JSON.parse(mockVideos) : [];
    setAllVideos(videos);
    
    // テーマ設定読み込み
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
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
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const color = customEvent.detail.themeColor || "pink";
        const bgColor = customEvent.detail.backgroundColor || "dark";
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

  const handleSearch = (text: string) => {
    setQuery(text);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = text.toLowerCase();
    const filtered = allVideos.filter((v) => {
      const title = (v.title || "").toLowerCase();
      const userId = (v.user_id || "").toLowerCase();
      const hashtags = (v.hashtags || []).join(" ").toLowerCase();
      
      return title.includes(searchTerm) || 
             userId.includes(searchTerm) || 
             hashtags.includes(searchTerm);
    });

    setResults(filtered);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: backgroundColor === "light"
          ? "#f8f8f8"
          : "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
        color: backgroundColor === "light" ? "#333" : "white",
      }}
    >
      {/* サーチバー */}
      <div
        style={{
          padding: 16,
          borderBottom: backgroundColor === "light" ? "1px solid rgba(0,0,0,.08)" : `1px solid ${themeColor}26`,
          background: backgroundColor === "light" ? "#ffffff" : "rgba(20,0,40,.6)",
          boxShadow: backgroundColor === "light" ? "0 4px 14px rgba(0,0,0,.08)" : `0 6px 14px ${themeColor}1f`,
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="タイトル、ユーザー名、#ハッシュタグで検索"
          className="search-input"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 20,
            border: backgroundColor === "light" ? `1px solid ${themeColor}55` : `1px solid ${themeColor}80`,
            background: backgroundColor === "light"
              ? `linear-gradient(135deg, #ffffff, ${themeColor}10)`
              : `linear-gradient(135deg, ${themeColor}33, ${themeColor}1a)`,
            backdropFilter: "blur(8px)",
            color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
            caretColor: themeColor,
            outline: "none",
            fontSize: 14,
            boxShadow: backgroundColor === "light"
              ? `0 0 10px ${themeColor}26, inset 0 2px 6px rgba(0,0,0,.05)`
              : `0 0 16px ${themeColor}33, inset 0 2px 8px rgba(0,0,0,.4)`,
          }}
        />
        <style jsx>{`
          .search-input::placeholder {
            color: ${placeholderColor};
          }
        `}</style>
      </div>

      {/* 検索結果 */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {query && results.length === 0 ? (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            検索結果がありません
          </div>
        ) : results.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", opacity: 0.7 }}>
            検索してみましょう
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 8,
              padding: 8,
            }}
          >
            {results.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  // 動画ページへリンク（将来実装）
                }}
                style={{
                  position: "relative",
                  paddingBottom: "100%",
                  overflow: "hidden",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: backgroundColor === "light" ? `1px solid ${themeColor}1f` : `1px solid ${themeColor}26`,
                  boxShadow: backgroundColor === "light" ? "0 6px 16px rgba(0,0,0,.06)" : `0 6px 16px ${themeColor}1f`,
                }}
              >
                <video
                  src={v.video_url}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onMouseEnter={(e) => {
                    const video = e.currentTarget;
                    video.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget;
                    video.pause();
                  }}
                />

                {/* タイトルオーバーレイ */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 8,
                    background:
                      backgroundColor === "light"
                        ? "linear-gradient(transparent, rgba(0,0,0,.4))"
                        : "linear-gradient(transparent, rgba(0,0,0,.6))",
                    fontSize: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v.title}
                  {v.hashtags && v.hashtags.length > 0 && (
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                      {v.hashtags.slice(0, 2).join(" ")}
                    </div>
                  )}
                </div>

                {/* ユーザーバッジ */}
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: backgroundColor === "light" ? `${themeColor}e6` : "rgba(0,0,0,.5)",
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    color: backgroundColor === "light" ? "#fff" : "#fff",
                  }}
                >
                  @{v.user_id?.slice(0, 6) ?? "anon"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
