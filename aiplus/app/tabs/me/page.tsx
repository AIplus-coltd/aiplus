"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  username: string;
  bio: string;
  avatar: string;
};

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  description?: string;
  video_url: string;
  created_at: string;
};

export default function ProfileEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    bio: "",
    avatar: "👤",
  });
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
  const [pageGoal, setPageGoal] = useState("");
  const [pageAudience, setPageAudience] = useState("");
  const [pageTone, setPageTone] = useState("");
  const [ideaMessages, setIdeaMessages] = useState<{ id: string; role: "ai" | "user"; text: string }[]>([
    {
      id: "ai-welcome",
      role: "ai",
      text: "どんなページにしたいか教えてください。目的・ターゲット・雰囲気を書けば、AIがネタ案や構成を提案します。",
    },
  ]);

  useEffect(() => {
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

    // ローカルストレージからプロフィール情報と動画を取得
    // 現在のユーザーIDを取得
    let userId = null;
    const sessionUser = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        userId = parsed.id;
      } catch {}
    }
    if (userId) {
      const savedProfile = localStorage.getItem(`userProfile_${userId}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }

    // ユーザーごとに投稿を分離
    let userVideos: VideoRow[] = [];
    if (userId) {
      const userVideosRaw = localStorage.getItem(`videos_${userId}`);
      if (userVideosRaw) {
        userVideos = JSON.parse(userVideosRaw);
      }
    }
    setVideos(userVideos);

    setReady(true);

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

  const handleSave = () => {
    setIsSaving(true);
    
    // ローカルストレージにプロフィール情報を保存
    // 現在のユーザーIDを取得
    let userId = null;
    const sessionUser = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        userId = parsed.id;
      } catch {}
    }
    if (userId) {
      localStorage.setItem(`userProfile_${userId}` , JSON.stringify(profile));
    }
    
    setTimeout(() => {
      setIsSaving(false);
      router.push("/tabs/me/view");
    }, 300);
  };

  const avatarEmojis = ["👤", "😊", "🎉", "🚀", "💡", "⭐", "🎯", "🔥"];
  const [avatarFileName, setAvatarFileName] = useState("");

  const handleAvatarFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarFileName(file.name);
    setProfile((p) => ({ ...p, avatar: url }));
  };

  const pushIdeaMessage = (role: "ai" | "user", text: string) => {
    setIdeaMessages((prev) => [...prev, { id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, role, text }]);
  };

  const handleGenerateIdeas = () => {
    const goal = pageGoal.trim() || "ファンが集まる自己紹介ページ";
    const audience = pageAudience.trim() || "動画を見てくれる潜在フォロワー";
    const tone = pageTone.trim() || "親しみやすくワクワク";

    pushIdeaMessage("user", `目標: ${goal}\nターゲット: ${audience}\n雰囲気: ${tone}`);

    const suggestions = [
      `レイアウト案: ヒーローエリアに1フレーズのキャッチと最新動画1本を埋め込み。下に「人気3本」「はじめての人はこれ」をカードで並べる。`,
      `CTA: フォローボタンと「次のライブ予定」を並列配置。プロフィール冒頭に1つだけ強いアクションを置く。`,
      `コンテンツ案: ${goal} を軸に、\n- 30秒でわかる自己紹介ショート\n- 毎週の裏側Vlogプレイリスト\n- 視聴者の質問に答えるQ&Aスレッド`,
      `トーン: ${tone} に合わせて色はテーマカラーを薄めたグラデ背景、フォントは読みやすさ優先。`,
      `収益/誘導: 無料オファー（チェックリスト/テンプレ）をページ中段に設置し、メールやSNSリンクを横並びに。`,
      `改善ループ: クリック/再生の多いブロックを優先表示。週1で「反応トップ3」を固定欄に差し替え。`,
    ];

    pushIdeaMessage("ai", suggestions.join("\n\n"));
  };

  if (!ready) {
    return <div style={{ padding: 20, color: backgroundColor === "light" ? "#333" : "white" }}>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: backgroundColor === "light" ? "#f8f8f8" : "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
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
            fontSize: 18,
          }}
        >
          ✕
        </button>
        <div style={{ color: themeColor, fontWeight: "bold" }}>マイページ</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => router.push("/settings")}
            style={{
              background: "transparent",
              border: "none",
              color: themeColor,
              cursor: "pointer",
              fontSize: 20,
              padding: "4px 8px",
            }}
            title="管理ページ"
          >
            ⚙
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: isSaving ? `${themeColor}4d` : `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
              border: `1px solid ${themeColor}80`,
              color: backgroundColor === "light" ? themeColor : "white",
              padding: "8px 12px",
              borderRadius: 6,
              cursor: isSaving ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: `0 0 16px ${themeColor}4d, inset 0 1px 0 ${themeColor}26`,
            }}
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {/* アバター選択 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 12, opacity: 0.8, fontSize: 14, color: themeColor, fontWeight: 600 }}>
            アバター
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {avatarEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setProfile((p) => ({ ...p, avatar: emoji }))}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 50,
                    border:
                      profile.avatar === emoji
                        ? `2px solid ${themeColor}cc`
                        : `1px solid ${themeColor}33`,
                    background: profile.avatar === emoji ? `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)` : "rgba(40,10,70,.5)",
                    color: "white",
                    fontSize: 24,
                    cursor: "pointer",
                    boxShadow: profile.avatar === emoji ? `0 0 16px ${themeColor}66` : "none",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${themeColor}4d`,
                background: `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                backdropFilter: "blur(8px)",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: themeColor, fontWeight: 600 }}>
                画像を選択
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleAvatarFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {avatarFileName ? avatarFileName : "ファイル未選択"}
              </div>
              {profile.avatar && !avatarEmojis.includes(profile.avatar) && (
                <span
                  style={{
                    marginLeft: "auto",
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,.35)",
                    border: "1px solid rgba(255,255,255,.15)",
                    fontSize: 12,
                  }}
                >
                  カスタム画像を使用中
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ユーザー名 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, opacity: 0.8, fontSize: 14, color: themeColor, fontWeight: 600 }}>
            ユーザー名
          </label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) =>
              setProfile((p) => ({ ...p, username: e.target.value }))
            }
            placeholder="ユーザー名を入力"
            maxLength={30}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${themeColor}4d`,
              background: backgroundColor === "light"
                ? `linear-gradient(135deg, #ffffff, ${themeColor}12)`
                : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              backdropFilter: "blur(8px)",
              color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
              outline: "none",
              fontSize: 14,
              boxSizing: "border-box",
              boxShadow: `inset 0 2px 8px rgba(0,0,0,.2)`,
            }}
          />
          <div
            style={{
              fontSize: 12,
              marginTop: 4,
              opacity: 0.5,
            }}
          >
            {profile.username.length}/30
          </div>
        </div>

        {/* 自己紹介 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, opacity: 0.8, fontSize: 14, color: themeColor, fontWeight: 600 }}>
            自己紹介
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) =>
              setProfile((p) => ({ ...p, bio: e.target.value }))
            }
            placeholder="自己紹介を入力（150文字以内）"
            maxLength={150}
            rows={4}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${themeColor}4d`,
              background: backgroundColor === "light"
                ? `linear-gradient(135deg, #ffffff, ${themeColor}12)`
                : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              backdropFilter: "blur(8px)",
              color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
              outline: "none",
              fontSize: 14,
              resize: "none",
              boxSizing: "border-box",
              boxShadow: `inset 0 2px 8px rgba(0,0,0,.2)`,
            }}
          />
          <div
            style={{
              fontSize: 12,
              marginTop: 4,
              opacity: 0.5,
            }}
          >
            {profile.bio.length}/150
          </div>
        </div>

        {/* ページ企画設定 & AIチャット提案 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ marginBottom: 12, opacity: 0.9, fontSize: 14, color: themeColor, fontWeight: 700 }}>
            ページ企画設定 & AIアイデア
          </div>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.75 }}>どんなページにしたい？</label>
              <input
                value={pageGoal}
                onChange={(e) => setPageGoal(e.target.value)}
                placeholder="例: 初見さん向けの自己紹介とおすすめ動画をまとめたい"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.75 }}>ターゲット/読者</label>
              <input
                value={pageAudience}
                onChange={(e) => setPageAudience(e.target.value)}
                placeholder="例: 勉強系ショートが好きな20代、海外旅行好き"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.75 }}>雰囲気/トーン</label>
              <input
                value={pageTone}
                onChange={(e) => setPageTone(e.target.value)}
                placeholder="例: 親しみやすく、ワクワク、ポジティブ"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`
                }}
              />
            </div>
          </div>

          <button
            onClick={handleGenerateIdeas}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${themeColor}80`,
              background: `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 10px 24px ${themeColor}33`,
              marginBottom: 12,
            }}
          >
            AIに提案してもらう
          </button>

          <div
            style={{
              borderRadius: 12,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}40`,
              background: backgroundColor === "light"
                ? `linear-gradient(135deg, ${themeColor}04, ${themeColor}08)`
                : `linear-gradient(135deg, ${themeColor}18, ${themeColor}0d)`,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {ideaMessages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: m.role === "user"
                    ? backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}10, ${themeColor}05)`
                    : backgroundColor === "light" ? `${themeColor}12` : `linear-gradient(135deg, ${themeColor}22, ${themeColor}12)`,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}30`,
                  color: backgroundColor === "light" ? "#333" : "white",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  fontSize: 12,
                  boxShadow: backgroundColor === "light" ? "0 2px 8px rgba(0,0,0,.06)" : `0 4px 14px ${themeColor}1f`,
                }}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>

        {/* プロフィールプレビュー */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 12, opacity: 0.8, fontSize: 14, color: themeColor, fontWeight: 600 }}>
            プロフィールプレビュー
          </div>
          <div
            style={{
              padding: 16,
              background: `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              borderRadius: 12,
              border: `1px solid ${themeColor}40`,
              boxShadow: `0 2px 12px rgba(0,0,0,.3), inset 0 1px 0 ${themeColor}1a`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 8, color: themeColor, display: "flex", justifyContent: "center", alignItems: "center", height: 64 }}>
              {profile.avatar && !avatarEmojis.includes(profile.avatar) ? (
                <img
                  src={profile.avatar}
                  alt="アバター画像"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: `2px solid ${themeColor}`,
                    background: "#fff",
                  }}
                />
              ) : (
                profile.avatar
              )}
            </div>
            <div style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4, color: "rgba(255,240,255,.95)" }}>
              {profile.username || "（未設定）"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, whiteSpace: "pre-wrap", color: "rgba(255,200,255,.8)" }}>
              {profile.bio || "（自己紹介がありません）"}
            </div>
          </div>
        </div>

        {/* 自分の投稿 */}
        <div>
          <div style={{ marginBottom: 12, opacity: 0.8, fontSize: 14, color: themeColor, fontWeight: 600 }}>
            自分の投稿 ({videos.length})
          </div>
          {videos.length === 0 ? (
            <div style={{ opacity: 0.7, fontSize: 14 }}>
              まだ投稿がありません
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {videos.map((v) => (
                <div
                  key={v.id}
                  style={{
                    position: "relative",
                    paddingBottom: "100%",
                    overflow: "hidden",
                    borderRadius: 8,
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
