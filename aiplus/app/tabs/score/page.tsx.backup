"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_url: string;
  hashtags: string[];
  aiScore: number;
  created_at: string;
}

interface UserRanking {
  user_id: string;
  username: string;
  avatar?: string;
  totalScore: number;
  videoCount: number;
  rank: number;
}

export default function ScorePage() {
  const router = useRouter();
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [aiAdviceVisible, setAiAdviceVisible] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [userScore, setUserScore] = useState(0);

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

    // カスタムイベント "themeChanged" をリッスン
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

    // ビデオデータを取得
    const mockVideos = localStorage.getItem("mockVideos");
    let videos: Video[] = mockVideos ? JSON.parse(mockVideos) : [];
    const currentUserId = "test-user-" + (localStorage.getItem("userId") || "default");
    let userVideos = videos.filter((v: Video) => v.user_id.startsWith("test-user-"));

    // 初回データが無い場合はサンプルを3件生成
    if (userVideos.length === 0) {
      const now = Date.now();
      const sampleVideos: Video[] = [
        {
          id: "sample-video-1",
          user_id: currentUserId,
          title: "旅行Vlog: 京都の紅葉巡り",
          description: "秋の京都で紅葉名所を巡りました。伏見稲荷や清水寺の絶景！",
          video_url: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerJoyrides.mp4",
          hashtags: ["#旅行", "#京都", "#紅葉"],
          aiScore: 92,
          created_at: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: "sample-video-2",
          user_id: currentUserId,
          title: "カフェレビュー: 新作ラテ飲み比べ",
          description: "3種類の季節限定ラテを飲み比べ。おすすめはシナモンラテ！",
          video_url: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerMeltdowns.mp4",
          hashtags: ["#カフェ", "#レビュー", "#ラテ"],
          aiScore: 85,
          created_at: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
        },
        {
          id: "sample-video-3",
          user_id: currentUserId,
          title: "ワークアウト10分チャレンジ",
          description: "自宅でできるHIITトレーニングを10分で完走！初心者OK。",
          video_url: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4",
          hashtags: ["#筋トレ", "#HIIT", "#おうち時間"],
          aiScore: 78,
          created_at: new Date(now - 1000 * 60 * 30).toISOString(),
        },
      ];

      videos = [...videos, ...sampleVideos];
      localStorage.setItem("mockVideos", JSON.stringify(videos));
      userVideos = sampleVideos;
    }

    setMyVideos(userVideos);

    // 自分のスコア計算
    const totalScore = userVideos.reduce((sum: number, v: Video) => sum + (v.aiScore || 0), 0);
    setUserScore(totalScore);

    // ランキングデータを生成
    generateRankings(videos);

    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  const generateRankings = (videos: Video[]) => {
    // ユーザーごとのスコア集計
    const userScores: Record<string, { totalScore: number; videoCount: number }> = {};

    videos.forEach((video: Video) => {
      const userId = video.user_id;
      if (!userScores[userId]) {
        userScores[userId] = { totalScore: 0, videoCount: 0 };
      }
      userScores[userId].totalScore += video.aiScore || 0;
      userScores[userId].videoCount += 1;
    });

    // ランキングを作成
    const rankingList: UserRanking[] = Object.entries(userScores)
      .map(([userId, data], index) => ({
        user_id: userId,
        username: userId.replace("test-user-", "User"),
        totalScore: data.totalScore,
        videoCount: data.videoCount,
        rank: index + 1,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    setRankings(rankingList);
  };

  const handleGenerateAiAdvice = () => {
    const currentVideo = myVideos[currentSlideIndex];
    if (!currentVideo) return;

    // 簡易的なAIアドバイス生成
    const advices = [
      `「${currentVideo.title}」は素晴らしいコンテンツです！AIスコア ${currentVideo.aiScore} はあなたの創造性を示しています。さらに視聴者の関心を引くハッシュタグを追加することで、さらに高いスコアが期待できます。`,
      `このビデオのエンゲージメントを高めるには、より詳細な説明文を追加することをお勧めします。現在のスコア: ${currentVideo.aiScore}。説明文の質がスコアアップの鍵になります。`,
      `AIの評価：${currentVideo.aiScore}/100\n\n強み：\n• 視覚的な魅力\n• ユーザーの関心を引く内容\n\n改善点：\n• ハッシュタグの多様性を増やす\n• より長いコンテンツを検討`,
    ];

    const randomAdvice = advices[Math.floor(Math.random() * advices.length)];
    setAiAdvice(randomAdvice);
    setAiAdviceVisible(true);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < myVideos.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      setAiAdviceVisible(false);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setAiAdviceVisible(false);
    }
  };

  const currentVideo = myVideos[currentSlideIndex];
  const myVideoRanking = [...myVideos].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: backgroundColor === "light"
          ? "#ffffff"
          : "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
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
        }}
      >
        <div style={{ fontWeight: "bold", color: themeColor, textShadow: `0 0 16px ${themeColor}66`, textAlign: "center", fontSize: 18 }}>
          🎯 スコア
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        {/* スコアカード */}
        <div
          style={{
            padding: 24,
            background: backgroundColor === "light"
              ? `linear-gradient(135deg, ${themeColor}06, ${themeColor}03)`
              : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
            borderRadius: 12,
            border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}40`,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>あなたの総スコア</div>
          <div style={{ fontSize: 48, fontWeight: "bold", color: themeColor, marginBottom: 4 }}>
            {userScore}
          </div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            投稿数: {myVideos.length}
          </div>
        </div>

        {/* スライダーセクション */}
        {myVideos.length > 0 ? (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, opacity: 0.9 }}>
              📱 投稿スコア確認
            </div>

            {/* コイン型スライダー */}
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 14,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 760 }}>
                {/* スコアコイン（小さめ、左側中央） */}
                <div
                  style={{
                    width: 150,
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${themeColor}4d, ${themeColor}1a)`,
                    border: `3px solid ${themeColor}80`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: `0 0 32px ${themeColor}66, inset 0 -8px 16px ${themeColor}33`,
                    textAlign: "center",
                    padding: 14,
                    boxSizing: "border-box",
                    order: 1,
                    flex: "0 0 30%",
                    minWidth: 140,
                    maxWidth: 170,
                  }}
                >
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>スコア</div>
                  <div style={{ fontSize: 48, fontWeight: "bold", color: themeColor, lineHeight: 1 }}>
                    {currentVideo.aiScore}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>
                    {currentSlideIndex + 1} / {myVideos.length}
                  </div>
                </div>

                {/* コイン横の動画プレビュー（大きめ、右側） */}
                {currentVideo?.video_url && (
                  <div
                    style={{
                      order: 2,
                      flex: "1 1 60%",
                      minWidth: 240,
                      maxWidth: 420,
                      width: "100%",
                      padding: 10,
                      borderRadius: 12,
                      border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}33`,
                      background: backgroundColor === "light"
                        ? "#ffffff"
                        : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}08)`,
                    }}
                  >
                    <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>プレビュー</div>
                    <video
                      key={currentVideo.id}
                      src={currentVideo.video_url}
                      controls
                      style={{ width: "100%", borderRadius: 8, border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}26`, maxHeight: 240, objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* スライド操作ボタン（左右を隣同士に配置） */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16 }}>
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                style={{
                  background: currentSlideIndex === 0 ? "transparent" : themeColor,
                  border: `1px solid ${currentSlideIndex === 0 ? "rgba(0,0,0,.15)" : `${themeColor}80`}`,
                  color: currentSlideIndex === 0 ? "rgba(0,0,0,.35)" : "white",
                  width: 46,
                  height: 36,
                  borderRadius: 10,
                  cursor: currentSlideIndex === 0 ? "default" : "pointer",
                  fontSize: 16,
                  opacity: currentSlideIndex === 0 ? 0.5 : 0.95,
                  boxShadow: currentSlideIndex === 0 ? "none" : `0 0 10px ${themeColor}33`,
                  transition: "all 0.2s ease",
                }}
              >
                ‹
              </button>
              <button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === myVideos.length - 1}
                style={{
                  background: currentSlideIndex === myVideos.length - 1 ? "transparent" : themeColor,
                  border: `1px solid ${currentSlideIndex === myVideos.length - 1 ? "rgba(0,0,0,.15)" : `${themeColor}80`}`,
                  color: currentSlideIndex === myVideos.length - 1 ? "rgba(0,0,0,.35)" : "white",
                  width: 46,
                  height: 36,
                  borderRadius: 10,
                  cursor: currentSlideIndex === myVideos.length - 1 ? "default" : "pointer",
                  fontSize: 16,
                  opacity: currentSlideIndex === myVideos.length - 1 ? 0.5 : 0.95,
                  boxShadow: currentSlideIndex === myVideos.length - 1 ? "none" : `0 0 10px ${themeColor}33`,
                  transition: "all 0.2s ease",
                }}
              >
                ›
              </button>
            </div>

            {/* 現在の動画タイトル表示 */}
            {currentVideo && (
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: themeColor, lineHeight: 1.3 }}>
                  {currentVideo.title || "タイトルなし"}
                </div>
                <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>
                  {currentVideo.hashtags && currentVideo.hashtags.length > 0 ? currentVideo.hashtags.join(" ") : "ハッシュタグ: なし"}
                </div>
              </div>
            )}

            {/* ビデオ情報 */}
            <div
              style={{
                padding: 16,
                background: backgroundColor === "light"
                  ? "#ffffff"
                  : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)`,
                border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}40`,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: themeColor }}>
                {currentVideo.title}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12, lineHeight: 1.6 }}>
                {currentVideo.description}
              </div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>
                ハッシュタグ: {currentVideo?.hashtags && currentVideo.hashtags.length > 0 ? currentVideo.hashtags.join(" ") : "なし"}
              </div>
            </div>

            {/* AIアドバイスボタン */}
            <button
              onClick={handleGenerateAiAdvice}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                border: `1px solid ${themeColor}80`,
                background: `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
                color: "white",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              🤖 AIアドバイス・評価を聞く
            </button>

            {/* AIアドバイス表示 */}
            {aiAdviceVisible && (
              <div
                style={{
                  padding: 16,
                  background: backgroundColor === "light"
                    ? `linear-gradient(135deg, ${themeColor}08, ${themeColor}04)`
                    : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}40`,
                  borderRadius: 8,
                  marginBottom: 16,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.8,
                  fontSize: 13,
                  opacity: 0.95,
                }}
              >
                {aiAdvice}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              opacity: 0.6,
              marginBottom: 32,
            }}
          >
            投稿がありません。動画をアップロードしてスコアを見てみましょう！
          </div>
        )}

        {/* 自分の投稿ランキング */}
        {myVideoRanking.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, opacity: 0.9 }}>
              📈 自分の投稿ランキング
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {myVideoRanking.map((video, index) => (
                <div
                  key={video.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}33`,
                    background: backgroundColor === "light"
                      ? "#ffffff"
                      : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}08)`
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: index === 0
                          ? `linear-gradient(135deg, #FFD700, #FFA500)`
                          : `linear-gradient(135deg, ${themeColor}4d, ${themeColor}1a)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: index === 0 ? "#8b4513" : themeColor,
                        fontWeight: 700,
                        fontSize: 13,
                        border: index === 0 ? "none" : `1px solid ${themeColor}33`,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: themeColor, marginBottom: 2 }}>
                        {video.title || "タイトルなし"}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.65 }}>
                        {video.hashtags && video.hashtags.length > 0 ? video.hashtags.join(" ") : "ハッシュタグ: なし"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 56 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: themeColor }}>{video.aiScore}</div>
                      <div style={{ fontSize: 10, opacity: 0.55 }}>pts</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>
                    {video.description || "説明なし"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ランキングセクション */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, opacity: 0.9 }}>
            🏆 全ユーザーランキング
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rankings.length > 0 ? (
              rankings.map((user) => (
                <div
                  key={user.user_id}
                  style={{
                    padding: 12,
                    background: backgroundColor === "light"
                      ? "#ffffff"
                      : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)`,
                    border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}40`,
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background:
                          user.rank === 1
                            ? `linear-gradient(135deg, #FFD700, #FFA500)`
                            : user.rank === 2
                            ? `linear-gradient(135deg, #C0C0C0, #A9A9A9)`
                            : user.rank === 3
                            ? `linear-gradient(135deg, #CD7F32, #A0522D)`
                            : `linear-gradient(135deg, ${themeColor}4d, ${themeColor}1a)`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "bold",
                        color: user.rank <= 3 ? "white" : themeColor,
                        border: user.rank <= 3 ? "none" : `1px solid ${themeColor}40`,
                      }}
                    >
                      {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : user.rank}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                        {user.username}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>
                        投稿数: {user.videoCount}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: "bold", color: themeColor }}>
                      {user.totalScore}
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.5 }}>pts</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", opacity: 0.6, padding: 16 }}>
                ランキングデータがありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
