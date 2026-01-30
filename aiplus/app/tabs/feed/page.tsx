"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
type VideoRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_url: string;
  created_at: string;
  aiScore: number;
  musicId: string;
  isSponsor?: boolean;
  sponsorLabel?: string;
  sponsorCta?: string;
  sponsorUrl?: string;
};

function FeedPage() {
  // ...existing state, refs, etc...

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
        {(() => {
          const sorted = activeTab === "trending"
            ? [...videos].sort((a, b) => {
                const scoreA = (likeCount[a.id] || 0) + (commentCount[a.id] || 0) * 2;
                const scoreB = (likeCount[b.id] || 0) + (commentCount[b.id] || 0) * 2;
                return scoreB - scoreA;
              })
            : videos;

          return sorted.map((v, idx) => (
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
                if (el) {
                  el.dataset.index = String(idx);
                  if (observerRef.current) observerRef.current.observe(el);
                }
              }}
              src={v.video_url}
              autoPlay={idx === 0}
              muted
              loop
              playsInline
              preload="auto"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* 投稿カード下部：ユーザー名・タイトル・説明・ハッシュタグ */}
            <div
              style={{
                position: "absolute",
                left: 14,
                right: 100,
                bottom: 80,
                color: "#fff",
                textShadow: "0 2px 10px #000a",
                display: "flex",
                flexDirection: "column",
                gap: 7,
                zIndex: 150,
                background: "rgba(17,24,39,0.72)",
                borderRadius: 14,
                padding: "14px 16px 12px 14px",
                border: "1.5px solid rgba(255,255,255,0.08)",
                boxShadow: "0 4px 24px #0006",
                maxWidth: 320,
                minWidth: 180,
                cursor: "pointer",
                userSelect: "text",
              }}
              onClick={() => setDescExpanded((prev) => ({ ...prev, [v.id]: !prev[v.id] }))}
            >
              {/* ユーザー名 */}
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.01, color: "#38BDF8", marginBottom: 2 }}>
                @{v.user_id?.slice(0, 10) ?? "user"}
              </div>
              {/* タイトル */}
              <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", wordWrap: "break-word" }}>
                {v.title}
              </div>
              {/* 説明（2行→タップで展開） */}
              {v.description && (
                <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85, lineHeight: 1.5, margin: "2px 0 0 0", color: "#A855F7", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: descExpanded[v.id] ? 8 : 2, WebkitBoxOrient: "vertical", wordWrap: "break-word", cursor: "pointer", transition: "all 0.2s" }}>
                  {v.description}
                </div>
              )}
              {/* ハッシュタグ（ダミー） */}
              <div style={{ fontSize: 12, fontWeight: 600, color: "#06B6D4", marginTop: 2, opacity: 0.92 }}>
                #AIplus #Shorts #Demo
              </div>
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
          ));
        })()}

        {(() => {
          const sorted = activeTab === "trending"
            ? [...videos].sort((a, b) => {
                const scoreA = (likeCount[a.id] || 0) + (commentCount[a.id] || 0) * 2;
                const scoreB = (likeCount[b.id] || 0) + (commentCount[b.id] || 0) * 2;
                return scoreB - scoreA;
              })
            : videos;

          return sorted.length === 0 ? (
            <div style={{ color: "#333", padding: 20 }}>
              動画がまだありません
            </div>
          ) : null;
        })()}
      </div>

      {openCommentsFor && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            height: "55vh",
            background: "linear-gradient(180deg, rgba(245,245,245,.98) 0%, rgba(240,240,240,.97) 100%)",
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
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                {/* プロフィール画像 */}
                <div
                  onClick={() => router.push(`/u/${c.user_id}`)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#" + (c.user_id?.slice(0, 6) || "cccccc"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 14,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  title={c.user_id || "anonymous"}
                >
                  👤
                </div>
                
                {/* コメント内容 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={() => router.push(`/u/${c.user_id}`)}
                    style={{
                      fontSize: 12,
                      opacity: 0.8,
                      cursor: "pointer",
                      color: themeColor,
                      fontWeight: 600,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0.8";
                    }}
                  >
                    @{c.user_id?.slice(0, 6) ?? "anon"}
                  </div>
                  <div style={{ fontSize: 14, whiteSpace: "pre-wrap", marginTop: 4 }}>
                    {c.text}
                  </div>
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
  // 通常動画3件＋スポンサー投稿1件（2番目に挿入）
  const videos: VideoRow[] = [
    {
      id: "1",
      user_id: "user-demo-1",
      title: "AI+サンプル動画 #1",
      description: "動画投稿のサンプルです。",
      video_url: "/videos/v1.mp4",
      created_at: new Date(Date.now() - 1000000).toISOString(),
      aiScore: 92,
      musicId: "song-1",
    },
    {
      id: "sponsor-1",
      user_id: "sponsor-ai",
      title: "【PR】AIクリエイター向け最強PC！",
      description: "AI動画編集・生成AIに最適化。今だけ限定特価＆豪華特典付き。\n\n▶ 詳細は公式サイトへ！",
      video_url: "/videos/sponsor.mp4",
      created_at: new Date(Date.now() - 1500000).toISOString(),
      aiScore: 99,
      musicId: "sponsor-song",
      isSponsor: true,
      sponsorLabel: "Sponsored",
      sponsorCta: "公式サイトで見る",
      sponsorUrl: "https://aiplus-pc.example.com/",
    },
    {
      id: "2",
      user_id: "user-demo-2",
      title: "AI+サンプル動画 #2",
      description: "動画再生のテストです。",
      video_url: "/videos/v2.mp4",
      created_at: new Date(Date.now() - 2000000).toISOString(),
      aiScore: 88,
      musicId: "song-2",
    },
    {
      id: "3",
      user_id: "user-demo-3",
      title: "AI+サンプル動画 #3",
      description: "縦型フィードのデモです。",
      video_url: "/videos/v3.mp4",
      created_at: new Date(Date.now() - 3000000).toISOString(),
      aiScore: 85,
      musicId: "song-3",
    },
  ];
  return videos;
}