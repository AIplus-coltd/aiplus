"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // テスト用：認証をスキップしてフィードへ直接リダイレクト
    router.replace("/feed");
  }, [router]);

  const signInAnon = async () => {
    setLoading(true);
    setMsg("");

    // 10秒でタイムアウト表示
    const timer = setTimeout(() => {
      setMsg(
        "ログインが返ってきません（通信/ENVの可能性）。下のチェックを実行してください。"
      );
      setLoading(false);
    }, 10000);

    try {
      console.log("🔍 ログイン開始:", supabase);
      const { data, error } = await supabase.auth.signInAnonymously();
      clearTimeout(timer);

      console.log("📤 レスポンス:", { data, error });

      if (error) {
        console.error("❌ エラー:", error);
        setMsg("ログイン失敗: " + error.message);
        setLoading(false);
        return;
      }

      // セッション確認（ここで null ならENVが怪しい）
      const session = (await supabase.auth.getSession()).data.session;
      console.log("✅ セッション:", session);
      
      if (!session) {
        setMsg("ログイン後も session が空です（ENV/プロジェクト不一致の可能性）。");
        setLoading(false);
        return;
      }

      router.replace("/feed");
      router.refresh();
    } catch (e: any) {
      clearTimeout(timer);
      console.error("💥 例外:", e);
      setMsg("例外: " + (e?.message ?? String(e)));
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)", color: "white" }}>
      <div style={{ width: "min(480px, 92vw)", textAlign: "center", fontFamily: "sans-serif" }}>
        <h1 style={{ margin: 0, fontSize: 28, color: "#FF99FF", textShadow: "0 0 20px rgba(200,100,255,.5)" }}>AI＋</h1>
        <p style={{ opacity: 0.8, fontSize: 13, color: "rgba(255,200,255,.8)" }}>まずは匿名で開始（登録なし）→ フィードへ</p>

        <button
          onClick={signInAnon}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(200,100,255,.5)",
            background: "linear-gradient(135deg, rgba(150,50,255,.75), rgba(200,100,255,.65))",
            color: "#FFB0FF",
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
            boxShadow: "0 0 24px rgba(200,100,255,.5), inset 0 1px 0 rgba(255,200,255,.15)",
          }}
        >
          {loading ? "ログイン中..." : "匿名で開始"}
        </button>

        {msg && (
          <div style={{ marginTop: 12, color: "#FF6B9D", fontSize: 12, lineHeight: 1.4 }}>
            {msg}
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75, color: "rgba(255,200,255,.7)" }}>
          Supabase → Authentication → Providers で Anonymous を有効化
        </div>
      </div>
    </div>
  );
}