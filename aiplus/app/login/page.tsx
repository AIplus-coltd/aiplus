"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotHint, setShowForgotHint] = useState(false);

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

    const autoLoginUserId = localStorage.getItem("autoLoginUserId");
    if (autoLoginUserId) {
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    setError("");
    setShowForgotHint(false);
    setLoading(true);

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      setLoading(false);
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem("aiplus_users") || "[]");
      const user = users.find((u: any) => u.email === email && u.password === password);
      const emailExists = users.some((u: any) => u.email === email);

      if (!user) {
        if (emailExists) {
          setError("このメールアドレスは既に登録されています");
          setShowForgotHint(true);
        } else {
          setError("メールアドレスまたはパスワードが正しくありません");
        }
        setLoading(false);
        return;
      }

      const sessionUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      // セッションに保存
      sessionStorage.setItem("currentUser", JSON.stringify(sessionUser));

      // 自動ログインを有効にする場合のみ端末に保存
      if (rememberMe) {
        localStorage.setItem("currentUser", JSON.stringify(sessionUser));
        localStorage.setItem("autoLoginUserId", user.id);
      } else {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("autoLoginUserId");
      }

      setLoading(false);
      router.push("/tabs/feed");
    } catch (err) {
      setError("ログインに失敗しました");
      setLoading(false);
    }
  };

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
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 375, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
          <div style={{ 
            fontSize: 48, 
            fontWeight: "bold", 
            marginBottom: 8,
            background: "linear-gradient(135deg, #00D4FF 0%, #0052FF 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}>
            AI＋
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
              background: backgroundColor === "light" ? "#f5f5f5" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              color: backgroundColor === "light" ? "#333" : "white",
              fontSize: 14,
            }}
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
              background: backgroundColor === "light" ? "#f5f5f5" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              color: backgroundColor === "light" ? "#333" : "white",
              fontSize: 14,
            }}
          />

          {showForgotHint && (
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              パスワードをお忘れの方は{" "}
              <button
                onClick={() => router.push("/login/forgot-password")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: themeColor,
                  cursor: "pointer",
                  fontWeight: 700,
                  textDecoration: "underline",
                  fontSize: 12,
                  padding: 0,
                }}
              >
                こちら
              </button>
            </div>
          )}

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              opacity: 0.8,
              color: backgroundColor === "light" ? "#555" : "white",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                accentColor: themeColor,
              }}
            />
            この端末で自動ログイン
          </label>

          {error && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                border: `1px solid rgba(255,100,150,.4)`,
                background: "rgba(255,120,180,.12)",
                color: "rgba(255,210,230,.9)",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${themeColor}80`,
              background: `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 700,
              boxShadow: `0 0 12px ${themeColor}66`,
            }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, opacity: 0.7 }}>
          アカウントをお持ちでない場合は{" "}
          <button
            onClick={() => router.push("/register")}
            style={{
              background: "transparent",
              border: "none",
              color: themeColor,
              cursor: "pointer",
              fontWeight: 700,
              textDecoration: "underline",
              fontSize: 12,
            }}
          >
            新規登録
          </button>
        </div>
      </div>
    </div>
  );
}