"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadVideo } from "@/lib/storage";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useSupabase, setUseSupabase] = useState(false);
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");

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

  const upload = async () => {
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }

    setLoading(true);
    setError("");

    // テスト用：ダミー user.id を使用
    const userId = "test-user-" + Date.now();
    
    try {
      let videoUrl = "";

      // Supabase を試す
      if (useSupabase && file) {
        try {
          const result = await uploadVideo(file, userId);
          videoUrl = result.publicUrl;
        } catch (sbErr) {
          console.log("Supabase upload failed, using fallback");
          setError("Supabase が利用不可です。テストダミービデオを使用します。");
          videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4";
        }
      } else if (file) {
        // ローカルファイルをその場で再生（セッション内のみ有効）
        videoUrl = URL.createObjectURL(file);
      } else {
        // フォールバック：テスト用ダミービデオURL
        videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4";
      }

      // ローカルストレージにモックデータを保存
      const mockVideos = localStorage.getItem("mockVideos");
      const videos = mockVideos ? JSON.parse(mockVideos) : [];
      
      // ハッシュタグを配列に変換（# で始まる単語を抽出）
      const hashtagArray = hashtags
        .split(/\s+/)
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.toLowerCase());

      // AIスコアを自動生成（60-99の範囲）
      const aiScore = Math.floor(Math.random() * 40) + 60;

      const newVideo = {
        id: "video-" + Date.now(),
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl,
        hashtags: hashtagArray,
        aiScore: aiScore,
        created_at: new Date().toISOString(),
      };
      
      videos.unshift(newVideo);
      localStorage.setItem("mockVideos", JSON.stringify(videos));

      setTimeout(() => {
        setLoading(false);
        router.push("/tabs/feed");
      }, 500);
    } catch (err) {
      setLoading(false);
      setError("エラーが発生しました: " + (err as Error).message);
    }
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
            fontSize: 24,
          }}
        >
          ×
        </button>
        <div style={{ fontWeight: "bold", color: themeColor, textShadow: `0 0 16px ${themeColor}66` }}>新しい投稿</div>
        <div style={{ width: 24 }} />
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            onClick={() => router.push("/upload/editor")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${themeColor}66`,
              background: `linear-gradient(135deg, ${themeColor}33, ${themeColor}1f)`,
              color: backgroundColor === "light" ? themeColor : "white",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${themeColor}26`,
            }}
          >
            編集して投稿したい →
          </button>
        </div>

        {/* タイトル入力 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, opacity: 0.8, color: themeColor, fontWeight: 600 }}>
            タイトル
          </label>
          <input
            type="text"
            placeholder="何について投稿しますか？"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            maxLength={100}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}4d`,
              background: backgroundColor === "light"
                ? "#ffffff"
                : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              backdropFilter: "blur(8px)",
              color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
              outline: "none",
              fontSize: 14,
              boxSizing: "border-box",
              boxShadow: backgroundColor === "light" ? "inset 0 1px 3px rgba(0,0,0,.1)" : `inset 0 2px 8px rgba(0,0,0,.2)`,
            }}
          />
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.5 }}>
            {title.length}/100
          </div>
        </div>

        {/* 説明文入力 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, opacity: 0.8, color: themeColor, fontWeight: 600 }}>
            説明文
          </label>
          <textarea
            placeholder="動画の説明を入力（200文字まで）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}4d`,
              background: backgroundColor === "light"
                ? "#ffffff"
                : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              backdropFilter: "blur(8px)",
              color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
              outline: "none",
              fontSize: 14,
              boxSizing: "border-box",
              resize: "vertical",
              minHeight: 72,
              boxShadow: backgroundColor === "light" ? "inset 0 1px 3px rgba(0,0,0,.1)" : `inset 0 2px 8px rgba(0,0,0,.2)`,
            }}
          />
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.5 }}>
            {description.length}/200
          </div>
        </div>

        {/* ハッシュタグ入力 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, opacity: 0.8, color: themeColor, fontWeight: 600 }}>
            ハッシュタグ
          </label>
          <input
            type="text"
            placeholder="#旅行 #グルメ #犬 など"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            maxLength={100}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}4d`,
              background: backgroundColor === "light"
                ? "#ffffff"
                : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              backdropFilter: "blur(8px)",
              color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
              outline: "none",
              fontSize: 14,
              boxSizing: "border-box",
              boxShadow: backgroundColor === "light" ? "inset 0 1px 3px rgba(0,0,0,.1)" : `inset 0 2px 8px rgba(0,0,0,.2)`,
            }}
          />
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.5 }}>
            # で始まる単語をスペースで区切って入力
          </div>
        </div>

        {/* ファイル選択 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, opacity: 0.8, color: themeColor, fontWeight: 600 }}>
            ビデオファイル（オプション）
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError("");
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}4d`,
              background: backgroundColor === "light"
                ? "#ffffff"
                : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              backdropFilter: "blur(8px)",
              color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
              fontSize: 14,
              boxSizing: "border-box",
              boxShadow: backgroundColor === "light" ? "inset 0 1px 3px rgba(0,0,0,.1)" : `inset 0 2px 8px rgba(0,0,0,.2)`,
            }}
          />
          {file && (
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7, color: backgroundColor === "light" ? "#555" : "rgba(255,200,255,.8)" }}>
              ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        {/* アップロード方法選択 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
            <input
              type="checkbox"
              checked={useSupabase}
              onChange={(e) => setUseSupabase(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <span>Supabase Storage を使用する（ネットワーク接続必須）</span>
          </label>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div
            style={{
              padding: 12,
              background: backgroundColor === "light" ? "rgba(255,100,150,.08)" : "rgba(255,100,150,.15)",
              border: `1px solid ${backgroundColor === "light" ? "rgba(255,100,150,.2)" : "rgba(255,100,150,.4)"}`,
              borderRadius: 8,
              color: backgroundColor === "light" ? "rgba(200,0,50,.9)" : "rgba(255,150,200,.9)",
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* 説明 */}
        <div
          style={{
            padding: 16,
            background: backgroundColor === "light"
              ? `linear-gradient(135deg, ${themeColor}08, ${themeColor}04)`
              : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
            borderRadius: 8,
            border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}40`,
            fontSize: 13,
            opacity: 0.9,
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: 8, color: themeColor, fontWeight: 600 }}>
            アップロード設定
          </div>
          <div style={{ color: backgroundColor === "light" ? "#555" : "rgba(255,240,255,.8)" }}>
            • Supabase が利用可能な場合はサーバーにアップロード
          </div>
          <div style={{ color: backgroundColor === "light" ? "#555" : "rgba(255,240,255,.8)" }}>
            • Supabase 未使用時は選択したローカル動画をその場で再生（セッション内のみ）
          </div>
          <div style={{ color: backgroundColor === "light" ? "#555" : "rgba(255,240,255,.8)" }}>
            • 何も選択しない場合はテストダミービデオを使用
          </div>
          <div style={{ marginTop: 8, opacity: 0.7, color: "rgba(255,200,255,.6)" }}>
            ファイルを選択しない場合は、テストダミービデオが使用されます。
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div style={{ padding: 16, borderTop: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}40`, background: backgroundColor === "light" ? "#ffffff" : "rgba(20,0,40,.5)" }}>
        <button
          onClick={upload}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: loading ? `1px solid ${themeColor}4d` : `1px solid ${themeColor}80`,
            background: loading ? `linear-gradient(135deg, ${themeColor}4d, ${themeColor}33)` : `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
            color: loading ? `${themeColor}80` : "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16,
            fontWeight: "bold",
            boxShadow: loading ? "none" : `0 0 24px ${themeColor}66, inset 0 1px 0 ${themeColor}40`,
          }}
        >
          {loading ? "投稿中..." : "投稿する"}
        </button>
      </div>
    </div>
  );
}