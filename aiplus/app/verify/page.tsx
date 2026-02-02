"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const uid = searchParams.get("userId");
    if (uid) setUserId(uid);
    const token = searchParams.get("token");
    if (token) setEmailToken(token);
  }, [searchParams]);

  const handleVerifyEmail = async () => {
    setError("");
    setMessage("");
    if (!emailToken) {
      setError("メール認証トークンを入力してください");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: emailToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "メール認証に失敗しました");
    } else {
      setMessage("メール認証が完了しました");
    }
    setLoading(false);
  };

  const handleVerifySms = async () => {
    setError("");
    setMessage("");
    if (!userId || !smsCode) {
      setError("ユーザーIDとSMSコードを入力してください");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/verify-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, code: smsCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "SMS認証に失敗しました");
    } else {
      setMessage("SMS認証が完了しました。ログインしてください");
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
      <div style={{ width: "min(420px, 92vw)", display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>本人確認</h1>
        <p style={{ fontSize: 12, opacity: 0.8 }}>
          メール認証リンクとSMSコードの両方が完了するとアカウントが有効化されます。
        </p>

        {error && (
          <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,0,0,.12)", border: "1px solid rgba(255,0,0,.3)" }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ padding: 12, borderRadius: 8, background: "rgba(0,180,120,.12)", border: "1px solid rgba(0,180,120,.3)" }}>
            {message}
          </div>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ fontSize: 12 }}>メール認証トークン</label>
          <input
            value={emailToken}
            onChange={(e) => setEmailToken(e.target.value)}
            placeholder="メールの認証リンクに含まれるトークン"
            style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(20,0,40,.6)", color: "white" }}
          />
          <button
            onClick={handleVerifyEmail}
            disabled={loading}
            style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "#2b7ba8", color: "white" }}
          >
            メール認証
          </button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ fontSize: 12 }}>ユーザーID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="登録したユーザーID"
            style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(20,0,40,.6)", color: "white" }}
          />
          <label style={{ fontSize: 12 }}>SMSコード</label>
          <input
            value={smsCode}
            onChange={(e) => setSmsCode(e.target.value)}
            placeholder="SMSに届いた6桁コード"
            style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(20,0,40,.6)", color: "white" }}
          />
          <button
            onClick={handleVerifySms}
            disabled={loading}
            style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "#00c2ff", color: "white" }}
          >
            SMS認証
          </button>
        </div>

        <button
          onClick={() => router.push("/login")}
          style={{ padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "transparent", color: "white" }}
        >
          ログインへ
        </button>
      </div>
    </div>
  );
}
