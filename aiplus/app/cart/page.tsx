"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cartData = localStorage.getItem("cart");
    const cartItems = cartData ? JSON.parse(cartData) : [];
    setCart(cartItems);
  };

  const updateQuantity = (id: string, delta: number) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        const newQuantity = Math.max(1, Math.min(99, item.quantity + delta));
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  const checkout = () => {
    if (cart.length === 0) return;
    
    // 購入履歴に追加
    const historyData = localStorage.getItem("purchaseHistory");
    const history = historyData ? JSON.parse(historyData) : [];
    
    const purchase = {
      id: "order-" + Date.now(),
      items: cart,
      total: totalPrice,
      date: new Date().toISOString(),
    };
    
    history.unshift(purchase);
    localStorage.setItem("purchaseHistory", JSON.stringify(history));
    
    // カートをクリア
    clearCart();
    setPurchased(true);
    
    setTimeout(() => {
      setPurchased(false);
      router.push("/tabs/shop");
    }, 2000);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ minHeight: "100vh", background: "black", color: "white" }}>
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(30,144,255,.2)",
          background: "rgba(0,0,0,.9)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(30,144,255,.3)",
              background: "rgba(30,144,255,.1)",
              color: "#1E90FF",
              cursor: "pointer",
            }}
          >
            ←
          </button>
          <div style={{ fontWeight: "bold", fontSize: 18, color: "#1E90FF" }}>CART</div>
        </div>
        
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,100,100,.3)",
              background: "rgba(255,100,100,.1)",
              color: "rgba(255,150,150)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            全削除
          </button>
        )}
      </div>

      {/* カート内容 */}
      <div style={{ padding: 16, paddingBottom: 160 }}>
        {cart.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" aria-hidden="true" style={{ marginBottom: 16 }}>
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
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                }}
              >
                {/* 商品画像 */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${item.image})`,
                    flexShrink: 0,
                  }}
                />

                {/* 商品情報 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: "bold" }}>{item.name}</div>
                  <div style={{ fontSize: 16, color: "#1E90FF", fontWeight: "bold" }}>
                    ¥{item.price.toLocaleString()}
                  </div>

                  {/* 数量調整 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: "1px solid rgba(30,144,255,.3)",
                        background: "rgba(30,144,255,.1)",
                        color: "#1E90FF",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      −
                    </button>
                    <div style={{ width: 30, textAlign: "center", fontSize: 14 }}>
                      {item.quantity}
                    </div>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: "1px solid rgba(30,144,255,.3)",
                        background: "rgba(30,144,255,.1)",
                        color: "#1E90FF",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      ＋
                    </button>
                  </div>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,.2)",
                    background: "rgba(255,255,255,.05)",
                    color: "rgba(255,255,255,.6)",
                    cursor: "pointer",
                    fontSize: 18,
                    height: 36,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
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
            background: "rgba(0,0,0,.95)",
            borderTop: "1px solid rgba(255,255,255,.12)",
            backdropFilter: "blur(10px)",
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
              alignItems: "center",
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
              fontWeight: "bold",
            }}
          >
            {purchased ? "✓ 購入完了しました！" : "購入する"}
          </button>
        </div>
      )}
    </div>
  );
}
