"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  video_url: string;
  created_at: string;
};

export default function UserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [ready, setReady] = useState(false);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!id) {
      setReady(true);
      return;
    }

    // localStorage から動画を取得
    const mockVideos = localStorage.getItem("mockVideos");
    const allVideos = mockVideos ? JSON.parse(mockVideos) : [];
    const userVideos = allVideos.filter((v: VideoRow) => v.user_id === id);
    setVideos(userVideos);

    // フォロー状態を取得
    const followsData = localStorage.getItem("follows");
    const follows = followsData ? JSON.parse(followsData) : {};
    setIsFollowing(follows[id] || false);

    // フォロワー数を計算
    const followers = Object.keys(follows).filter((userId) => follows[userId]);
    setFollowerCount(followers.length);
    setFollowingCount(Math.floor(Math.random() * 50));

    setReady(true);
  }, [id]);

  const toggleFollow = () => {
    if (!id) return;

    const followsData = localStorage.getItem("follows");
    const follows = followsData ? JSON.parse(followsData) : {};
    
    follows[id] = !isFollowing;
    localStorage.setItem("follows", JSON.stringify(follows));
    
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  if (!ready) return <div style={{ padding: 20, color: "white" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "black", color: "white" }}>
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "12px 14px",
          borderBottom: "1px solid rgba(255,255,255,.12)",
          background: "rgba(0,0,0,.85)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.06)",
            color: "white",
            cursor: "pointer",
          }}
        >
          ← 戻る
        </button>
        
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          プロフィール
        </div>
        
        <div style={{ width: 60 }} />
      </div>

      {/* プロフィール情報 */}
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
        <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
          @{id?.slice(0, 10)}
        </div>
        
        {/* フォロワー・フォロー中 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16, opacity: 0.8 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{followerCount}</div>
            <div style={{ fontSize: 12 }}>フォロワー</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{followingCount}</div>
            <div style={{ fontSize: 12 }}>フォロー中</div>
          </div>
        </div>

        {/* フォローボタン */}
        <button
          onClick={toggleFollow}
          style={{
            padding: "10px 24px",
            borderRadius: 20,
            border: isFollowing ? "1px solid rgba(255,255,255,.3)" : "none",
            background: isFollowing ? "transparent" : "rgba(0,150,255,.8)",
            color: "white",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          {isFollowing ? "フォロー中" : "フォローする"}
        </button>
      </div>

      {/* 投稿グリッド */}
      <div style={{ padding: "0 8px 100px" }}>
        <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 12, paddingLeft: 8 }}>
          投稿 ({videos.length})
        </div>

        {videos.length === 0 ? (
          <div style={{ opacity: 0.85, padding: 20, textAlign: "center" }}>
            このユーザーはまだ投稿していません
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
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "rgba(255,255,255,.04)",
                  padding: 0,
                  cursor: "pointer",
                  aspectRatio: "9 / 16",
                  position: "relative",
                }}
              >
                <video
                  src={v.video_url}
                  muted
                  playsInline
                  preload="metadata"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {v.title && (
                  <div
                    style={{
                      position: "absolute",
                      left: 8,
                      right: 8,
                      bottom: 8,
                      fontSize: 11,
                      textAlign: "left",
                      padding: "6px 8px",
                      borderRadius: 10,
                      background: "rgba(0,0,0,.55)",
                      border: "1px solid rgba(255,255,255,.12)",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {v.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}