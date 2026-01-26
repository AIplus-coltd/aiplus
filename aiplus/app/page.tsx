"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // テスト用：フィードへリダイレクト
    router.replace("/tabs/feed");
  }, [router]);

  return <div style={{ padding: 20, minHeight: "100vh", background: "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)", color: "#FF99FF", display: "grid", placeItems: "center" }}>Redirecting...</div>;
}