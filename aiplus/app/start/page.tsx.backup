"use client";
import { useState } from "react";

export default function StartPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [genre, setGenre] = useState("ビジネス");

  const canSubmit = name.trim() !== "" && username.trim() !== "";

  const onSubmit = () => {
    localStorage.setItem("profile", JSON.stringify({ name, username, genre }));
    window.location.href = "/feed";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "sans-serif",
        padding: 24,
        background: "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
        color: "white",
      }}
    >
      <div style={{ width: "min(520px, 92vw)", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.2rem", margin: 0, color: "#FF99FF", textShadow: "0 0 20px rgba(200,100,255,.5)" }}>スタート</h1>
        <p style={{ opacity: 0.75, marginTop: 10, color: "rgba(255,200,255,.8)" }}>
          プロフィールを作成して、動画を見始める準備をします。
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="表示名（例：せいや）"
            style={{ 
              padding: "12px 14px", 
              borderRadius: 10, 
              border: "1px solid rgba(200,100,255,.3)", 
              fontSize: 16,
              background: "linear-gradient(135deg, rgba(40,10,70,.7), rgba(50,15,85,.65))",
              backdropFilter: "blur(8px)",
              color: "rgba(255,240,255,.95)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,.4)",
            }}
          />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名（例：seiya_nfg）"
            style={{ 
              padding: "12px 14px", 
              borderRadius: 10, 
              border: "1px solid rgba(200,100,255,.3)", 
              fontSize: 16,
              background: "linear-gradient(135deg, rgba(40,10,70,.7), rgba(50,15,85,.65))",
              backdropFilter: "blur(8px)",
              color: "rgba(255,240,255,.95)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,.4)",
            }}
          />
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            style={{ 
              padding: "12px 14px", 
              borderRadius: 10, 
              border: "1px solid rgba(200,100,255,.3)", 
              fontSize: 16,
              background: "linear-gradient(135deg, rgba(40,10,70,.7), rgba(50,15,85,.65))",
              backdropFilter: "blur(8px)",
              color: "rgba(255,240,255,.95)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,.4)",
            }}
          >
            <option>ビジネス</option>
            <option>エンタメ</option>
            <option>教育</option>
            <option>ニュース</option>
            <option>スポーツ</option>
            <option>音楽</option>
          </select>

          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              marginTop: 8,
              padding: "12px 18px",
              borderRadius: 999,
              border: "1px solid rgba(200,100,255,.5)",
              background: canSubmit ? "linear-gradient(135deg, rgba(150,50,255,.75), rgba(200,100,255,.65))" : "linear-gradient(135deg, rgba(100,40,150,.4), rgba(130,60,180,.3))",
              color: canSubmit ? "#FFB0FF" : "rgba(255,200,255,.5)",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.5,
              boxShadow: canSubmit ? "0 0 24px rgba(200,100,255,.5), inset 0 1px 0 rgba(255,200,255,.15)" : "none",
            }}
          >
            保存して続ける
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "12px 18px",
              borderRadius: 999,
              border: "1px solid rgba(200,100,255,.4)",
              background: "rgba(40,10,70,.5)",
              color: "rgba(255,200,255,.9)",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}