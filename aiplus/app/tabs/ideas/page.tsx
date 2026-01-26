"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TrendItem {
  id: string;
  title: string;
  category: string;
  views: string;
  tags: string[];
  time: string;
}

interface IdeaItem {
  id: string;
  headline: string;
  hook: string;
  angle: string;
  tags: string[];
}

export default function IdeasPage() {
  const router = useRouter();
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

  const ideaList: IdeaItem[] = [
    {
      id: "i1",
      headline: "3分でわかるトレンド解説",
      hook: "#ショート #まとめ #速報",
      angle: "最新ニュースを要点3つでまとめる短尺シリーズ",
      tags: ["#ニュース", "#ショート", "#要約"],
    },
    {
      id: "i2",
      headline: "1日1チャレンジ Vlog",
      hook: "#ライフログ #チャレンジ #デイリー",
      angle: "毎日小さな挑戦を記録する連載企画。視聴者参加型アンケート付き",
      tags: ["#Vlog", "#習慣化", "#チャレンジ"],
    },
    {
      id: "i3",
      headline: "AIに聞く裏ワザ特集",
      hook: "#AI活用 #Tips #効率化",
      angle: "日常や仕事で使える小技をAIが提案するシリーズ",
      tags: ["#AI", "#ハック", "#仕事効率"],
    },
    {
      id: "i4",
      headline: "視聴者Q&Aライブ切り抜き",
      hook: "#ライブ #QnA #切り抜き",
      angle: "ライブで集めた質問を短く切り抜き、連続再生で学習体験を作る",
      tags: ["#ライブ", "#学び", "#QnA"],
    },
  ];

  const trends: TrendItem[] = [
    {
      id: "t1",
      title: "【保存版】5分で作れる夜食レシピ",
      category: "フード",
      views: "158K",
      tags: ["#時短", "#レシピ", "#夜食"],
      time: "23分前",
    },
    {
      id: "t2",
      title: "ジムに行かずに効く10分HIIT",
      category: "フィットネス",
      views: "96K",
      tags: ["#HIIT", "#自宅", "#10分"],
      time: "1時間前",
    },
    {
      id: "t3",
      title: "AIで作るおしゃれサムネ講座",
      category: "クリエイティブ",
      views: "122K",
      tags: ["#AI", "#サムネ", "#デザイン"],
      time: "2時間前",
    },
    {
      id: "t4",
      title: "週末旅Vlog: 予算2万円でどこまで遊べる？",
      category: "トラベル",
      views: "81K",
      tags: ["#旅行", "#Vlog", "#週末"],
      time: "3時間前",
    },
  ];

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            color: themeColor,
            cursor: "pointer",
            fontSize: 22,
          }}
        >
          ×
        </button>
        <div style={{ fontWeight: "bold", color: themeColor, textShadow: `0 0 16px ${themeColor}66`, fontSize: 18 }}>
          📰 ネタ&トレンド新聞
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* AIネタ提案 */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: backgroundColor === "light"
              ? `linear-gradient(135deg, ${themeColor}05, ${themeColor}08)`
              : `linear-gradient(135deg, ${themeColor}18, ${themeColor}0d)`,
            border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}40`,
            boxShadow: backgroundColor === "light" ? "0 6px 18px rgba(0,0,0,.06)" : `0 8px 24px ${themeColor}22`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: themeColor }}>🤖 今日のAIネタ提案</div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>更新: 数分前</div>
          </div>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {ideaList.map((idea) => (
              <div
                key={idea.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}10, ${themeColor}05)`,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.06)" : themeColor}30`,
                  boxShadow: backgroundColor === "light" ? "0 3px 12px rgba(0,0,0,.05)" : `0 4px 16px ${themeColor}1f`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: themeColor, lineHeight: 1.3 }}>
                  {idea.headline}
                </div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{idea.angle}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{idea.hook}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {idea.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 10,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: backgroundColor === "light" ? `${themeColor}12` : `${themeColor}22`,
                        color: backgroundColor === "light" ? "#333" : "white",
                        border: `1px solid ${backgroundColor === "light" ? `${themeColor}33` : `${themeColor}55`}`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* トレンド一覧（電子新聞風） */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: backgroundColor === "light"
              ? `linear-gradient(135deg, ${themeColor}03, ${themeColor}05)`
              : `linear-gradient(135deg, ${themeColor}12, ${themeColor}08)`,
            border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}35`,
            boxShadow: backgroundColor === "light" ? "0 6px 18px rgba(0,0,0,.06)" : `0 8px 24px ${themeColor}22`,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: themeColor }}>📈 今流行ってる動画一覧</div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>電子新聞スタイル</div>
          </div>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {trends.map((trend) => (
              <div
                key={trend.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}0f, ${themeColor}05)`,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.06)" : themeColor}30`,
                  boxShadow: backgroundColor === "light" ? "0 3px 12px rgba(0,0,0,.05)" : `0 4px 16px ${themeColor}1f`,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "start",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{trend.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>{trend.category} ・ {trend.time}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {trend.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 10,
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: backgroundColor === "light" ? `${themeColor}12` : `${themeColor}22`,
                          color: backgroundColor === "light" ? "#333" : "white",
                          border: `1px solid ${backgroundColor === "light" ? `${themeColor}33` : `${themeColor}55`}`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 64 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>{trend.views}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
