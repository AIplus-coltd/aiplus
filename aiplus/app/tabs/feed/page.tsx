"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  description?: string;
  video_url: string;
  created_at: string;
  aiScore?: number;
  musicId?: string;
};

type CommentRow = {
  id: string;
  video_id: string;
  user_id: string | null;
  text: string;
  created_at: string;
};

export default function FeedPage() {
  const router = useRouter();

  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommended" | "trending">("recommended");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileAvatar, setProfileAvatar] = useState<string>("👤");
  const [userProfile, setUserProfile] = useState<{ username: string; bio: string; avatar: string }>({
    username: "ユーザー",
    bio: "プロフィール",
    avatar: "👤",
  });
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");

  const [me, setMe] = useState<string | null>(null);

  const [likeCount, setLikeCount] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [descExpanded, setDescExpanded] = useState<Record<string, boolean>>({});

  const [commentCount, setCommentCount] = useState<Record<string, number>>({});
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState("");

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchLastY = useRef<number | null>(null);
  const lastWheelAt = useRef<number>(0);

  const formatTimeHM = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    } catch {
      return "";
    }
  };

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

      // プロフィールのアバター取得
      try {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed?.avatar) setProfileAvatar(parsed.avatar);
          setUserProfile(parsed);
        }
      } catch {}
    };

    loadSettings();

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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
    touchLastY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchLastY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const start = touchStartY.current;
    const last = touchLastY.current;
    if (start == null || last == null) return;
    const delta = last - start; // 上にスライドで負方向
    const threshold = 50;
    if (delta < -threshold) {
      setCurrentIndex((i) => (sortedVideos.length ? (i + 1) % sortedVideos.length : 0));
    } else if (delta > threshold) {
      setCurrentIndex((i) => (sortedVideos.length ? (i - 1 + sortedVideos.length) % sortedVideos.length : 0));
    }
    touchStartY.current = null;
    touchLastY.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastWheelAt.current < 250) return; // throttle
    lastWheelAt.current = now;

    const threshold = 10; // wheelは小さい値で連発するため低めに
    if (e.deltaY > threshold) {
      setCurrentIndex((i) => (videos.length ? (i + 1) % videos.length : 0));
    } else if (e.deltaY < -threshold) {
      setCurrentIndex((i) => (videos.length ? (i - 1 + videos.length) % videos.length : 0));
    }
  };

  useEffect(() => {
    const sorted = activeTab === "trending"
      ? [...videos].sort((a, b) => {
          const scoreA = (likeCount[a.id] || 0) + (commentCount[a.id] || 0) * 2;
          const scoreB = (likeCount[b.id] || 0) + (commentCount[b.id] || 0) * 2;
          return scoreB - scoreA;
        })
      : videos;

    const current = sorted[currentIndex];
    if (!current) return;
    const el = videoRefs.current[current.id];
    if (el) {
      Object.values(videoRefs.current).forEach((v) => {
        try { v?.pause(); } catch {}
      });
      el.play().catch(() => {});
    }
  }, [currentIndex, activeTab, videos.length]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // テスト用：認証をスキップ
      setMe(null);

      // ローカルストレージからモックデータを取得
      const mockVideos = localStorage.getItem("mockVideos");
      const mockData = mockVideos ? JSON.parse(mockVideos) : getDefaultMockVideos();
      
      const list = mockData as VideoRow[];
      if (cancelled) return;

      setVideos(list);
      setReady(true);

      await refreshAllMeta(list, "");
      if (cancelled) return;

      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target as HTMLVideoElement;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
              el.play().catch(() => {});
            } else {
              el.pause();
            }
          });
        },
        { threshold: [0, 0.6, 1] }
      );

      requestAnimationFrame(() => {
        Object.values(videoRefs.current).forEach((v) => {
          if (v && observerRef.current) observerRef.current.observe(v);
        });
      });
    };

    run();

    return () => {
      cancelled = true;
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [router]);

  // videos が更新されたときにメタデータをリフレッシュ
  useEffect(() => {
    if (videos.length > 0) {
      refreshAllMeta(videos, me || "");
    }
  }, [videos.length]);

  const refreshAllMeta = async (list: VideoRow[], uid: string) => {
    // localStorage から取得
    const likesData = localStorage.getItem("videoLikes");
    const likes = likesData ? JSON.parse(likesData) : {};
    const likedSet = localStorage.getItem("userLikes");
    const likedVideos = likedSet ? JSON.parse(likedSet) : [];

    const likeCountMap: Record<string, number> = {};
    const likedMap: Record<string, boolean> = {};
    const savedData = localStorage.getItem("savedVideos");
    const savedList: string[] = savedData ? JSON.parse(savedData) : [];
    const savedMap: Record<string, boolean> = {};

    list.forEach((v) => {
      likeCountMap[v.id] = likes[v.id] || 0;
      likedMap[v.id] = likedVideos.includes(v.id) || false;
      savedMap[v.id] = savedList.includes(v.id);
    });

    // コメント数も取得
    const commentsData = localStorage.getItem("videoComments");
    const comments = commentsData ? JSON.parse(commentsData) : {};
    
    const commentCountMap: Record<string, number> = {};
    list.forEach((v) => {
      commentCountMap[v.id] = (comments[v.id] || []).length;
    });

    // state を更新（UI表示）
    setLikeCount(likeCountMap);
    setLiked(likedMap);
    setCommentCount(commentCountMap);
    setSaved(savedMap);
  };

  const toggleSave = (videoId: string) => {
    const savedData = localStorage.getItem("savedVideos");
    const savedList: string[] = savedData ? JSON.parse(savedData) : [];
    const isSaved = savedList.includes(videoId);

    const nextList = isSaved
      ? savedList.filter((id) => id !== videoId)
      : [...savedList, videoId];

    localStorage.setItem("savedVideos", JSON.stringify(nextList));
    setSaved((p) => ({ ...p, [videoId]: !isSaved }));
  };

  const toggleLike = (videoId: string) => {
    // テスト用：ローカルストレージにいいね情報を保存
    const likesData = localStorage.getItem("videoLikes");
    const likes = likesData ? JSON.parse(likesData) : {};
    
    const likedSet = localStorage.getItem("userLikes");
    const likedVideos = likedSet ? JSON.parse(likedSet) : [];

    const isLiked = likedVideos.includes(videoId);

    if (isLiked) {
      // いいね削除
      const newLiked = likedVideos.filter((id: string) => id !== videoId);
      localStorage.setItem("userLikes", JSON.stringify(newLiked));
      
      likes[videoId] = Math.max(0, (likes[videoId] || 0) - 1);
    } else {
      // いいね追加
      likedVideos.push(videoId);
      localStorage.setItem("userLikes", JSON.stringify(likedVideos));
      
      likes[videoId] = (likes[videoId] || 0) + 1;
    }

    localStorage.setItem("videoLikes", JSON.stringify(likes));

    // UI を更新
    setLiked((p) => ({ ...p, [videoId]: !isLiked }));
    setLikeCount((p) => ({
      ...p,
      [videoId]: likes[videoId],
    }));
  };

  const openComments = (videoId: string) => {
    setOpenCommentsFor(videoId);
    setCommentText("");

    // テスト用：ローカルストレージからコメントを取得
    const commentsData = localStorage.getItem("videoComments");
    const allComments = commentsData ? JSON.parse(commentsData) : {};
    const videoComments = (allComments[videoId] || []) as CommentRow[];
    
    // 新しい順でソート
    setComments(videoComments.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  };

  const submitComment = () => {
    if (!openCommentsFor) return;
    const text = commentText.trim();
    if (!text) return;

    // テスト用：ローカルストレージにコメントを保存
    const commentsData = localStorage.getItem("videoComments");
    const allComments = commentsData ? JSON.parse(commentsData) : {};
    
    if (!allComments[openCommentsFor]) {
      allComments[openCommentsFor] = [];
    }

    const newComment: CommentRow = {
      id: "c-" + Date.now() + Math.random().toString(36),
      video_id: openCommentsFor,
      user_id: me || "anon",
      text,
      created_at: new Date().toISOString(),
    };

    allComments[openCommentsFor].push(newComment);
    localStorage.setItem("videoComments", JSON.stringify(allComments));

    setCommentText("");
    openComments(openCommentsFor);
    setCommentCount((p) => ({
      ...p,
      [openCommentsFor]: (p[openCommentsFor] ?? 0) + 1,
    }));
  };

  // タブに応じてソート
  const sortedVideos = activeTab === "trending" 
    ? [...videos].sort((a, b) => {
        const scoreA = (likeCount[a.id] || 0) + (commentCount[a.id] || 0) * 2;
        const scoreB = (likeCount[b.id] || 0) + (commentCount[b.id] || 0) * 2;
        return scoreB - scoreA;
      })
    : videos;

  if (!ready) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <>
      {/* ヘッダーUI */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 250,
          background: backgroundColor === "light"
            ? `linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(245,245,245,.96) 100%)`
            : `linear-gradient(180deg, rgba(26,10,40,.98) 0%, ${themeColor}12)`,
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}26`,
          boxShadow: `0 2px 16px ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}33`,
        }}
      >
        {/* トップバー */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 14px 4px",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: "700", color: themeColor, letterSpacing: "0.02em" }}>
            Feed
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => router.push("/tabs/search")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>
            <button
              onClick={() => router.push("/settings")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m6.08 0l4.24-4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m6.08 0l4.24 4.24" />
              </svg>
            </button>
          </div>
        </div>

        {/* タブ切り替え */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            padding: "0 14px 8px",
          }}
        >
          <button
            onClick={() => setActiveTab("recommended")}
            style={{
              padding: "4px 16px",
              borderRadius: 18,
              border: "none",
              background: activeTab === "recommended" 
                ? `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)` 
                : "transparent",
              color: activeTab === "recommended" ? themeColor : `${themeColor}b3`,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: activeTab === "recommended" ? "700" : "500",
              boxShadow: activeTab === "recommended" 
                ? `0 0 14px ${themeColor}4d` 
                : "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            style={{
              padding: "4px 16px",
              borderRadius: 18,
              border: "none",
              background: activeTab === "trending" 
                ? `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)` 
                : "transparent",
              color: activeTab === "trending" ? themeColor : `${themeColor}b3`,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: activeTab === "trending" ? "700" : "500",
              boxShadow: activeTab === "trending" 
                ? `0 0 14px ${themeColor}4d` 
                : "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Discover
          </button>
        </div>
      </div>



      <div
        style={{
          height: "100vh",
          overflowY: "hidden",
          background: backgroundColor === "light" ? "#f8f8f8" : "black",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {sortedVideos.map((v, idx) => (
          <div
            key={v.id}
            style={{
              height: "100vh",
              position: "relative",
              display: idx === currentIndex ? "block" : "none",
              background: backgroundColor === "light" ? "#f8f8f8" : "transparent",
            }}
          >
            <video
              ref={(el) => {
                videoRefs.current[v.id] = el;
                if (el && observerRef.current) observerRef.current.observe(el);
              }}
              src={v.video_url}
              autoPlay
              muted
              loop
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* 左側メタ情報：ユーザー、タイトル、説明 */}
            <div
              style={{
                position: "absolute",
                left: 14,
                right: 100,
                bottom: 80,
                color: backgroundColor === "light" ? "#333" : "white",
                textShadow: backgroundColor === "light" ? "none" : "0 2px 10px rgba(0,0,0,.6)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                zIndex: 150,
              }}
            >
              {v.user_id && (
                <div
                  onClick={() => router.push(`/u/${v.user_id}`)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 14,
                    background: "transparent",
                    backdropFilter: "blur(12px) saturate(150%)",
                    border: "none",
                    boxShadow: "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: backgroundColor === "light"
                        ? "linear-gradient(135deg, rgba(200,200,200,.5), rgba(220,220,220,.4))"
                        : "linear-gradient(135deg, rgba(150,50,255,.35), rgba(180,100,255,.25))",
                      border: backgroundColor === "light"
                        ? "1px solid rgba(100,100,100,.3)"
                        : "1px solid rgba(200,120,255,.4)",
                      boxShadow: backgroundColor === "light"
                        ? "0 0 16px rgba(100,100,100,.15), inset 0 1px 0 rgba(255,255,255,.3)"
                        : "0 0 16px rgba(200,100,255,.35), inset 0 1px 0 rgba(255,200,255,.2)",
                      fontSize: 14,
                    }}
                  >
                    {profileAvatar}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: backgroundColor === "light" ? "#333" : "white" }}>@{v.user_id.slice(0, 6)}</span>
                    <span style={{ fontSize: 10, opacity: 0.85, color: backgroundColor === "light" ? "#666" : "inherit" }}>{formatTimeHM(v.created_at)}</span>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.35, color: backgroundColor === "light" ? "#333" : "white" }}>
                {v.title}
              </div>

              {v.description && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDescExpanded((p) => ({ ...p, [v.id]: !p[v.id] }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDescExpanded((p) => ({ ...p, [v.id]: !p[v.id] }));
                    }
                  }}
                  style={{
                    position: "relative",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: backgroundColor === "light" ? "rgba(200,200,200,.2)" : "transparent",
                    backdropFilter: "blur(10px) saturate(140%)",
                    boxShadow: "none",
                    fontSize: 12,
                    lineHeight: 1.45,
                    color: backgroundColor === "light" ? "#333" : "inherit",
                    opacity: 0.95,
                    cursor: "pointer",
                    overflow: "hidden",
                    maxHeight: descExpanded[v.id] ? 200 : 68,
                    transition: "all 0.3s ease",
                  }}
                >
                  {v.description}
                  {!descExpanded[v.id] && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 34,
                        background: backgroundColor === "light"
                          ? "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%)"
                          : "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      right: 10,
                      bottom: 0,
                      padding: "2px 4px",
                      borderRadius: 0,
                      border: "none",
                      background: "transparent",
                      boxShadow: "none",
                      fontSize: 9,
                      fontWeight: 600,
                      pointerEvents: "none",
                      color: backgroundColor === "light" ? "rgba(100,100,100,.8)" : "rgba(255,255,255,.7)",
                    }}
                  >
                    {descExpanded[v.id] ? "閉じる" : "もっと見る"}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                position: "absolute",
                right: 12,
                bottom: 100,
                color: backgroundColor === "light" ? "#333" : "white",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
              }}
            >
              {/* AIスコア */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "8px 10px",
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${themeColor}e6, ${themeColor}cc)`,
                  border: `1.5px solid ${themeColor}b3`,
                  boxShadow: `0 0 20px ${themeColor}b3, 0 4px 12px ${themeColor}80, inset 0 1px 0 rgba(255,255,255,.25)`,
                  backdropFilter: "blur(10px)",
                  minWidth: 50,
                }}
              >
                <div style={{ 
                  fontSize: 8, 
                  fontWeight: "700", 
                  color: backgroundColor === "light" ? "#333" : "#FFFFFF", 
                  textShadow: backgroundColor === "light" ? "none" : "0 0 6px rgba(255,255,255,.5)",
                  letterSpacing: "0.08em",
                  opacity: 0.95,
                }}>
                  AI
                </div>
                <div style={{ 
                  fontSize: 20, 
                  fontWeight: "900", 
                  color: backgroundColor === "light" ? "#333" : "#FFFFFF", 
                  textShadow: backgroundColor === "light" ? "none" : "0 2px 8px rgba(255,255,255,.7), 0 0 16px rgba(199,125,255,.9)",
                  lineHeight: 1,
                }}>
                  {v.aiScore ?? 90}
                </div>
              </div>
              
              <button
                onClick={() => toggleLike(v.id)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  border: liked[v.id] ? `1px solid ${themeColor}b3` : `1px solid ${themeColor}59`,
                  background: liked[v.id] 
                    ? `linear-gradient(135deg, ${themeColor}a6, ${themeColor}8c)` 
                    : backgroundColor === "light"
                    ? "linear-gradient(135deg, rgba(220,220,220,.85), rgba(240,240,240,.8))"
                    : "linear-gradient(135deg, rgba(26,10,40,.85), rgba(20,5,35,.8))",
                  backdropFilter: "blur(10px)",
                  color: liked[v.id] ? themeColor : `${themeColor}bf`,
                  cursor: "pointer",
                  fontSize: 20,
                  fontWeight: "bold",
                  boxShadow: liked[v.id] 
                    ? `0 0 18px ${themeColor}a6, inset 0 1px 0 rgba(255,255,255,.18)` 
                    : backgroundColor === "light"
                    ? "0 4px 10px rgba(0,0,0,.1), inset 0 1px 0 rgba(100,100,100,.05)"
                    : "0 4px 10px rgba(0,0,0,.4), inset 0 1px 0 rgba(157,78,221,.08)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {liked[v.id] ? "♥" : "♡"}
              </button>
              <div style={{ fontSize: 11, fontWeight: "600", opacity: 0.95, color: themeColor, marginTop: -10 }}>
                {likeCount[v.id] ?? 0}
              </div>

              <button
                onClick={() => openComments(v.id)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  border: `1px solid ${themeColor}59`,
                  background: backgroundColor === "light"
                    ? "linear-gradient(135deg, rgba(220,220,220,.66), rgba(240,240,240,.4d))"
                    : `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)`,
                  backdropFilter: "blur(10px)",
                  color: themeColor,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: backgroundColor === "light"
                    ? "0 0 14px rgba(100,100,100,.3), inset 0 1px 0 rgba(255,255,255,.2)"
                    : `0 0 14px ${themeColor}59, inset 0 1px 0 rgba(255,255,255,.12)`,
                  transition: "all 0.3s ease",
                }}
                aria-label="コメント"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <linearGradient id="commentGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={themeColor} />
                      <stop offset="100%" stopColor={themeColor} />
                    </linearGradient>
                  </defs>
                  <g fill="none" stroke="url(#commentGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </g>
                </svg>
              </button>
              <div style={{ fontSize: 11, fontWeight: "600", opacity: 0.95, color: themeColor, marginTop: -10 }}>
                {commentCount[v.id] ?? 0}
              </div>

              <button
                onClick={() => toggleSave(v.id)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  border: saved[v.id] ? `1px solid ${themeColor}b3` : `1px solid ${themeColor}59`,
                  background: saved[v.id] 
                    ? `linear-gradient(135deg, ${themeColor}a6, ${themeColor}8c)` 
                    : backgroundColor === "light"
                    ? "linear-gradient(135deg, rgba(220,220,220,.85), rgba(240,240,240,.8))"
                    : "linear-gradient(135deg, rgba(26,10,40,.85), rgba(20,5,35,.8))",
                  backdropFilter: "blur(10px)",
                  color: saved[v.id] ? themeColor : `${themeColor}bf`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: saved[v.id] 
                    ? `0 0 18px ${themeColor}8c, inset 0 1px 0 rgba(255,255,255,.18)` 
                    : backgroundColor === "light"
                    ? "0 4px 10px rgba(0,0,0,.1), inset 0 1px 0 rgba(100,100,100,.05)"
                    : "0 4px 10px rgba(0,0,0,.4), inset 0 1px 0 rgba(157,78,221,.08)",
                  transition: "all 0.3s ease",
                }}
                aria-label="保存"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <linearGradient id="saveGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={themeColor} />
                      <stop offset="100%" stopColor={themeColor} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M6 3h12a1 1 0 0 1 1 1v16l-7-4-7 4V4a1 1 0 0 1 1-1z"
                    fill="none"
                    stroke="url(#saveGrad)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div style={{ fontSize: 10, fontWeight: "500", opacity: 0.8, color: themeColor, marginTop: -10 }}>
                {saved[v.id] ? "保存済" : ""}
              </div>

              <button
                onClick={() => router.push("/music")}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  border: `1px solid ${themeColor}59`,
                  background: backgroundColor === "light"
                    ? "linear-gradient(135deg, rgba(220,220,220,.85), rgba(240,240,240,.8))"
                    : "linear-gradient(135deg, rgba(26,10,40,.85), rgba(20,5,35,.8))",
                  backdropFilter: "blur(10px)",
                  color: themeColor,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: backgroundColor === "light"
                    ? "0 0 14px rgba(100,100,100,.3), inset 0 1px 0 rgba(255,255,255,.2)"
                    : `0 0 14px ${themeColor}59, inset 0 1px 0 rgba(255,255,255,.12)`,
                  transition: "all 0.3s ease",
                }}
                aria-label="音楽"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <linearGradient id="musicGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={themeColor} />
                      <stop offset="100%" stopColor={themeColor} />
                    </linearGradient>
                  </defs>
                  <g fill="none" stroke="url(#musicGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="2" />
                    <circle cx="18" cy="16" r="2" />
                  </g>
                </svg>
              </button>
              <div style={{ fontSize: 9, fontWeight: "500", opacity: 0.75, color: themeColor, marginTop: -10 }}>
                Music
              </div>
            </div>
          </div>
        ))}

        {sortedVideos.length === 0 && (
          <div style={{ color: "white", padding: 20 }}>
            動画がまだありません
          </div>
        )}
      </div>

      {openCommentsFor && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            height: "55vh",
            background: backgroundColor === "light" 
              ? "linear-gradient(180deg, rgba(245,245,245,.98) 0%, rgba(240,240,240,.97) 100%)"
              : "linear-gradient(180deg, rgba(20,0,40,.98) 0%, rgba(30,5,60,.97) 100%)",
            backdropFilter: "blur(20px) saturate(160%)",
            borderTop: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.15)" : "rgba(200,100,255,.25)"}`,
            boxShadow: backgroundColor === "light"
              ? "0 -8px 40px rgba(0,0,0,.1), inset 0 1px 0 rgba(0,0,0,.05)"
              : "0 -8px 40px rgba(150,50,255,.3), inset 0 1px 0 rgba(200,100,255,.15)",
            zIndex: 300,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              color: backgroundColor === "light" ? "#333" : "white",
            }}
          >
            <div>コメント</div>
            <button
              onClick={() => setOpenCommentsFor(null)}
              style={{
                background: "transparent",
                border: "none",
                color: backgroundColor === "light" ? "#333" : "white",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "0 12px 12px",
              color: backgroundColor === "light" ? "#333" : "white",
            }}
          >
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "10px 0",
                  borderBottom: `1px solid ${themeColor}1f`,
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  @{c.user_id?.slice(0, 6) ?? "anon"}
                </div>
                <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>
                  {c.text}
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div style={{ opacity: 0.8 }}>まだコメントがありません</div>
            )}
          </div>

          <div style={{ padding: 12, display: "flex", gap: 8 }}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="コメントを書く"
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${themeColor}4d`,
                background: backgroundColor === "light"
                  ? "linear-gradient(135deg, rgba(240,240,240,.8), rgba(245,245,245,.75))"
                  : "linear-gradient(135deg, rgba(20,25,40,.8), rgba(25,30,45,.75))",
                backdropFilter: "blur(8px)",
                color: backgroundColor === "light" ? "#333" : "rgba(240,245,255,.95)",
                outline: "none",
                boxShadow: `inset 0 2px 8px ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : "rgba(0,0,0,.3)"}, 0 0 0 0 ${themeColor}33`,
                transition: "all 0.3s ease",
              }}
            />
            <button
              onClick={submitComment}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${themeColor}72`,
                background: `linear-gradient(135deg, ${themeColor}80, ${themeColor}66)`,
                color: themeColor,
                cursor: "pointer",
                boxShadow: `0 0 16px ${themeColor}59, inset 0 1px 0 rgba(255,255,255,.2)`,
                transition: "all 0.3s ease",
                fontWeight: 600,
              }}
            >
              送信
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function getDefaultMockVideos(): VideoRow[] {
  return [
    {
      id: "1",
      user_id: "user-demo-1",
      title: "AI＋デモ：縦型フィード",
      description: "縦スクロール風レイアウトのサンプルです。",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/big_buck_bunny.mp4",
      created_at: new Date(Date.now() - 1000000).toISOString(),
      aiScore: 90,
      musicId: "song-1",
    },
    {
      id: "2",
      user_id: "user-demo-2",
      title: "TikTok風UI実装",
      description: "UIコンポーネントと動画再生の簡易デモ。",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/elephant-dream.mp4",
      created_at: new Date(Date.now() - 2000000).toISOString(),
      aiScore: 85,
      musicId: "song-3",
    },
  ];
}