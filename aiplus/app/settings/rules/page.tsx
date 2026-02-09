"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RulesPage() {
  const router = useRouter();
  const [themeColor, setThemeColor] = useState<string>("#2b7ba8");
  const [backgroundColor, setBackgroundColor] = useState<"light">("light");

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      const themeMap: Record<string, string> = {
        pink: "#2b7ba8",
        blue: "#2b7ba8",
        green: "#2b7ba8",
        purple: "#2b7ba8",
      };
      setThemeColor(themeMap[parsed.themeColor] || "#2b7ba8");
      setBackgroundColor(parsed.backgroundColor || "light");
    }
  }, []);

  const rules = [
    {
      title: "禁止行為",
      emoji: "🚫",
      items: [
        "他のユーザーへの誹謗中傷、嫌がらせ",
        "わいせつな内容、暴力的な表現",
        "著作権や商標権を侵害するコンテンツ",
        "虚偽の情報、詐欺行為",
        "スパム行為、過度な宣伝",
        "個人情報の無断公開",
        "アカウントの不正利用、なりすまし",
      ],
    },
    {
      title: "推奨事項",
      emoji: "✅",
      items: [
        "他のユーザーへの敬意と配慮",
        "オリジナルコンテンツの投稿",
        "建設的なフィードバックの提供",
        "コミュニティガイドラインの遵守",
        "適切なハッシュタグの使用",
      ],
    },
    {
      title: "投稿ガイドライン",
      emoji: "📝",
      items: [
        "動画の長さは15秒～3分推奨",
        "タイトルは簡潔で分かりやすく",
        "適切なカテゴリーとタグを設定",
        "著作権フリーのBGMを使用",
        "サムネイルは視覚的に魅力的に",
      ],
    },
    {
      title: "違反時の対応",
      emoji: "⚠️",
      items: [
        "軽度の違反: 警告または投稿削除",
        "重度の違反: アカウント停止",
        "繰り返しの違反: アカウント削除",
        "法的問題: 関係機関への通報",
      ],
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#f8f8f8",
        color: "#333",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,0,0,.1)",
          background: "#ffffff",
          backdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 2px 16px rgba(0,0,0,.08)",
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
            fontSize: 20,
            padding: 4,
          }}
        >
          ←
        </button>
        <div style={{ fontSize: 16, fontWeight: "700", color: themeColor, letterSpacing: "0.02em" }}>
          📋 AI＋PLATFORM 利用規約
        </div>
        <div style={{ width: 28 }} />
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, overflow: "auto", padding: 16, paddingBottom: 100 }}>
        {/* イントロ */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)`,
            border: `1px solid ${themeColor}44`,
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: themeColor }}>
            🌟 コミュニティルール
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.9 }}>
            すべてのユーザーが安心して楽しく利用できるよう、以下のルールを守ってご利用ください。
          </div>
        </div>


        {/* ルールセクション */}
        {rules.map((section, index) => (
          <div key={index} style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: themeColor,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>{section.emoji}</span>
              <span>{section.title}</span>
            </div>
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,.08)",
              }}
            >
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: itemIndex === section.items.length - 1 ? 0 : 12,
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: themeColor, flexShrink: 0 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* フッター */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: "rgba(0,0,0,.03)",
            fontSize: 12,
            opacity: 0.8,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>📌 最終更新: 2026年1月27日</div>
          <div>ルールは予告なく変更される場合があります</div>
        </div>
      </div>
    </div>
  );
}

