"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
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

  const privacySections = [
    {
      title: "収集する情報",
      emoji: "📊",
      content: [
        {
          subtitle: "アカウント情報",
          items: [
            "ユーザー名、メールアドレス",
            "プロフィール写真、自己紹介",
            "アカウント設定情報",
          ],
        },
        {
          subtitle: "利用情報",
          items: [
            "投稿した動画、画像、テキスト",
            "コメント、いいね、保存などのアクション",
            "アプリの利用履歴",
          ],
        },
        {
          subtitle: "デバイス情報",
          items: [
            "デバイスの種類、OS バージョン",
            "IPアドレス、ブラウザ情報",
            "位置情報（許可された場合のみ）",
          ],
        },
      ],
    },
    {
      title: "情報の利用目的",
      emoji: "🎯",
      content: [
        {
          subtitle: "サービス提供",
          items: [
            "アカウントの作成と管理",
            "コンテンツの配信と表示",
            "ユーザー間のコミュニケーション機能",
          ],
        },
        {
          subtitle: "サービス改善",
          items: [
            "ユーザー体験の最適化",
            "新機能の開発と改善",
            "バグの修正と問題解決",
          ],
        },
        {
          subtitle: "安全性の確保",
          items: [
            "不正利用の防止",
            "セキュリティの維持",
            "利用規約違反の検知",
          ],
        },
      ],
    },
    {
      title: "情報の保護",
      emoji: "🔒",
      content: [
        {
          subtitle: "セキュリティ対策",
          items: [
            "データの暗号化通信（SSL/TLS）",
            "アクセス制御と認証システム",
            "定期的なセキュリティ監査",
          ],
        },
        {
          subtitle: "データ管理",
          items: [
            "適切なバックアップ体制",
            "不要データの定期削除",
            "アクセスログの記録と監視",
          ],
        },
      ],
    },
    {
      title: "第三者への提供",
      emoji: "🤝",
      content: [
        {
          subtitle: "原則として提供しません",
          items: [
            "ユーザーの同意がある場合",
            "法令に基づく開示要請がある場合",
            "サービス運営に必要な範囲での委託先への提供",
          ],
        },
      ],
    },
    {
      title: "ユーザーの権利",
      emoji: "👤",
      content: [
        {
          subtitle: "あなたの権利",
          items: [
            "個人情報の開示請求",
            "情報の訂正・削除要求",
            "アカウントの削除権",
            "データポータビリティの権利",
          ],
        },
      ],
    },
    {
      title: "Cookie の使用",
      emoji: "🍪",
      content: [
        {
          subtitle: "使用目的",
          items: [
            "ログイン状態の維持",
            "ユーザー設定の保存",
            "利用状況の分析",
            "広告の最適化",
          ],
        },
      ],
    },
    {
      title: "未成年者の保護",
      emoji: "👶",
      content: [
        {
          subtitle: "13歳未満の利用",
          items: [
            "13歳未満の方は利用できません",
            "保護者の同意が必要な場合があります",
            "未成年者の個人情報は特に慎重に扱います",
          ],
        },
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
          🛡️ プライバシーポリシー
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
            🛡️ あなたのプライバシーを守ります
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.9 }}>
            当サービスは、ユーザーの個人情報を適切に取り扱い、プライバシーを尊重します。以下のポリシーをよくお読みください。
          </div>
        </div>

        {/* プライバシーセクション */}
        {privacySections.map((section, index) => (
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
              {section.content.map((subsection, subIndex) => (
                <div key={subIndex} style={{ marginBottom: subIndex === section.content.length - 1 ? 0 : 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, opacity: 0.9 }}>
                    {subsection.subtitle}
                  </div>
                  {subsection.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: itemIndex === subsection.items.length - 1 ? 0 : 8,
                        fontSize: 12,
                        lineHeight: 1.6,
                        opacity: 0.85,
                      }}
                    >
                      <span style={{ color: themeColor, flexShrink: 0 }}>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* お問ぁE��わせ */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: backgroundColor === "light" 
              ? `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)`
              : `linear-gradient(135deg, ${themeColor}22, ${themeColor}11)`,
            border: `1px solid ${themeColor}44`,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: themeColor }}>
            📧 お問い合わせ
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.9, marginBottom: 12 }}>
            プライバシーに関するご質問やご要望は、お問い合わせページからご連絡ください。
          </div>
          <button
            onClick={() => router.push("/settings/contact")}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${themeColor}`,
              background: `${themeColor}22`,
              color: themeColor,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            お問い合わせページへ →
          </button>
        </div>

        {/* フッター */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: backgroundColor === "light" ? "rgba(0,0,0,.03)" : "rgba(26,10,40,.6)",
            fontSize: 12,
            opacity: 0.8,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>📌 最終更新: 2026年1月27日</div>
          <div>このポリシーは予告なく変更される場合があります</div>
        </div>
      </div>
    </div>
  );
}

