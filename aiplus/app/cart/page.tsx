"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  const removeItem = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      alert("決済ページへの遷移に失敗しました");
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      );
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: "center", opacity: 0.8 }}>
        <span style={{ display: "inline-block", marginBottom: 16 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id="emptyCartGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5aa9ff" />
                <stop offset="100%" stopColor="#2f7de6" />
              </linearGradient>
            </defs>
            <g fill="none" stroke="url(#emptyCartGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2 12h10l2-8H7" />
              <circle cx="9" cy="20" r="2" />
              <circle cx="17" cy="20" r="2" />
            </g>
          </svg>
        </span>
        <div style={{ fontSize: 16, marginBottom: 8 }}>カートは空です</div>
        <button
          onClick={() => router.push("/tabs/shop")}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            borderRadius: 20,
            border: "1px solid rgba(30,144,255,.3)",
            background: "rgba(30,144,255,.1)",
            color: "#1E90FF",
            cursor: "pointer",
          }}
        >
          ショップへ戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#333" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,0,0,.1)",
          background: "#ffffff",
          backdropFilter: "blur(8px)"
        }}
      >
        {/* ...ヘッダー内容... */}
      </div>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: 16 }}>
        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: 12,
              padding: 12,
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 12,
              background: "rgba(255,255,255,.04)",
              marginBottom: 12
            }}
          >
            {/* 商品画像 */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                background: item.image ? `url(${item.image}) center/cover` : "#f0f0f0",
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ color: "#1E90FF", fontWeight: "bold" }}>¥{item.price.toLocaleString()}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <button onClick={() => updateQuantity(item.id, -1)} style={{ width: 28, height: 28 }}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} style={{ width: 28, height: 28 }}>+</button>
                <button onClick={() => removeItem(item.id)} style={{ marginLeft: 12, color: "#f00" }}>削除</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 購入ボタン（固定） */}
      {cart.length > 0 && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            maxWidth: 430,
            margin: "0 auto",
            padding: 16,
            background: "#ffffff",
            borderTop: "1px solid rgba(0,0,0,.1)",
            backdropFilter: "blur(10px)"
          }}
        >
          <div
            style={{
              padding: 16,
              background: "rgba(30,144,255,0.15)",
              border: "1px solid rgba(30,144,255,0.3)",
              borderRadius: 12,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>合計金額</div>
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)} 点
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#1E90FF" }}>
              ¥{totalPrice.toLocaleString()}
            </div>
          </div>

          <button
            onClick={checkout}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 12,
              border: "none",
              background: purchased ? "rgba(30,144,255,.9)" : "rgba(30,144,255,.7)",
              color: "white",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "bold"
            }}
          >
            {purchased ? "✓ 購入完了しました！" : "購入する"}
          </button>
        </div>
      )}
    </div>
  );
}
