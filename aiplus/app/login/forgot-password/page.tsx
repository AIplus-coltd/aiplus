"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [themeColor, setThemeColor] = useState<string>("#2b7ba8");

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
    }
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setResetToken(token);
      setStep("reset");
    }
  }, [searchParams]);

  const handleVerify = async () => {
    setError("");
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "送信に失敗しました");
        setLoading(false);
        return;
      }
      setStep("reset");
    } catch {
      setError("送信に失敗しました");
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setError("");
    if (!resetToken || !smsCode || !newPassword || !confirmPassword) {
      setError("新しいパスワードを入力してください");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError("パスワードは8文字以上で英大文字・小文字・数字を含めてください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, smsCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "再設定に失敗しました");
        setLoading(false);
        return;
      }
      setTimeout(() => {
        alert("パスワードを再設定しました");
        router.push("/login");
      }, 300);
    } catch {
      setError("再設定に失敗しました");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
        color: "white",
      }}
    >
      <div style={{ width: "min(400px, 92vw)", fontFamily: "sans-serif" }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            color: themeColor,
            cursor: "pointer",
            fontSize: 20,
            marginBottom: 16,
          }}
        >
          ←
        </button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 28, color: themeColor, textShadow: `0 0 20px ${themeColor}88` }}>
            パスワード再設定
          </h1>
          <p style={{ opacity: 0.8, fontSize: 13, marginTop: 8 }}>
            {step === "verify" ? "本人確認" : "新しいパスワードを設定"}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: "rgba(255,0,0,.1)",
              border: "1px solid rgba(255,0,0,.3)",
              color: "#ff6b6b",
              fontSize: 13,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {step === "verify" ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${themeColor}33`,
                  background: "rgba(26,10,40,.6)",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 10,
                border: `1px solid ${themeColor}80`,
                background: `linear-gradient(135deg, ${themeColor}b3, ${themeColor}80)`,
                color: "#ffffff",
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 700,
                boxShadow: `0 0 24px ${themeColor}44`,
              }}
            >
              {loading ? "送信中..." : "再設定リンク送信"}
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                再設定リンクのトークン
              </label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="メールに記載されたトークン"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${themeColor}33`,
                  background: "rgba(26,10,40,.6)",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                SMSコード
              </label>
              <input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                placeholder="SMSで届いた6桁コード"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${themeColor}33`,
                  background: "rgba(26,10,40,.6)",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                新しいパスワード
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8文字以上・英大文字/小文字/数字"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${themeColor}33`,
                  background: "rgba(26,10,40,.6)",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
                パスワード確認
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="確認用パスワード"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${themeColor}33`,
                  background: "rgba(26,10,40,.6)",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 10,
                border: `1px solid ${themeColor}80`,
                background: `linear-gradient(135deg, ${themeColor}b3, ${themeColor}80)`,
                color: "#ffffff",
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 700,
                boxShadow: `0 0 24px ${themeColor}44`,
              }}
            >
              {loading ? "設定中..." : "パスワードを再設定"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

