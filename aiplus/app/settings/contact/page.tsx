"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  const [themeColor, setThemeColor] = useState<string>("#2b7ba8");
  const [backgroundColor, setBackgroundColor] = useState<"light">("light");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<"bug" | "feature" | "other">("other");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = () => {
    if (!name || !email || !message) {
      alert("すべての項目を入力してください");
      return;
    }

    setIsSubmitting(true);
    // 実際の送信処理をシミュレート
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // フォームをリセット
      setName("");
      setEmail("");
      setCategory("other");
      setMessage("");
      
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }, 1000);
  };

  const categories = [
    { value: "bug" as const, label: "バグ報告", emoji: "🐛" },
    { value: "feature" as const, label: "機能要望", emoji: "💡" },
    { value: "other" as const, label: "その他", emoji: "💬" },
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
          📧 問い合わせ
        </div>
        <div style={{ width: 28 }} />
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, overflow: "auto", padding: 16, paddingBottom: 100 }}>
        {isSubmitted && (
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: `${themeColor}22`,
              border: `1px solid ${themeColor}44`,
              marginBottom: 16,
              textAlign: "center",
              color: themeColor,
              fontWeight: 600,
            }}
          >
            ✓ お問い合わせを送信しました
          </div>
        )}

        {/* 名前 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block" }}>
            お名前 <span style={{ color: themeColor }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田太郎"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: backgroundColor === "light" 
                ? "1px solid rgba(0,0,0,.1)" 
                : `1px solid ${themeColor}33`,
              background: backgroundColor === "light" ? "#ffffff" : "rgba(26,10,40,.6)",
              color: backgroundColor === "light" ? "#333" : "white",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* メールアドレス */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block" }}>
            メールアドレス <span style={{ color: themeColor }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: backgroundColor === "light" 
                ? "1px solid rgba(0,0,0,.1)" 
                : `1px solid ${themeColor}33`,
              background: backgroundColor === "light" ? "#ffffff" : "rgba(26,10,40,.6)",
              color: backgroundColor === "light" ? "#333" : "white",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* カテゴリー */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block" }}>
            お問い合わせ種別
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  border: category === cat.value 
                    ? `2px solid ${themeColor}` 
                    : "1px solid rgba(0,0,0,.1)",
                  background: category === cat.value
                    ? `${themeColor}22`
                    : "#ffffff",
                  color: "#333",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* メッセージ */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: "block" }}>
            お問い合わせ内容 <span style={{ color: themeColor }}>*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="お問い合わせ内容をご記入ください"
            rows={8}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,.1)",
              background: "#ffffff",
              color: "#333",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* 注意事項 */}
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: "rgba(0,0,0,.03)",
            fontSize: 12,
            opacity: 0.8,
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>📝 ご注意</div>
          <div>• 回答には3～5営業日ほどお時間をいただく場合がございます</div>
          <div>• 内容によってはお答えできない場合もございます</div>
        </div>
      </div>

      {/* 送信ボタン */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          maxWidth: 430,
          margin: "0 auto",
          zIndex: 40,
          background: "linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.96) 100%)",
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !name || !email || !message}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: `1px solid ${themeColor}80`,
            background: `linear-gradient(135deg, ${themeColor}b3, ${themeColor}80)`,
            color: "#ffffff",
            cursor: isSubmitting || !name || !email || !message ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: 14,
            boxShadow: `0 0 16px ${themeColor}44`,
            transition: "all 0.3s ease",
            opacity: isSubmitting || !name || !email || !message ? 0.5 : 1,
          }}
        >
          {isSubmitting ? "送信中..." : "送信"}
        </button>
      </div>
    </div>
  );
}

