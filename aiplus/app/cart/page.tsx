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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"info" | "payment" | "complete">("info");
  
  // 購入者情報
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  
  // 決済情報
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

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

  const checkout = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
    setCheckoutStep("info");
  };

  const handleNextStep = () => {
    if (checkoutStep === "info") {
      if (!buyerName || !buyerEmail || !buyerAddress || !buyerPhone) {
        alert("すべての項目を入力してください");
        return;
      }
      setCheckoutStep("payment");
    } else if (checkoutStep === "payment") {
      if (!cardNumber || !cardExpiry || !cardCVC) {
        alert("カード情報を入力してください");
        return;
      }
      processPayment();
    }
  };

  const processPayment = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "cart-items",
          productName: `カート商品 ${cart.length}点`,
          price: totalPrice,
          quantity: 1,
          totalAmount: totalPrice,
          buyerInfo: {
            name: buyerName,
            email: buyerEmail,
            address: buyerAddress,
            phone: buyerPhone,
          },
          paymentInfo: {
            cardNumber: cardNumber.replace(/\s/g, ""),
            cardExpiry,
            cardCVC,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCheckoutStep("complete");
        clearCart();
      } else {
        alert(data.error || "決済に失敗しました");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("決済処理中にエラーが発生しました");
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

  // 新UI: 画面下部の安全領域・ナビ高さを考慮
  const BOTTOM_NAV_HEIGHT = 72; // px
  const SAFE_AREA = 16; // px

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8f8ff", color: "#333" }}>
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
        <div style={{ fontSize: 18, marginBottom: 8, fontWeight: 600 }}>カートは空です</div>
        <button
          onClick={() => router.push("/tabs/shop")}
          style={{
            marginTop: 20,
            padding: "12px 28px",
            borderRadius: 24,
            border: "1.5px solid #38BDF8",
            background: "#eaf6ff",
            color: "#1976d2",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 2px 12px #38BDF822",
            transition: "all 0.2s"
          }}
        >
          ショップへ戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8ff", color: "#333", paddingBottom: BOTTOM_NAV_HEIGHT + SAFE_AREA + 24 }}>
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "16px 20px 12px 20px",
          borderBottom: "1.5px solid #38BDF822",
          background: "#fff",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "0.02em",
          boxShadow: "0 2px 12px #38BDF822",
        }}
      >
        カート
      </div>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "24px 8px 0 8px" }}>
        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: 16,
              padding: 16,
              border: "1.5px solid #38BDF822",
              borderRadius: 16,
              background: "#fff",
              marginBottom: 18,
              boxShadow: "0 2px 12px #38BDF822",
              alignItems: "center"
            }}
          >
            {/* 商品画像 */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: item.image ? `url(${item.image}) center/cover` : "#eaf6ff",
                flexShrink: 0,
                border: "1.5px solid #38BDF8",
                boxShadow: "0 2px 8px #38BDF822"
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{item.name}</div>
              <div style={{ color: "#1976d2", fontWeight: "bold", fontSize: 15 }}>¥{item.price.toLocaleString()}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <button onClick={() => updateQuantity(item.id, -1)} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #38BDF8", background: "#eaf6ff", color: "#1976d2", fontWeight: 700, fontSize: 18, cursor: "pointer" }}>-</button>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #38BDF8", background: "#eaf6ff", color: "#1976d2", fontWeight: 700, fontSize: 18, cursor: "pointer" }}>+</button>
                <button onClick={() => removeItem(item.id)} style={{ marginLeft: 16, color: "#f00", fontWeight: 700, fontSize: 14, background: "none", border: "none", cursor: "pointer" }}>削除</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 購入ボタン（新UI: 下部ナビと絶対重ならない） */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: BOTTOM_NAV_HEIGHT + SAFE_AREA,
          zIndex: 101,
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 430,
            margin: "0 auto",
            padding: "18px 18px 18px 18px",
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 2px 24px #38BDF822",
            border: "1.5px solid #38BDF8",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              padding: 12,
              background: "#eaf6ff",
              borderRadius: 12,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>合計金額</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)} 点
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: "#1976d2" }}>
              ¥{totalPrice.toLocaleString()}
            </div>
          </div>

          <button
            onClick={checkout}
            disabled={cart.length === 0}
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: 12,
              border: "none",
              background: cart.length === 0 ? "#ccc" : "#1976d2",
              color: "white",
              cursor: cart.length === 0 ? "not-allowed" : "pointer",
              fontSize: 18,
              fontWeight: "bold",
              boxShadow: "0 2px 12px #38BDF822",
              transition: "all 0.2s"
            }}
          >
            購入する
          </button>
        </div>
      </div>

      {/* 決済モーダル */}
      {showCheckoutModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,.8)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowCheckoutModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {checkoutStep === "complete" ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#333" }}>
                  購入完了！
                </h2>
                <p style={{ opacity: 0.8, marginBottom: 24, color: "#666" }}>
                  ご購入ありがとうございます。<br />
                  確認メールを送信しました。
                </p>
                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    router.push("/tabs/shop");
                  }}
                  style={{
                    width: "100%",
                    padding: 16,
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #1976d2, #1565c0)",
                    color: "white",
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ショップに戻る
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 24, color: "#333" }}>
                  {checkoutStep === "info" ? "お届け先情報" : "お支払い情報"}
                </h2>

                {checkoutStep === "info" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <input
                      type="text"
                      placeholder="お名前"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "#f5f5f5",
                        color: "#333",
                        fontSize: 14,
                      }}
                    />
                    <input
                      type="email"
                      placeholder="メールアドレス"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "#f5f5f5",
                        color: "#333",
                        fontSize: 14,
                      }}
                    />
                    <input
                      type="text"
                      placeholder="お届け先住所"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "#f5f5f5",
                        color: "#333",
                        fontSize: 14,
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="電話番号"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "#f5f5f5",
                        color: "#333",
                        fontSize: 14,
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <input
                      type="text"
                      placeholder="カード番号（16桁）"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "#f5f5f5",
                        color: "#333",
                        fontSize: 14,
                      }}
                    />
                    <div style={{ display: "flex", gap: 12 }}>
                      <input
                        type="text"
                        placeholder="有効期限（MM/YY）"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 8,
                          border: "1px solid #ddd",
                          background: "#f5f5f5",
                          color: "#333",
                          fontSize: 14,
                        }}
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value)}
                        maxLength={3}
                        style={{
                          width: 80,
                          padding: 12,
                          borderRadius: 8,
                          border: "1px solid #ddd",
                          background: "#f5f5f5",
                          color: "#333",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        padding: 16,
                        background: "#e3f2fd",
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8, color: "#666" }}>
                        お支払い金額
                      </div>
                      <div style={{ fontSize: 24, fontWeight: "900", color: "#1976d2" }}>
                        ¥{totalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button
                    onClick={() =>
                      checkoutStep === "info"
                        ? setShowCheckoutModal(false)
                        : setCheckoutStep("info")
                    }
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 10,
                      border: "1px solid #1976d2",
                      background: "transparent",
                      color: "#1976d2",
                      fontSize: 14,
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {checkoutStep === "info" ? "キャンセル" : "戻る"}
                  </button>
                  <button
                    onClick={handleNextStep}
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #1976d2, #1565c0)",
                      color: "white",
                      fontSize: 14,
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {checkoutStep === "info" ? "次へ" : "決済する"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
