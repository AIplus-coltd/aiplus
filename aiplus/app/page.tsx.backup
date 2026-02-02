"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // ログイン状態を確認
    const sessionUser = sessionStorage.getItem("currentUser");

    if (sessionUser) {
      // セッションログイン済みの場合はフィードへ
      router.replace("/tabs/feed");
      return;
    }

    const currentUser = localStorage.getItem("currentUser");
    const autoLoginUserId = localStorage.getItem("autoLoginUserId");

    if (currentUser && autoLoginUserId) {
      try {
        const parsed = JSON.parse(currentUser);
        if (parsed?.id === autoLoginUserId) {
          // 自動ログインが有効な場合のみフィードへ
          router.replace("/tabs/feed");
          return;
        }
      } catch {
        // パース失敗時は無効化
      }
    }

    // 自動ログイン不可ならクリーンアップしてログインへ
    localStorage.removeItem("currentUser");
    localStorage.removeItem("autoLoginUserId");
    router.replace("/login");
  }, [router]);

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
        color: "#ff1493",
        display: "grid",
        placeItems: "center",
      }}
    >
      読み込み中...
    </div>
  );
}