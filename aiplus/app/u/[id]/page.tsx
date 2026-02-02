"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hybridGet } from "@/lib/hybrid-storage";

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  video_url: string;
  created_at: string;
};

type UserProfile = {
  username: string;
  bio: string;
  avatar: string;
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
  const [profile, setProfile] = useState<UserProfile>({ username: "", bio: "", avatar: "👤" });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showMailModal, setShowMailModal] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");

  useEffect(() => {
    if (!id) {
      setReady(true);
      return;
    }

    const init = async () => {
      // 現在のユーザーIDを取得
      let meId: string | null = null;
      const sessionUser = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
      if (sessionUser) {
        try {
          const parsed = JSON.parse(sessionUser);
          meId = parsed.id || parsed.user_id;
        } catch {}
      }
      if (!meId) {
        meId = localStorage.getItem("me");
      }
      setCurrentUserId(meId || null);

      // 保存済みプロフィールを取得
      const savedProfile = await hybridGet(`userProfile_${id}`);
      if (savedProfile) {
        setProfile(savedProfile);
      } else {
        setProfile({ username: "", bio: "", avatar: "👤" });
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
    };

    init();
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

  if (!ready) return <div style={{ padding: 20, color: "#333" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#333" }}>
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "12px 14px",
          borderBottom: "1px solid rgba(0,0,0,.1)",
          background: "#ffffff",
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
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
          {profile.avatar && (profile.avatar.startsWith("data:") || profile.avatar.startsWith("http")) ? (
            <img
              src={profile.avatar}
              alt="avatar"
              style={{ width: 72, height: 72, borderRadius: 999, objectFit: "cover", boxShadow: "0 0 10px rgba(0,0,0,.12)" }}
            />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: 999, background: "rgba(0,0,0,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
              {profile.avatar || "👤"}
            </div>
          )}
        </div>
        <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 6 }}>
          @{profile.username || id?.slice(0, 10)}
        </div>
        {profile.bio && (
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
            {profile.bio}
          </div>
        )}
        
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

        {/* フォローボタン・メールボタン */}
        {currentUserId && id === currentUserId ? (
          <button
            onClick={() => router.push("/tabs/me")}
            style={{
              padding: "10px 24px",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,.15)",
              background: "white",
              color: "#333",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            マイページで編集
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
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
            <button
              onClick={() => setShowMailModal(true)}
              style={{
                padding: "10px 24px",
                borderRadius: 20,
                border: "1px solid rgba(0,150,255,.3)",
                background: "white",
                color: "rgba(0,150,255,.8)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              📧 メッセージ
            </button>
          </div>
        )}
      </div>

      {/* メール送信モーダル */}
      {showMailModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowMailModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              maxWidth: 500,
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#333" }}>
              メッセージを送信
            </div>
            <input
              type="text"
              placeholder="件名"
              value={mailSubject}
              onChange={(e) => setMailSubject(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,.2)",
                marginBottom: 12,
                fontSize: 14,
                color: "#333",
              }}
            />
            <textarea
              placeholder="メッセージ本文"
              value={mailBody}
              onChange={(e) => setMailBody(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,.2)",
                marginBottom: 16,
                fontSize: 14,
                minHeight: 120,
                resize: "vertical",
                color: "#333",
              }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowMailModal(false);
                  setMailSubject("");
                  setMailBody("");
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,.2)",
                  background: "white",
                  color: "#333",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (!mailSubject.trim() || !mailBody.trim()) {
                    alert("件名とメッセージを入力してください");
                    return;
                  }
                  
                  // メールデータを作成
                  const newMail = {
                    id: `mail-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    from: currentUserId || "anonymous",
                    fromUsername: "@" + (currentUserId || "anonymous"),
                    to: id,
                    subject: mailSubject,
                    body: mailBody,
                    date: new Date().toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
                    read: false,
                  };
                  
                  // 受信者のメール一覧を取得して追加
                  const existingMails = localStorage.getItem(`mails_${id}`);
                  const mails = existingMails ? JSON.parse(existingMails) : [];
                  mails.unshift(newMail);
                  localStorage.setItem(`mails_${id}`, JSON.stringify(mails));
                  
                  alert("メッセージを送信しました！");
                  setShowMailModal(false);
                  setMailSubject("");
                  setMailBody("");
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(0,150,255,.8)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                送信
              </button>
            </div>
          </div>
        </div>
      )}

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