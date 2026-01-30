"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
  }, []);

  const handleRegister = () => {
    setError("");
    setLoading(true);

    if (!username || !email || !phoneNumber || !birthDate || !password || !confirmPassword) {
      setError("すべてのフィールドを入力してください");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上にしてください");
      setLoading(false);
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem("aiplus_users") || "[]");
      if (users.some((u: any) => u.email === email)) {
        setError("このメールアドレスは既に登録されています");
        setLoading(false);
        return;
      }

      const newUser = {
        id: "user-" + Date.now(),
        username,
        email,
        phoneNumber,
        birthDate,
        password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("aiplus_users", JSON.stringify(users));

      // --- ここから自動確認 ---
      const checkUsers = JSON.parse(localStorage.getItem("aiplus_users") || "[]");
      const found = checkUsers.find((u: any) => u.email === email && u.password === password);
      if (!found) {
        setError("登録後にデータが保存されていません。ブラウザの設定やストレージ容量を確認してください。");
        setLoading(false);
        return;
      }
      // --- ここまで自動確認 ---

      const sessionUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      };

      // 登録直後はセッションのみでログイン（端末自動ログインは未設定）
      sessionStorage.setItem("currentUser", JSON.stringify(sessionUser));
      localStorage.removeItem("currentUser");
      localStorage.removeItem("autoLoginUserId");

      setLoading(false);
      router.push("/tabs/feed");
    } catch (err) {
      setError("新規登録に失敗しました");
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
          <div
            style={{
              fontSize: 32,
              fontWeight: "bold",
              marginBottom: 12,
              background: "linear-gradient(90deg, #64b5f6 0%, #1976d2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: 2,
              userSelect: "none",
            }}
          >
            AI+
          </div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>
            新規登録
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名"
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
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="電話番号"
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
              background: backgroundColor === "light" ? "#f5f5f5" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              color: backgroundColor === "light" ? "#333" : "white",
              fontSize: 14,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
              生年月日
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                background: backgroundColor === "light" ? "#f5f5f5" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                color: backgroundColor === "light" ? "#333" : "white",
                fontSize: 14,
              }}
              placeholder="生年月日"
            />
          </div>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード（6文字以上）"
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="パスワード確認"
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
              background: backgroundColor === "light" ? "#f5f5f5" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
              color: backgroundColor === "light" ? "#333" : "white",
              fontSize: 14,
            }}
          />

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
            onClick={handleRegister}
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
            {loading ? "登録中..." : "新規登録"}
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, opacity: 0.7 }}>
          既にアカウントをお持ちの場合は{" "}
          <button
            onClick={() => router.push("/login")}
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
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
}

