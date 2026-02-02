"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetIdPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setError("");
    if (!userId || !username) {
      setError("ユーザーIDとユーザー名は必須です");
      return;
    }
    // ID重複チェック
    const users = JSON.parse(localStorage.getItem("aiplus_users") || "[]");
    if (users.some((u: any) => u.id === userId)) {
      setError("このIDは既に使われています");
      return;
    }
    // 保存
    const newUser = { id: userId, username, bio };
    localStorage.setItem("userProfile_" + userId, JSON.stringify(newUser));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    localStorage.setItem("aiplus_users", JSON.stringify([...users, newUser]));
    setSuccess(true);
    setTimeout(() => {
      router.push("/tabs/me/view");
    }, 1200);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 16, boxShadow: "0 8px 32px #9d4edd22" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#9d4edd", marginBottom: 18 }}>ユーザーID新規作成・編集</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>ユーザーID（半角英数字）</label>
        <input
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
          placeholder="例: aiuser123"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #9d4edd", marginTop: 4, fontSize: 15 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>ユーザー名</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="表示名"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #9d4edd", marginTop: 4, fontSize: 15 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>自己紹介（任意）</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="ひとこと自己紹介"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #9d4edd", marginTop: 4, fontSize: 15, minHeight: 60 }}
        />
      </div>
      {error && <div style={{ color: "#ff6b6b", marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: "#66bb6a", marginBottom: 12 }}>保存しました！</div>}
      <button
        onClick={handleSave}
        style={{ width: "100%", padding: 12, borderRadius: 10, background: "linear-gradient(135deg, #9d4edd, #38BDF8)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 12px #9d4edd22" }}
      >
        保存
      </button>
    </div>
  );
}
