"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hybridGet, hybridSet } from "@/lib/hybrid-storage";

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

type CurrentUser = {
  id?: string;
  user_id?: string;
  username?: string;
  handle?: string;
  [key: string]: unknown;
};

type AppUser = {
  id: string;
  handle?: string;
};

type Sale = {
  id: string;
  sellerId: string;
  buyerName?: string;
  amount?: number;
  netAmount?: number;
  createdAt: string;
  payoutStatus?: string;
  paidAt?: string;
};

type MailItem = {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  read?: boolean;
};

export default function ProfileViewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({ username: "", bio: "", avatar: "👤" });
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [savedVideos, setSavedVideos] = useState<VideoRow[]>([]);
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [mySales, setMySales] = useState<Sale[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [sellerBalance, setSellerBalance] = useState(0);
  const [mailList, setMailList] = useState<MailItem[]>([]);
  const [selectedMail, setSelectedMail] = useState<string | null>(null);
  const [ideaMessages, setIdeaMessages] = useState<{ id: string; role: "ai" | "user"; text: string }[]>([
    {
      id: "ai-welcome",
      role: "ai",
      text: "どんなページにしたいか教えてください。目的・ターゲット・雰囲気を書けば、AIがネタ案や構成を提案します。",
    },
  ]);
  const [pageGoal, setPageGoal] = useState("");
  const [pageAudience, setPageAudience] = useState("");
  const [pageTone, setPageTone] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "mail" | "ideas" | "sales" | "score">("profile");
  const tabs: Array<"profile" | "mail" | "ideas" | "sales" | "score"> = [
    "profile",
    "mail",
    "sales",
    "score",
    "ideas",
  ];

  // 投稿を再読み込みする関数
  const refreshVideos = () => {
    let userId = null;
    const userSessionRaw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    if (userSessionRaw) {
      try {
        const parsed = JSON.parse(userSessionRaw);
        userId = parsed.id;
      } catch {}
    }

    let userVideos: VideoRow[] = [];
    const allVideosRaw = localStorage.getItem("mockVideos");
    const allVideos: VideoRow[] = allVideosRaw ? JSON.parse(allVideosRaw) : [];
    if (userId) {
      userVideos = allVideos.filter((v) => v.user_id === userId);
      if (userVideos.length === 0) {
        const userVideosRaw = localStorage.getItem(`videos_${userId}`);
        if (userVideosRaw) {
          userVideos = JSON.parse(userVideosRaw);
        }
      }
    }
    setVideos(userVideos);
  };

  const payoutCounts = useMemo(() => {
    const completed = mySales.filter((sale) => sale?.payoutStatus === "completed" || sale?.payoutStatus === "paid" || sale?.paidAt).length;
    const pending = Math.max(0, mySales.length - completed);
    return { pending, completed };
  }, [mySales]);

  useEffect(() => {
    const init = async () => {
      const settings = (await hybridGet("appSettings")) || {};
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

      // 現在のユーザーIDを取得（複数のソースから確実に取得）
      let userId = null;
      const userSessionRaw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
      if (userSessionRaw) {
        try {
          const parsed = JSON.parse(userSessionRaw);
          userId = parsed.id || parsed.user_id;
          setCurrentUser(parsed);
        } catch {}
      }

      if (!userId) {
        userId = localStorage.getItem("me");
      }

      if (!userId) {
        userId = "demo-user";
        localStorage.setItem("me", userId);
      }
      setCurrentUserId(userId);

      // プロフィール情報を読み込み
      const savedProfile = await hybridGet(`userProfile_${userId}`);
      if (savedProfile) {
        setProfile(savedProfile);
      } else {
        const legacyProfile = localStorage.getItem("profile");
        if (legacyProfile) {
          try {
            const parsed = JSON.parse(legacyProfile);
            setProfile(parsed);
            await hybridSet(`userProfile_${userId}`, parsed);
          } catch {}
        }
      }

      const userSessionRaw2 = sessionStorage.getItem("currentUser");
      const storedUser = userSessionRaw2 || localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const users: AppUser[] = JSON.parse(localStorage.getItem("aiplus_users") || "[]");
          const me = users.find((u) => u.id === parsed?.id);
          if (me?.handle) {
            setProfile((prev) => ({ ...prev, handle: me.handle }));
          }
        } catch {
          // ignore
        }
      }

      // ユーザーごとの投稿のみ表示
      let userVideos: VideoRow[] = [];
      const allVideosRaw = localStorage.getItem("mockVideos");
      const allVideos: VideoRow[] = allVideosRaw ? JSON.parse(allVideosRaw) : [];
      if (userId) {
        userVideos = allVideos.filter((v) => v.user_id === userId);
        if (userVideos.length === 0) {
          const userVideosRaw = localStorage.getItem(`videos_${userId}`);
          if (userVideosRaw) {
            userVideos = JSON.parse(userVideosRaw);
          }
        }
      }
      setVideos(userVideos);

      const saved = localStorage.getItem("savedVideos");
      const savedList = saved ? JSON.parse(saved) : [];
      setSavedVideos(savedList);

      // 売上データを取得
      const salesData = localStorage.getItem("sales");
      if (salesData && userId) {
        const sales: Sale[] = JSON.parse(salesData);
        const userSales = sales.filter((s: Sale) => s.sellerId === userId);
        setMySales(userSales);

        // 総売上を計算
        const total = userSales.reduce((sum: number, sale: Sale) => sum + (sale.netAmount ?? sale.amount ?? 0), 0);
        setTotalRevenue(total);
      }

      // 口座残高（手数料控除後）を取得
      if (userId) {
        const balancesRaw = localStorage.getItem("sellerBalances") || "{}";
        const balances = JSON.parse(balancesRaw);
        setSellerBalance(balances[userId] || 0);
      }

      // メールを取得
      const mailsData = localStorage.getItem(`mails_${userId}`);
      if (mailsData) {
        const mails = JSON.parse(mailsData);
        setMailList(mails);
      }
    };

    init();

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

  // アクティブなタブが「profile」に変わったときに投稿を再読み込み
  useEffect(() => {
    if (activeTab === "profile") {
      refreshVideos();
    }
  }, [activeTab]);

  const pushIdeaMessage = (role: "ai" | "user", text: string) => {
    setIdeaMessages((prev) => [...prev, { id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, role, text }]);
  };

  const addSampleMail = () => {
    if (!currentUserId) return;
    const newMail = {
      id: `mail-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      from: "system",
      subject: "テストメッセージ",
      body: "これは受信表示確認用のテストメッセージです。",
      date: new Date().toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    const existingMails = localStorage.getItem(`mails_${currentUserId}`);
    const mails = existingMails ? JSON.parse(existingMails) : [];
    mails.unshift(newMail);
    localStorage.setItem(`mails_${currentUserId}`, JSON.stringify(mails));
    setMailList(mails);
  };

  const refreshMailList = () => {
    if (!currentUserId) return;
    const mailsData = localStorage.getItem(`mails_${currentUserId}`);
    const mails = mailsData ? JSON.parse(mailsData) : [];
    setMailList(mails);
    setSelectedMail(null);
  };


  const handleGenerateIdeas = () => {
    const goal = pageGoal.trim() || "ファンが集まる自己紹介ページ";
    const audience = pageAudience.trim() || "動画を見てくれる潜在フォロワー";
    const tone = pageTone.trim() || "親しみやすくワクワク";

    pushIdeaMessage("user", `目的: ${goal}\nターゲット: ${audience}\n雰囲気: ${tone}`);

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

  const topVideo = useMemo(() => videos[0], [videos]);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("autoLoginUserId");
    router.push("/login");
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
          onClick={handleLogout}
          style={{ background: "transparent", border: "none", color: themeColor, cursor: "pointer", fontSize: 15, fontWeight: 600, marginRight: 8 }}
          title="ログアウト"
        >
          ログアウト
        </button>
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

        {/* タブナビゲーション */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 8 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                // プロフィールタブ切り替え時に投稿を再読み込み
                if (tab === "profile") {
                  setTimeout(() => refreshVideos(), 100);
                }
              }}
              style={{
                padding: "10px 16px",
                borderRadius: 20,
                border: activeTab === tab ? `2px solid ${themeColor}` : `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.2)" : `${themeColor}40`}`,
                background: activeTab === tab
                  ? `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`
                  : backgroundColor === "light" ? "#f0f0f0" : "transparent",
                color: activeTab === tab ? "#ffffff" : themeColor,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.3s ease",
              }}
            >
              {tab === "profile" && "📝 プロフィール"}
              {tab === "mail" && "📥 メッセージ"}
              {tab === "sales" && "💰 売上"}
              {tab === "ideas" && "💡 AI相談"}
              {tab === "score" && "🏆 スコア"}
            </button>
          ))}
        </div>

        {/* プロフィールタブ */}
        {activeTab === "profile" && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: 14,
                borderRadius: 12,
                marginBottom: 14,
                background: backgroundColor === "light"
                  ? `linear-gradient(135deg, ${themeColor}12, ${themeColor}06)`
                  : `linear-gradient(135deg, ${themeColor}20, ${themeColor}10)`,
                border: `1px solid ${themeColor}40`,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: themeColor, marginBottom: 4 }}>
                  📥 メッセージ一覧
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  受信メッセージ: {mailList.length}件
                </div>
              </div>
              <button
                onClick={() => setActiveTab("mail")}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: `1px solid ${themeColor}`,
                  background: "transparent",
                  color: themeColor,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                開く
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button
                onClick={() => router.push("/sell")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                  color: "white",
                  fontSize: 13,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                新しい商品を出品する
              </button>
              <button
                onClick={() => router.push("/upload/camera")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: `linear-gradient(135deg, ${themeColor}cc, ${themeColor}99)`,
                  color: "white",
                  fontSize: 13,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                📹 新規投稿
              </button>
            </div>

            {/* 投稿ビデオ */}
            {videos.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {videos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => router.push(`/video/${v.id}`)}
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: backgroundColor === "light" ? "#f0f0f0" : `${themeColor}15`,
                      position: "relative",
                    }}
                  >
                    <video
                      src={v.video_url}
                      style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                    />
                    <div style={{ padding: 8, fontSize: 11, fontWeight: 600, color: themeColor }}>
                      {v.title || "タイトルなし"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: 32,
                  borderRadius: 12,
                  background: backgroundColor === "light"
                    ? `linear-gradient(135deg, ${themeColor}08, ${themeColor}03)`
                    : `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)`,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}40`,
                  opacity: 0.7,
                }}
              >
                <div style={{ fontSize: 12, marginBottom: 8 }}>投稿がまだありません</div>
                <button
                  onClick={() => router.push("/upload/camera")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: `1px solid ${themeColor}`,
                    background: "transparent",
                    color: themeColor,
                    fontSize: 12,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  投稿を作成する
                </button>
              </div>
            )}
          </div>
        )}

        {/* メールタブ */}
        {activeTab === "mail" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 10 }}>
              <button
                onClick={refreshMailList}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: `1px solid ${themeColor}`,
                  background: "transparent",
                  color: themeColor,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                受信
              </button>
              <button
                onClick={addSampleMail}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: `1px solid ${themeColor}`,
                  background: "transparent",
                  color: themeColor,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                テストメッセージを追加
              </button>
            </div>
            {selectedMail ? (
              <div>
                <button
                  onClick={() => setSelectedMail(null)}
                  style={{
                    marginBottom: 12,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: `linear-gradient(135deg, ${themeColor}44, ${themeColor}33)`,
                    color: themeColor,
                    fontSize: 12,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ← 戻る
                </button>
                {mailList.find((m) => m.id === selectedMail) && (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: backgroundColor === "light"
                        ? "#ffffff"
                        : `linear-gradient(135deg, ${themeColor}12, ${themeColor}06)`,
                      border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}40`,
                      boxShadow: backgroundColor === "light" ? "0 4px 14px rgba(0,0,0,.06)" : `0 6px 18px ${themeColor}22`,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: themeColor }}>
                      {mailList.find((m) => m.id === selectedMail)?.subject}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>
                      From: {mailList.find((m) => m.id === selectedMail)?.from}
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", opacity: 0.9 }}>
                      {mailList.find((m) => m.id === selectedMail)?.body}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mailList.length === 0 ? (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: backgroundColor === "light"
                        ? "rgba(255,255,255,.9)"
                        : `linear-gradient(135deg, ${themeColor}12, ${themeColor}06)`,
                      border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}40`,
                      fontSize: 12,
                      opacity: 0.8,
                      textAlign: "center",
                    }}
                  >
                    メッセージはまだありません
                  </div>
                ) : (
                  mailList.map((mail) => (
                    <button
                      key={mail.id}
                      onClick={() => setSelectedMail(mail.id)}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}40`,
                        background: backgroundColor === "light"
                          ? "linear-gradient(135deg, rgba(255,255,255,.9), rgba(240,240,240,.8))"
                          : `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)`,
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: 4, color: themeColor, fontSize: 13 }}>
                        {mail.subject}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                        {mail.from}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {mail.body}
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.5 }}>
                        {mail.date}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* 売上管理セクション */}
        {activeTab === "sales" && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12, opacity: 0.9, fontSize: 14, color: themeColor, fontWeight: 700 }}>
            💰 売上管理
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: `1px solid ${themeColor}40`,
                background: backgroundColor === "light"
                  ? `linear-gradient(135deg, ${themeColor}12, ${themeColor}08)`
                  : `linear-gradient(135deg, ${themeColor}20, ${themeColor}10)`,
                fontSize: 11,
                fontWeight: 700,
                color: themeColor,
              }}
            >
              送金予定 {payoutCounts.pending}件
            </div>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: `1px solid ${themeColor}40`,
                background: backgroundColor === "light"
                  ? `linear-gradient(135deg, ${themeColor}12, ${themeColor}08)`
                  : `linear-gradient(135deg, ${themeColor}20, ${themeColor}10)`,
                fontSize: 11,
                fontWeight: 700,
                color: themeColor,
              }}
            >
              送金完了 {payoutCounts.completed}件
            </div>
          </div>

          {/* 売上統計 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                background: backgroundColor === "light"
                  ? `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)`
                  : `linear-gradient(135deg, ${themeColor}25, ${themeColor}15)`,
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${themeColor}40`,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>総売上</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: themeColor }}>
                ¥{totalRevenue.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                background: backgroundColor === "light"
                  ? `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)`
                  : `linear-gradient(135deg, ${themeColor}25, ${themeColor}15)`,
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${themeColor}40`,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>口座残高</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: themeColor }}>
                ¥{sellerBalance.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                background: backgroundColor === "light"
                  ? `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)`
                  : `linear-gradient(135deg, ${themeColor}25, ${themeColor}15)`,
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${themeColor}40`,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>販売数</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: themeColor }}>
                {mySales.length}
              </div>
            </div>
          </div>

          {/* 最近の販売 */}
          {mySales.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>最近の販売</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 250, overflowY: "auto" }}>
                {mySales.reverse().slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 12,
                      background: backgroundColor === "light" ? "#f8f8f8" : `${themeColor}15`,
                      borderRadius: 10,
                      border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}25`}`,
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", marginBottom: 2 }}>{sale.buyerName}</div>
                      <div style={{ opacity: 0.6, fontSize: 11 }}>
                        {new Date(sale.createdAt).toLocaleDateString("ja-JP")}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "bold", color: themeColor }}>
                        ¥{sale.amount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>
                        {sale?.payoutStatus === "completed" || sale?.payoutStatus === "paid" || sale?.paidAt ? "送金完了" : "送金予定"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => router.push("/sell")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                color: "white",
                fontSize: 13,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              新しい商品を出品する
            </button>
            {mySales.length > 0 && (
              <button
                onClick={() => router.push("/sales")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: `1px solid ${themeColor}`,
                  background: "transparent",
                  color: themeColor,
                  fontSize: 13,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                売上詳細
              </button>
            )}
          </div>
        </div>
        )}

        {/* スコアタブ */}
        {activeTab === "score" && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12, opacity: 0.9, fontSize: 14, color: themeColor, fontWeight: 700 }}>
            🏆 スコア
          </div>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: backgroundColor === "light"
                ? "#ffffff"
                : `linear-gradient(135deg, ${themeColor}12, ${themeColor}06)`,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}40`,
              boxShadow: backgroundColor === "light" ? "0 4px 14px rgba(0,0,0,.06)" : `0 6px 18px ${themeColor}22`,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
              自分のスコア上位10位・全ユーザーTOP5を確認できます
            </div>
            <button
              onClick={() => router.push("/tabs/score")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                color: "white",
                fontSize: 13,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              スコアページを見る
            </button>
          </div>
        </div>
        )}

        {/* AI相談 - ページ企画設定 & AIアイデア */}
        {activeTab === "ideas" && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12, opacity: 0.9, fontSize: 14, color: themeColor, fontWeight: 700 }}>
            💡 AI相談 - ページ企画設定 & AIアイデア
          </div>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.75 }}>どんなページにしたい？</label>
              <input
                value={pageGoal}
                onChange={(e) => setPageGoal(e.target.value)}
                placeholder="例: 初見さん向けの自己紹介"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                  color: backgroundColor === "light" ? "#333" : "white",
                  fontSize: 13,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.75 }}>ターゲット/読者</label>
              <input
                value={pageAudience}
                onChange={(e) => setPageAudience(e.target.value)}
                placeholder="例: 勉強系ショート好きな20代"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                  color: backgroundColor === "light" ? "#333" : "white",
                  fontSize: 13,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.75 }}>雰囲気/トーン</label>
              <input
                value={pageTone}
                onChange={(e) => setPageTone(e.target.value)}
                placeholder="例: 親しみやすく、ワクワク"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                  color: backgroundColor === "light" ? "#333" : "white",
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          <button
            onClick={handleGenerateIdeas}
            style={{
              width: "100%",
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
        )}
      </div>
    </div>
  );
}
