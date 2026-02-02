"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SalesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mySales, setMySales] = useState<any[]>([]);
  const [themeColor, setThemeColor] = useState("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");

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

    // ユーザー情報を取得
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    // 売上データを取得
    const salesData = localStorage.getItem("sales");
    const userId = user ? JSON.parse(user).id : null;
    if (salesData && userId) {
      const sales = JSON.parse(salesData);
      const userSales = sales.filter((s: any) => s.sellerId === userId);
      setMySales(userSales);
      
      // 総売上を計算
      const total = userSales.reduce((sum: number, sale: any) => sum + (sale.amount || 0), 0);
      setTotalRevenue(total);
    }
  }, []);

  const filteredSales = filterStatus === "all" 
    ? mySales 
    : mySales.filter((s) => s.status === filterStatus);

  const sortedSales = [...filteredSales].reverse();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: backgroundColor === "light" ? "#f8f8f8" : "linear-gradient(135deg, #0a0014 0%, #0f0519 50%, #1a0a28 100%)",
        color: backgroundColor === "light" ? "#333" : "white",
        paddingBottom: 90,
        paddingTop: 60,
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: "12px 16px",
          borderBottom: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}26`}`,
          background: backgroundColor === "light"
            ? "linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(245,245,245,.96) 100%)"
            : `linear-gradient(180deg, rgba(26,10,40,.98) 0%, ${themeColor}12)`,
          backdropFilter: "blur(20px) saturate(180%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            color: themeColor,
            fontSize: 24,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ←
        </button>
        <div style={{ fontSize: 18, fontWeight: "bold", color: themeColor }}>売上詳細</div>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>
        {/* 売上統計 */}
        <div
          style={{
            background: backgroundColor === "light" ? "#fff" : "rgba(255,255,255,.05)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}20`}`,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>総売上</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: themeColor }}>
                ¥{totalRevenue.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>販売数</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: themeColor }}>
                {mySales.length}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}20`}` }}>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>平均販売額</div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>
              ¥{mySales.length > 0 ? Math.round(totalRevenue / mySales.length).toLocaleString() : "0"}
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
          <button
            onClick={() => setFilterStatus("all")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: filterStatus === "all" ? "none" : `1px solid ${themeColor}40`,
              background: filterStatus === "all" 
                ? `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`
                : "transparent",
              color: filterStatus === "all" ? "white" : themeColor,
              fontSize: 12,
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            すべて ({mySales.length})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: filterStatus === "completed" ? "none" : `1px solid ${themeColor}40`,
              background: filterStatus === "completed" 
                ? `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`
                : "transparent",
              color: filterStatus === "completed" ? "white" : themeColor,
              fontSize: 12,
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            完了 ({mySales.filter((s) => s.status === "completed").length})
          </button>
        </div>

        {/* 販売一覧 */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}>販売履歴</h2>

          {sortedSales.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                opacity: 0.6,
              }}
            >
              <div style={{ fontSize: 14 }}>販売履歴がありません</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sortedSales.map((sale) => (
                <div
                  key={sale.id}
                  style={{
                    padding: 16,
                    background: backgroundColor === "light" ? "#fff" : "rgba(255,255,255,.05)",
                    borderRadius: 12,
                    border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}20`}`,
                  }}
                >
                  {/* ヘッダー */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 4 }}>
                        {sale.buyerName}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>
                        {new Date(sale.createdAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: "bold", color: themeColor, marginBottom: 4 }}>
                        ¥{sale.amount.toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: `${themeColor}30`,
                          color: themeColor,
                          display: "inline-block",
                          fontWeight: "600",
                        }}
                      >
                        {sale.status === "completed" ? "✓ 完了" : "処理中"}
                      </div>
                    </div>
                  </div>

                  {/* 注文詳細 */}
                  <div
                    style={{
                      background: backgroundColor === "light" ? "rgba(0,0,0,.02)" : `${themeColor}10`,
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ opacity: 0.6 }}>注文ID:</span>
                      <span style={{ fontWeight: "600", fontFamily: "monospace", fontSize: 11 }}>
                        {sale.orderId}
                      </span>
                    </div>
                    <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ opacity: 0.6 }}>配送先:</span>
                      <span style={{ textAlign: "right", maxWidth: 200 }}>
                        {sale.buyerAddress || "指定なし"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ opacity: 0.6 }}>メール:</span>
                      <span style={{ textAlign: "right", maxWidth: 200, fontSize: 12 }}>
                        {sale.buyerEmail}
                      </span>
                    </div>
                  </div>

                  {/* 操作ボタン */}
                  <button
                    onClick={() => {
                      const subject = `ご注文ありがとうございます (${sale.orderId})`;
                      window.open(`mailto:${sale.buyerEmail}?subject=${encodeURIComponent(subject)}`);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${themeColor}40`,
                      background: "transparent",
                      color: themeColor,
                      fontSize: 12,
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    顧客にメール送信
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
