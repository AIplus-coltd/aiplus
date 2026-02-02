"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadThumbnail } from "@/lib/firebase/storage";

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  hashtags?: string[];
  aiScore?: number;
  trimStart?: number;
  trimEnd?: number;
  muted?: boolean;
  coverTime?: number;
};

const SESSION_KEY = "editorSession";
const DRAFT_KEY = "draftVideos";
const USER_ID_KEY = "userId";
const CUT_CONFIG_KEY = "editorCutConfig";
const FALLBACK_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerFun.mp4";

export default function MetaPage() {
  const router = useRouter();
  const [themeColor, setThemeColor] = useState<string>("#2b7ba8");
  const [backgroundColor, setBackgroundColor] = useState<"light">("light");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string>("");

  // SESSION_KEYを読み込む関数
  const loadSession = () => {
    const saved = localStorage.getItem(SESSION_KEY);
    console.log("loadSession: reading from localStorage", {
      hasSavedData: !!saved
    });
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // videoUrlはcamera、CUT、またはsession から優先順位で取得
        const cutConfig = localStorage.getItem(CUT_CONFIG_KEY);
        const cutVideoUrl = cutConfig ? JSON.parse(cutConfig).videoUrl : null;
        const effectiveVideoUrl = parsed.videoUrl || cutVideoUrl;
        
        console.log("loadSession: parsed session", {
          hasThumbnail: !!parsed.thumbnailDataUrl,
          hasVideoUrl: !!effectiveVideoUrl,
          thumbnailLength: parsed.thumbnailDataUrl?.length || 0
        });
        
        // sessionにvideoUrlを追加
        const fullSession = {
          ...parsed,
          videoUrl: effectiveVideoUrl
        };
        setSession(fullSession);
        
        // thumbnailDataUrl が存在する場合は使用、なければ videoUrl を使用
        const thumbnailToUse = parsed.thumbnailDataUrl || effectiveVideoUrl;
        if (thumbnailToUse) {
          console.log("loadSession: setting thumbnailUrl");
          setThumbnailUrl(thumbnailToUse);
        }
      } catch (e) {
        console.error("loadSession: parse failed", e);
      }
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    const color = settings.themeColor || "blue";
    const bgColor = settings.backgroundColor || "light";
    const themeMap: Record<string, string> = {
      pink: "#2b7ba8",
      blue: "#2b7ba8",
      green: "#2b7ba8",
      purple: "#2b7ba8",
    };
    setThemeColor(themeMap[color] || "#2b7ba8");
    setBackgroundColor(bgColor);

    // ユーザーID初期化（ログインユーザー優先）
    let uid: string | null = null;
    const currentUserRaw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    if (currentUserRaw) {
      try {
        const parsed = JSON.parse(currentUserRaw);
        uid = parsed?.id || parsed?.user_id || null;
      } catch {}
    }

    if (!uid) {
      uid = localStorage.getItem("me");
    }

    if (!uid) {
      uid = "demo-user";
      localStorage.setItem("me", uid);
    }

    localStorage.setItem(USER_ID_KEY, uid);
    setUserId(uid);

    // 初回マウント時にセチE��ョン読み込み
    loadSession();

    // storageイベントをリスンして、他�Eタブやウィンドウからの変更を検知
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        console.log("storage event detected for SESSION_KEY");
        loadSession();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const hashtagArray = useMemo(() => {
    return hashtags
      .split(/\s+/)
      .filter((t) => t.startsWith("#"))
      .map((t) => t.toLowerCase());
  }, [hashtags]);

  const savePost = async () => {
    // 投稿前にsessionを最新の状態に再読み込み
    loadSession();
    
    // sessionを�E取征E+ カチE��設定�Eフォールバック
    const latestSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    const cutConfig = JSON.parse(localStorage.getItem(CUT_CONFIG_KEY) || "{}");
    const effectiveVideoUrl = latestSession.videoUrl || cutConfig.videoUrl;
    
    if (!title.trim()) {
      setError("タイトルを�E力してください");
      return;
    }
    if (!latestSession || !effectiveVideoUrl) {
      setError("動画がありません。編集ページに戻ってください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // blob URL の場合�E処琁E��スキチE�E�E�Elob をアチE�EロードできなぁE��めE��E
      const isLocalBlob = effectiveVideoUrl?.startsWith("blob:");

      let videoUrl = effectiveVideoUrl;
      let thumbnailUrl_final = thumbnailUrl;

      // Firebase にアチE�Eロード！Elob URL でなぁE��合！E
      if (!isLocalBlob && latestSession.videoUrl) {
        try {
          // ローカルファイルの場合�E File オブジェクトが忁E��E
          // 現在は Data URL でしか保存されてぁE��ぁE�Eでここは保留
          console.log("Note: Video upload requires File object support");
        } catch (uploadErr) {
          console.warn("Firebase upload skipped:", uploadErr);
        }
      }

      // サムネイルアチE�Eロード�EスキチE�E�E�ローカルのData URLをそのまま使用�E�E
      if (thumbnailUrl && thumbnailUrl.startsWith("data:")) {
        thumbnailUrl_final = thumbnailUrl;
      }

      // ローカルストレージに保存！Eirebase + LocalStorage�E�E
      const mockVideos = localStorage.getItem("mockVideos");
      const videos: VideoRow[] = mockVideos ? JSON.parse(mockVideos) : [];
      const aiScore = Math.floor(Math.random() * 40) + 60;
      const now = new Date().toISOString();
      
      const newVideo: VideoRow = {
        id: "video-" + Date.now(),
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl_final,
        created_at: now,
        hashtags: hashtagArray,
        aiScore,
        trimStart: Math.max(0, latestSession.trimStart || 0),
        trimEnd: latestSession.trimEnd || undefined,
        muted: latestSession.muted,
        coverTime: latestSession.coverTime,
      };

      videos.unshift(newVideo);
      localStorage.setItem("mockVideos", JSON.stringify(videos));

      // ユーザーの投稿として保存
      if (userId) {
        const userVideos = localStorage.getItem(`videos_${userId}`);
        const userVideoList: VideoRow[] = userVideos ? JSON.parse(userVideos) : [];
        userVideoList.unshift(newVideo);
        localStorage.setItem(`videos_${userId}`, JSON.stringify(userVideoList));
      }

      // SessionStorage をクリア
      localStorage.removeItem(SESSION_KEY);

      setLoading(false);
      router.push("/tabs/me/view");
    } catch (err) {
      setLoading(false);
      setError("エラーが発生しました: " + (err as Error).message);
    }
  };

  const saveDraft = async () => {
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (!session || !session.videoUrl) {
      setError("動画がありません。編集ページに戻ってください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const drafts = localStorage.getItem(DRAFT_KEY);
      const draftList = drafts ? JSON.parse(drafts) : [];
      
      const draftData = {
        id: "draft-" + Date.now(),
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        video_url: session.videoUrl,
        thumbnail_url: thumbnailUrl,
        created_at: new Date().toISOString(),
        hashtags: hashtagArray,
        session: session,
      };

      draftList.unshift(draftData);
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftList));

      setLoading(false);
      router.push("/upload/draft");
    } catch (err) {
      setLoading(false);
      setError("ドラフト保存に失敗しました: " + (err as Error).message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#ffffff",
        color: "#333",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${themeColor}26`,
          background: "linear-gradient(180deg, rgba(245,245,245,.95) 0%, rgba(240,240,240,.93) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button onClick={() => {
          const referrer = localStorage.getItem("metaPageReferrer") || "/upload/editor";
          localStorage.removeItem("metaPageReferrer");
          router.push(referrer);
        }} style={{ background: "transparent", border: "none", color: themeColor, fontSize: 18, cursor: "pointer" }}>←</button>
        <div style={{ fontWeight: 700, color: themeColor }}>投稿情報</div>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ flex: 1, padding: 16, display: "grid", gap: 16, gridTemplateColumns: "1fr" }}>
        <div style={{ padding: 14, borderRadius: 12, border: `1px solid ${themeColor}33`, background: "#fafafa", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontWeight: 700, color: themeColor }}>サムネイル</label>
            <button
              onClick={() => {
                // SESSION_KEYを確実に保存してから移勁E
                if (session) {
                  try {
                    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
                  } catch {}
                }
                router.push("/upload/thumb");
              }}
              style={{ marginLeft: "auto", padding: "8px 12px", borderRadius: 10, border: `1px solid ${themeColor}80`, background: `linear-gradient(135deg, ${themeColor}bf, ${themeColor}9f)`, color: "white", fontWeight: 700, fontSize: 12 }}
            >
              サムネ編集へ
            </button>
          </div>
          <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${themeColor}26`, background: "rgba(0,0,0,0.35)", minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="thumbnail" style={{ width: "100%", maxHeight: 260, objectFit: "cover" }} />
            ) : (
              <div style={{ padding: 16, opacity: 0.7 }}>サムネイル未設定</div>
            )}
          </div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fafafa" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)` }}>
          <label style={{ display: "block", marginBottom: 6, opacity: 0.85, color: themeColor, fontWeight: 700 }}>タイトル</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="例: 1分でわかる旅の持ち物"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${themeColor}40`, background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`, color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)" }}
          />
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>{title.length}/120</div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fafafa" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)` }}>
          <label style={{ display: "block", marginBottom: 6, opacity: 0.85, color: themeColor, fontWeight: 700 }}>説明文</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={250}
            rows={3}
            placeholder="動画の内容、CTA、クレジットなどを記入"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${themeColor}40`, background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`, color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)" }}
          />
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>{description.length}/250</div>
        </div>

        <div style={{ padding: 14, borderRadius: 12, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fafafa" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)` }}>
          <label style={{ display: "block", marginBottom: 6, opacity: 0.85, color: themeColor, fontWeight: 700 }}>ハッシュタグ</label>
          <input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            maxLength={120}
            placeholder="#旅 #グルメ #howto"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${themeColor}40`, background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`, color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)" }}
          />
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}># で始まる単語をスペース区切りで入力</div>
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,100,150,.25)",
              background: "rgba(255,120,180,.08)",
              color: "rgba(200,0,60,.9)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </div>

      <div style={{ padding: 16, borderTop: "1px solid rgba(0,0,0,.1)", background: "#ffffff", display: "grid", gap: 10 }}>
        <button
          onClick={savePost}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 10,
            border: loading ? `1px solid ${themeColor}4d` : `1px solid ${themeColor}80`,
            background: loading ? `linear-gradient(135deg, ${themeColor}4d, ${themeColor}33)` : `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
            color: loading ? `${themeColor}90` : "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: loading ? "none" : `0 0 24px ${themeColor}66, inset 0 1px 0 ${themeColor}40`,
          }}
        >
          {loading ? "投稿中..." : "投稿する"}
        </button>
        <button
          onClick={saveDraft}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 10,
            border: `1px solid ${themeColor}40`,
            background: `rgba(255,192,203,.15)`,
            color: themeColor,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {loading ? "保存中..." : "下書き保存"}
        </button>
        <button
          onClick={() => router.back()}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${themeColor}40`,
            background: "transparent",
            color: themeColor,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          戻る
        </button>
      </div>
    </div>
  );
}

