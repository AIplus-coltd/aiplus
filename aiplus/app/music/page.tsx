"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Song = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  plays: number;
};

type VideoPost = {
  id: string;
  title: string;
  user_id: string;
  aiScore?: number;
  musicId?: string;
  created_at: string;
};

export default function MusicPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<VideoPost[]>([]);
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const loadSettings = () => {
      // テーマ設定を取得
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
    };

    const loadSongs = () => {
      // モック曲データ
      const mockSongs: Song[] = [
        {
          id: "song-1",
          title: "Digital Dreams",
          artist: "AI+ Sound",
          duration: 240,
          plays: 1280,
        },
        {
          id: "song-2",
          title: "Night Lights",
          artist: "Synthwave Artist",
          duration: 220,
          plays: 956,
        },
        {
          id: "song-3",
          title: "Future Wave",
          artist: "Electronic Beats",
          duration: 260,
          plays: 2340,
        },
        {
          id: "song-4",
          title: "Cosmic Journey",
          artist: "Space Music Lab",
          duration: 300,
          plays: 1850,
        },
        {
          id: "song-5",
          title: "Neon City",
          artist: "Urban Synth",
          duration: 210,
          plays: 3120,
        },
    ];
      setSongs(mockSongs);
      if (mockSongs.length > 0) {
        setCurrentTrack(mockSongs[0]);
        fetchRelatedPosts(mockSongs[0].id);
      }
    };

    loadSettings();
    loadSongs();
    // カスタムイベント "themeChanged" をリッスンして設定変更を監視
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

  // 曲に関連する投稿を取得
  const fetchRelatedPosts = async (songId: string) => {
    try {
      const stored = localStorage.getItem("videos");
      if (stored) {
        const allVideos: VideoPost[] = JSON.parse(stored);
        const filtered = allVideos.filter((v) => v.musicId === songId);
        setRelatedPosts(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch related posts:", error);
      setRelatedPosts([]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: backgroundColor === "light" ? "#f8f8f8" : "linear-gradient(135deg, #0a0014 0%, #0f0519 50%, #1a0a28 100%)",
        color: backgroundColor === "light" ? "#333" : "white",
        paddingBottom: 90,
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(157,78,221,.15)",
          background: "linear-gradient(180deg, rgba(26,10,40,.98) 0%, rgba(20,5,35,.96) 100%)",
          backdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 2px 16px rgba(123,44,191,.2)",
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
            color: "#9d4edd",
            cursor: "pointer",
            fontSize: 20,
            padding: 4,
          }}
        >
          ←
        </button>
        <div style={{ fontSize: 16, fontWeight: "700", color: "#c77dff", letterSpacing: "0.02em" }}>
          Music
        </div>
        <div style={{ width: 28 }} />
      </div>

      {/* 現在再生中のトラック */}
      {currentTrack && (
        <div
          style={{
            padding: 24,
            margin: 16,
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(157,78,221,.25), rgba(199,125,255,.15))",
            border: "1px solid rgba(157,78,221,.3)",
            boxShadow: "0 0 24px rgba(157,78,221,.2)",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(157,78,221,.8), rgba(199,125,255,.6))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: "0 8px 32px rgba(157,78,221,.4)",
            }}
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="18" cy="16" r="2" />
            </svg>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: "700", color: "#c77dff", marginBottom: 4 }}>
              {currentTrack.title}
            </div>
            <div style={{ fontSize: 14, color: "#9d8ab8" }}>
              {currentTrack.artist}
            </div>
          </div>

          {/* プレイヤーコントロール */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: "rgba(157,78,221,.3)",
                color: "#c77dff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              ⏮
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg, rgba(157,78,221,.8), rgba(199,125,255,.7))",
                color: "#FFFFFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: "bold",
                boxShadow: "0 0 20px rgba(157,78,221,.6)",
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: "rgba(157,78,221,.3)",
                color: "#c77dff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              ⏭
            </button>
          </div>

          {/* プログレスバー */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                width: "100%",
                height: 4,
                background: "rgba(157,78,221,.2)",
                borderRadius: 2,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: "35%",
                  height: "100%",
                  background: "linear-gradient(90deg, #9d4edd, #c77dff)",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.7 }}>
              <span>1:24</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* 再生数 */}
          <div style={{ fontSize: 12, color: "#9d8ab8", textAlign: "center" }}>
            {currentTrack.plays.toLocaleString()} plays
          </div>
        </div>
      )}

      {/* プレイリスト */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: "700", color: "#9d4edd", marginBottom: 12 }}>
          All Songs
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {songs.map((song) => (
            <div
              key={song.id}
              onClick={() => {
                setCurrentTrack(song);
                fetchRelatedPosts(song.id);
              }}
              style={{
                padding: 12,
                borderRadius: 10,
                background:
                  currentTrack?.id === song.id
                    ? "linear-gradient(135deg, rgba(157,78,221,.4), rgba(199,125,255,.3))"
                    : "rgba(26,10,40,.6)",
                border:
                  currentTrack?.id === song.id
                    ? "1px solid rgba(157,78,221,.5)"
                    : "1px solid rgba(157,78,221,.15)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, rgba(157,78,221,.6), rgba(199,125,255,.5))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                </svg>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: currentTrack?.id === song.id ? "#c77dff" : "#e0cffc",
                    marginBottom: 2,
                  }}
                >
                  {song.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#9d8ab8",
                  }}
                >
                  {song.artist} • {formatTime(song.duration)}
                </div>
              </div>

              <div style={{ fontSize: 11, opacity: 0.6, color: "#9d8ab8", flexShrink: 0 }}>
                {song.plays.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 関連投稿セクション */}
      <div style={{ padding: 16, paddingTop: 8 }}>
        <div style={{ fontSize: 14, fontWeight: "700", color: "#9d4edd", marginBottom: 12 }}>
          この曲を使った投稿 ({relatedPosts.length})
        </div>

        {relatedPosts.length === 0 ? (
          <div
            style={{
              padding: 24,
              borderRadius: 12,
              background: "rgba(157,78,221,.1)",
              border: "1px dashed rgba(157,78,221,.3)",
              textAlign: "center",
              color: "#9d8ab8",
              fontSize: 13,
            }}
          >
            この曲を使った投稿はまだありません
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {relatedPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(26,10,40,.8), rgba(20,5,35,.75))",
                  border: "1px solid rgba(157,78,221,.2)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => router.push(`/tabs/feed`)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, rgba(157,78,221,.6), rgba(199,125,255,.5))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#e0cffc",
                        marginBottom: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {post.title || "無題の投稿"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9d8ab8",
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <span>ID: {post.user_id}</span>
                      {post.aiScore !== undefined && <span>AI: {post.aiScore}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
