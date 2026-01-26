"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
};

function getDefaultProducts(): Product[] {
  return [
    { id: "p1", name: "ワイヤレスイヤホン", price: 8900, image: "#667eea, #764ba2", description: "高音質ワイヤレスイヤホン。ノイズキャンセリング機能付き。", category: "電子機器" },
    { id: "p2", name: "スマートウォッチ", price: 15800, image: "#f093fb, #f5576c", description: "健康管理に最適なスマートウォッチ。防水機能付き。", category: "電子機器" },
    { id: "p3", name: "カメラ三脚", price: 4500, image: "#4facfe, #00f2fe", description: "軽量で持ち運びやすい三脚。スマホカメラ対応。", category: "アクセサリ" },
    { id: "p4", name: "リングライト", price: 3200, image: "#43e97b, #38f9d7", description: "TikTok配信に最適なLEDリングライト。", category: "撮影機材" },
    { id: "p5", name: "スマホスタンド", price: 1980, image: "#fa709a, #fee140", description: "角度調整可能なスマホスタンド。動画撮影に便利。", category: "アクセサリ" },
    { id: "p6", name: "モバイルバッテリー", price: 5400, image: "#30cfd0, #330867", description: "大容量20000mAh。急速充電対応。", category: "電子機器" },
    { id: "p7", name: "自撮り棒", price: 2800, image: "#a8edea, #fed6e3", description: "Bluetooth対応自撮り棒。三脚機能付き。", category: "アクセサリ" },
    { id: "p8", name: "ミニLEDライト", price: 2500, image: "#f83600, #fe8c00", description: "持ち運びに便利なLEDライト。USB充電式。", category: "撮影機材" },
  ];
}

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const loadSettings = () => {
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
    };

    const loadProducts = () => {
      const productsData = localStorage.getItem("shopProducts");
      const productList = productsData ? JSON.parse(productsData) : getDefaultProducts();
      if (!productsData) {
        localStorage.setItem("shopProducts", JSON.stringify(productList));
      }
      setProducts(productList);

      const cartData = localStorage.getItem("cart");
      const cart = cartData ? JSON.parse(cartData) : [];
      setCartCount(cart.length);
    };

    loadSettings();
    loadProducts();

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const color = customEvent.detail.themeColor || "pink";
        const bgColor = customEvent.detail.backgroundColor || "dark";
        const themeMap: Record<string, string> = {
          pink: "#ff1493",
          blue: "#64b5f6",
          green: "#81c784",
          purple: "#9d4edd",
        };
        setThemeColor(themeMap[color] || "#ff1493");
        setBackgroundColor(bgColor);
      }
    };

    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

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
          boxShadow: backgroundColor === "light" ? "0 2px 16px rgba(0,0,0,.08)" : `0 2px 16px ${themeColor}33`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: "bold", color: themeColor, letterSpacing: "0.02em" }}>Shop</div>
        <button
          onClick={() => router.push("/cart")}
          style={{
            position: "relative",
            padding: "6px 12px",
            borderRadius: 20,
            border: "none",
            background: `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)`,
            color: "#ffffff",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: "600",
            boxShadow: `0 0 16px ${themeColor}33`,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2l2 12h10l2-8H7" />
            <circle cx="9" cy="20" r="2" />
            <circle cx="17" cy="20" r="2" />
          </svg>
          {cartCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: "bold",
                color: "white",
                boxShadow: `0 0 12px ${themeColor}66`,
              }}
            >
              {cartCount}
            </div>
          )}
        </button>
      </div>

      {/* 商品グリッド */}
      <div style={{ padding: 16 }}>
        {/* AI Marketplace セクション */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: themeColor,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            AI Marketplace
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        {/* Trending Products */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: themeColor,
              marginBottom: 12,
            }}
          >
            Trending Products
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {products.slice(0, 4).map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/shop/${product.id}`)}
                style={{
                  border: backgroundColor === "light" ? `1px solid ${themeColor}26` : `1px solid ${themeColor}33`,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: backgroundColor === "light"
                    ? `linear-gradient(135deg, #ffffff, ${themeColor}12)`
                    : `linear-gradient(135deg, ${themeColor}26, ${themeColor}1a)`,
                  backdropFilter: "blur(12px)",
                  cursor: "pointer",
                  transition: "transform 0.2s, boxShadow 0.3s",
                  boxShadow: backgroundColor === "light" ? "0 6px 18px rgba(0,0,0,.08)" : `0 2px 16px ${themeColor}33`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = backgroundColor === "light"
                    ? "0 0 24px rgba(0,0,0,.08), 0 4px 20px rgba(0,0,0,.06)"
                    : `0 0 24px ${themeColor}44, 0 4px 20px rgba(10,0,20,.6)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = backgroundColor === "light" ? "0 6px 18px rgba(0,0,0,.08)" : `0 2px 16px ${themeColor}33`;
                }}
              >
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "100%",
                    background: `linear-gradient(135deg, ${product.image})`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: `${themeColor}cc`,
                      backdropFilter: "blur(4px)",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 9,
                      fontWeight: "600",
                      border: `1px solid ${themeColor}99`,
                      color: "#fff",
                    }}
                  >
                    {product.category}
                  </div>
                </div>

                <div style={{ padding: 12 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      marginBottom: 6,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: backgroundColor === "light" ? "#333" : "#e0cffc",
                    }}
                  >
                    {product.name}
                  </div>
                  <div style={{ fontSize: 15, color: themeColor, fontWeight: "700" }}>
                    ¥{product.price.toLocaleString()}
                  </div>
                  <button
                    style={{
                      marginTop: 8,
                      width: "100%",
                      padding: "6px",
                      borderRadius: 8,
                      border: "none",
                      background: `linear-gradient(135deg, ${themeColor}80, ${themeColor}66)`,
                      color: "#ffffff",
                      fontSize: 11,
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: `0 0 12px ${themeColor}44`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* その他の商品 */}
        {products.length > 4 && (
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: themeColor,
                marginBottom: 12,
              }}
            >
              More Products
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              {products.slice(4).map((product) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/shop/${product.id}`)}
                  style={{
                    border: backgroundColor === "light" ? `1px solid ${themeColor}26` : `1px solid ${themeColor}33`,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: backgroundColor === "light"
                      ? `linear-gradient(135deg, #ffffff, ${themeColor}12)`
                      : `linear-gradient(135deg, ${themeColor}26, ${themeColor}1a)`,
                    backdropFilter: "blur(12px)",
                    cursor: "pointer",
                    transition: "transform 0.2s, boxShadow 0.3s",
                    boxShadow: backgroundColor === "light" ? "0 6px 18px rgba(0,0,0,.08)" : `0 2px 16px ${themeColor}33`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow = backgroundColor === "light"
                      ? "0 0 24px rgba(0,0,0,.08), 0 4px 20px rgba(0,0,0,.06)"
                      : `0 0 24px ${themeColor}44, 0 4px 20px rgba(10,0,20,.6)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = backgroundColor === "light" ? "0 6px 18px rgba(0,0,0,.08)" : `0 2px 16px ${themeColor}33`;
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      paddingBottom: "100%",
                      background: `linear-gradient(135deg, ${product.image})`,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: `${themeColor}cc`,
                        backdropFilter: "blur(4px)",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 9,
                        fontWeight: "600",
                        border: `1px solid ${themeColor}99`,
                        color: "#fff",
                      }}
                    >
                      {product.category}
                    </div>
                  </div>

                  <div style={{ padding: 12 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        marginBottom: 6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: backgroundColor === "light" ? "#333" : "#e0cffc",
                      }}
                    >
                      {product.name}
                    </div>
                    <div style={{ fontSize: 15, color: themeColor, fontWeight: "700" }}>
                      ¥{product.price.toLocaleString()}
                    </div>
                    <button
                      style={{
                        marginTop: 8,
                        width: "100%",
                        padding: "6px",
                        borderRadius: 8,
                        border: "none",
                        background: `linear-gradient(135deg, ${themeColor}80, ${themeColor}66)`,
                        color: "#ffffff",
                        fontSize: 11,
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: `0 0 12px ${themeColor}44`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
