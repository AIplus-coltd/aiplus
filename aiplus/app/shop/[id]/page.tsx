"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  sellerId?: string;
  sellerName?: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
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

  const PLATFORM_FEE_RATE = 0.1;

  const resolveCurrentUserId = () => {
    let userId: string | null = null;
    const currentUserRaw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    if (currentUserRaw) {
      try {
        const parsed = JSON.parse(currentUserRaw);
        userId = parsed?.id || parsed?.user_id || null;
      } catch {}
    }
    if (!userId) userId = localStorage.getItem("me");
    if (!userId) {
      userId = "demo-user";
      localStorage.setItem("me", userId);
    }
    return userId;
  };

  const recordSaleAndPayout = (orderId: string, totalAmount: number) => {
    if (!product?.sellerId) return;
    const feeAmount = Math.floor(totalAmount * PLATFORM_FEE_RATE);
    const netAmount = Math.max(0, totalAmount - feeAmount);
    const buyerId = resolveCurrentUserId();

    const salesRaw = localStorage.getItem("sales") || "[]";
    const sales = JSON.parse(salesRaw);
    if (!sales.find((s: any) => s.orderId === orderId)) {
      sales.push({
        id: "sale-" + Date.now(),
        productId: product.id,
        sellerId: product.sellerId,
        sellerName: product.sellerName || "",
        buyerId,
        orderId,
        amount: totalAmount,
        feeAmount,
        netAmount,
        buyerName: buyerName || "Anonymous",
        buyerEmail: buyerEmail || "",
        buyerAddress: buyerAddress || "",
        status: "completed",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("sales", JSON.stringify(sales));
    }

    const balancesRaw = localStorage.getItem("sellerBalances") || "{}";
    const balances = JSON.parse(balancesRaw);
    balances[product.sellerId] = (balances[product.sellerId] || 0) + netAmount;
    localStorage.setItem("sellerBalances", JSON.stringify(balances));
  };

  useEffect(() => {
    // テーマ設定を取得
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

    // 商品データを取得
    const productsData = localStorage.getItem("shopProducts");
    if (productsData) {
      const products: Product[] = JSON.parse(productsData);
      const foundProduct = products.find((p) => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartData = localStorage.getItem("cart");
    const cart = cartData ? JSON.parse(cartData) : [];
    
    // カートに商品を追加
    const cartItem = {
      ...product,
      quantity,
      addedAt: new Date().toISOString(),
    };
    
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));
    
    alert(`${product.name}をカートに追加しました`);
    router.push("/cart");
  };

  const handleBuyNow = () => {
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
      // 決済処理（実際はAPI呼び出し）
      processPayment();
    }
  };

  const processPayment = async () => {
    if (!product) return;

    // 決済APIを呼び出し
    try {
      const totalAmount = product.price * quantity;
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity,
          totalAmount,
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
        recordSaleAndPayout(data?.orderId || "ORD-LOCAL-" + Date.now(), totalAmount);
        setCheckoutStep("complete");
      } else {
        alert(data.error || "決済に失敗しました");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("決済処理中にエラーが発生しました");
    }
  };

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: backgroundColor === "light" ? "#f8f8f8" : "#0a0014",
          color: backgroundColor === "light" ? "#333" : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>商品が見つかりません</div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: backgroundColor === "light"
          ? "#f8f8f8"
          : "linear-gradient(135deg, #0a0014 0%, #0f0519 50%, #1a0a28 100%)",
        color: backgroundColor === "light" ? "#333" : "white",
        paddingBottom: 40,
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          padding: "16px",
          borderBottom: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}26`}`,
          background: backgroundColor === "light"
            ? "rgba(255,255,255,.95)"
            : `rgba(26,10,40,.95)`,
          backdropFilter: "blur(20px)",
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
        <div style={{ fontSize: 18, fontWeight: "bold" }}>商品詳細</div>
      </div>

      {/* 商品画像 */}
      <div
        style={{
          width: "100%",
          height: 300,
          background: `linear-gradient(135deg, ${product.image})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 48, opacity: 0.3 }}>📦</div>
      </div>

      {/* 商品情報 */}
      <div style={{ padding: "24px 16px" }}>
        <div
          style={{
            fontSize: 12,
            color: themeColor,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          {product.category}
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          {product.name}
        </h1>
        <div
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: themeColor,
            marginBottom: 20,
          }}
        >
          ¥{product.price.toLocaleString()}
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.8,
            opacity: 0.9,
            marginBottom: 32,
            padding: 16,
            background: backgroundColor === "light"
              ? "rgba(0,0,0,.03)"
              : "rgba(255,255,255,.05)",
            borderRadius: 12,
          }}
        >
          {product.description}
        </div>

        {/* 数量選択 */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 12,
            }}
          >
            数量
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                border: `1px solid ${themeColor}`,
                background: "transparent",
                color: themeColor,
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              −
            </button>
            <div style={{ fontSize: 18, fontWeight: "bold", minWidth: 30, textAlign: "center" }}>
              {quantity}
            </div>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                border: `1px solid ${themeColor}`,
                background: "transparent",
                color: themeColor,
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              ＋
            </button>
          </div>
        </div>

        {/* 合計金額 */}
        <div
          style={{
            padding: 16,
            background: backgroundColor === "light"
              ? "rgba(0,0,0,.05)"
              : `${themeColor}15`,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>合計金額</div>
            <div style={{ fontSize: 24, fontWeight: "900", color: themeColor }}>
              ¥{totalPrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* カートに追加 */}
          <button
            onClick={handleAddToCart}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: `0 4px 16px ${themeColor}66`,
            }}
          >
            カートに追加
          </button>

          {/* カートを見る */}
          <button
            onClick={() => router.push("/cart")}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 12,
              border: `2px solid ${themeColor}`,
              background: "transparent",
              color: themeColor,
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            カートを見る
          </button>

          {/* 区切り線 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "8px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: backgroundColor === "light" ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.1)",
              }}
            />
            <div style={{ fontSize: 12, opacity: 0.6 }}>または</div>
            <div
              style={{
                flex: 1,
                height: 1,
                background: backgroundColor === "light" ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.1)",
              }}
            />
          </div>

          {/* そのまま購入 */}
          <button
            onClick={handleBuyNow}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 12,
              border: `1px solid ${themeColor}40`,
              background: backgroundColor === "light"
                ? "rgba(0,0,0,.03)"
                : `${themeColor}15`,
              color: themeColor,
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            そのまま購入
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
              background: backgroundColor === "light" ? "#fff" : "#1a0a28",
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
              // 完了画面
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
                  購入完了！
                </h2>
                <p style={{ opacity: 0.8, marginBottom: 24 }}>
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
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
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
                <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 24 }}>
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
                        border: `1px solid ${themeColor}40`,
                        background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.1)",
                        color: backgroundColor === "light" ? "#333" : "white",
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
                        border: `1px solid ${themeColor}40`,
                        background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.1)",
                        color: backgroundColor === "light" ? "#333" : "white",
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
                        border: `1px solid ${themeColor}40`,
                        background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.1)",
                        color: backgroundColor === "light" ? "#333" : "white",
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
                        border: `1px solid ${themeColor}40`,
                        background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.1)",
                        color: backgroundColor === "light" ? "#333" : "white",
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
                        border: `1px solid ${themeColor}40`,
                        background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.1)",
                        color: backgroundColor === "light" ? "#333" : "white",
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
                          border: `1px solid ${themeColor}40`,
                          background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.1)",
                          color: backgroundColor === "light" ? "#333" : "white",
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
                          border: `1px solid ${themeColor}40`,
                          background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.1)",
                          color: backgroundColor === "light" ? "#333" : "white",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        padding: 16,
                        background: `${themeColor}15`,
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    >
                      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
                        お支払い金額
                      </div>
                      <div style={{ fontSize: 24, fontWeight: "900", color: themeColor }}>
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
                      border: `1px solid ${themeColor}`,
                      background: "transparent",
                      color: themeColor,
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
                      background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
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
