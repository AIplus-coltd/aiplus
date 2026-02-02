"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClearDataPage() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  const handleClear = async () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear cookies by calling logout
    await fetch("/api/auth/logout", { method: "POST" });
    
    setCleared(true);
    
    setTimeout(() => {
      router.push("/login");
    }, 1500);
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
      <div style={{ width: "min(400px, 92vw)", textAlign: "center" }}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>データクリア</h1>
        
        {!cleared ? (
          <>
            <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 24 }}>
              ブラウザの認証情報（localStorage + Cookie）をすべて削除します
            </p>
            <button
              onClick={handleClear}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "1px solid rgba(255,0,0,.5)",
                background: "rgba(255,0,0,.2)",
                color: "white",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              すべてクリア
            </button>
          </>
        ) : (
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: "rgba(0,180,120,.12)",
              border: "1px solid rgba(0,180,120,.3)",
            }}
          >
            ✅ クリア完了。ログインページへ移動します...
          </div>
        )}
      </div>
    </div>
  );
}
