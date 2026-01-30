"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  username: string;
  bio: string;
  avatar: string;
  handle?: string;
  handleLastChangedAt?: string;
};

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  description?: string;
  video_url: string;
  created_at: string;
};

export default function ProfileViewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({ username: "", bio: "", avatar: "👤" });
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [savedVideos, setSavedVideos] = useState<VideoRow[]>([]);
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");

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

    // 現在のユーザーIDを取得
    let userId = null;
    const userSessionRaw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    if (userSessionRaw) {
      try {
        const parsed = JSON.parse(userSessionRaw);
        userId = parsed.id;
      } catch {}
    }
    if (userId) {
      const savedProfile = localStorage.getItem(`userProfile_${userId}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }

    const userSessionRaw2 = sessionStorage.getItem("currentUser");
    const storedUser = userSessionRaw2 || localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const users = JSON.parse(localStorage.getItem("aiplus_users") || "[]");
        const me = users.find((u: any) => u.id === parsed?.id);
        if (me?.handle) {
          setProfile((prev) => ({ ...prev, handle: me.handle }));
        }
      } catch {
        // ignore
      }
    }

    // ユーザーごとの投稿のみ表示
    let userVideos: VideoRow[] = [];
    if (userId) {
      const userVideosRaw = localStorage.getItem(`videos_${userId}`);
      if (userVideosRaw) {
        userVideos = JSON.parse(userVideosRaw);
      }
    }
    setVideos(userVideos);

    const saved = localStorage.getItem("savedVideos");
    const savedList = saved ? JSON.parse(saved) : [];
    setSavedVideos(savedList);

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

  const topVideo = useMemo(() => videos[0], [videos]);

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
          onClick={() => router.push("/tabs/me")}
          style={{ background: "transparent", border: "none", color: themeColor, cursor: "pointer", fontSize: 15 }}
        >
          ←
        </button>
        <div style={{ flex: 1, textAlign: "center", fontWeight: 700, color: themeColor, fontSize: 18 }}>
          マイページ
        </div>
        <button
          onClick={() => router.push("/settings")}
          style={{ background: "transparent", border: "none", color: themeColor, cursor: "pointer", fontSize: 20, padding: "4px 8px" }}
          title="管理ページ"
        >
          ⚙
        </button>
        
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* プロフィールカード */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: backgroundColor === "light"
              ? `linear-gradient(135deg, ${themeColor}05, ${themeColor}02)`
              : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
            border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}40`,
            boxShadow: backgroundColor === "light" ? "0 6px 18px rgba(0,0,0,.06)" : `0 8px 24px ${themeColor}22`,
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}12, ${themeColor}05)`,
              border: `2px solid ${themeColor}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              overflow: "hidden",
            }}
          >
            {profile.avatar && !["👤", "😊", "🎉", "🚀", "💡", "⭐", "🎯", "🔥"].includes(profile.avatar) ? (
              <img
                src={profile.avatar}
                alt="avatar"
                style={{
                  width: 64,
                  height: 64,
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: `2px solid ${themeColor}`,
                  background: "#fff",
                  display: "block",
                  margin: "0 auto"
                }}
              />
            ) : (
              profile.avatar || "👤"
            )}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: themeColor, marginBottom: 6 }}>
              {profile.username || "（未設定）"}
            </div>
            {profile.handle && (
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
                @{profile.handle}
              </div>
            )}
            <div style={{ fontSize: 12, opacity: 0.75, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {profile.bio || "自己紹介がまだありません"}
            </div>
          </div>
        </div>

        {/* ハイライト動画 */}
        {topVideo && (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}12, ${themeColor}06)`,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}40`,
              boxShadow: backgroundColor === "light" ? "0 4px 14px rgba(0,0,0,.06)" : `0 6px 18px ${themeColor}22`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>注目の動画</div>
              <div style={{ fontSize: 11, opacity: 0.65 }}>{new Date(topVideo.created_at).toLocaleString()}</div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 220px", minWidth: 220, maxWidth: 360 }}>
                <video
                  src={topVideo.video_url}
                  controls
                  style={{ width: "100%", borderRadius: 10, border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}26`, maxHeight: 240, objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: "1 1 220px", minWidth: 220 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{topVideo.title || "タイトルなし"}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 8, lineHeight: 1.6 }}>
                  {topVideo.description || "説明がありません"}
                </div>
                <div style={{ fontSize: 11, opacity: 0.65 }}>
                  {topVideo.created_at ? new Date(topVideo.created_at).toLocaleDateString() : ""}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 保存した動画 */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>
              保存した動画 ({savedVideos.length})
            </div>
            {savedVideos.length > 0 && (
              <button
                onClick={() => router.push("/tabs/saved")}
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
                すべて見る →
              </button>
            )}
          </div>
          {savedVideos.length === 0 ? (
            <div style={{ opacity: 0.7, fontSize: 14 }}>まだ保存した動画がありません</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
              {savedVideos.slice(0, 6).map((v, idx) => (
                <div key={`saved-${v.id}-${idx}`} style={{ position: "relative", paddingBottom: "100%", overflow: "hidden", borderRadius: 8 }}>
                  <video
                    src={v.video_url}
                    controls
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 投稿グリッド */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>投稿一覧 ({videos.length})</div>
            {videos.length > 0 && (
              <button
                onClick={() => router.push("/tabs/me/posts")}
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
                すべて見る →
              </button>
            )}
          </div>
          {videos.length === 0 ? (
            <div style={{ opacity: 0.7, fontSize: 14 }}>まだ投稿がありません</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
              {videos.map((v, idx) => (
                <div key={`post-${v.id}-${idx}`} style={{ position: "relative", paddingBottom: "100%", overflow: "hidden", borderRadius: 8 }}>
                  <video
                    src={v.video_url}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
