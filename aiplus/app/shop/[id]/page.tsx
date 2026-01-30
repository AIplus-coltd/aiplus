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
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;

    const productsData = localStorage.getItem("shopProducts");
    const products = productsData ? JSON.parse(productsData) : [];
    const found = products.find((p: Product) => p.id === id);
    
    setProduct(found || null);
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    const cartData = localStorage.getItem("cart");
    const cart = cartData ? JSON.parse(cartData) : [];

    // 既にカートにある場合は数量を更新
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <div style={{ padding: 20, color: "#333", background: "#ffffff", minHeight: "100vh" }}>
        商品が見つかりません
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#333" }}>
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,0,0,.1)",
          background: "#ffffff",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.06)",
            color: "white",
            cursor: "pointer",
          }}
        >
          ← 戻る
        </button>
        <div style={{ fontWeight: "bold" }}>商品詳細</div>
      </div>

      {/* 商品画像 */}
      <div
        style={{
          width: "100%",
          height: 320,
          background: `linear-gradient(135deg, ${product.image})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 80,
        }}
      >
        🛍️
      </div>

      {/* 商品情報 */}
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 16,
            background: "rgba(255,255,255,.1)",
            fontSize: 12,
            marginBottom: 12,
          }}
        >
          {product.category}
        </div>
        
        <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
          {product.name}
        </div>
        
        <div style={{ fontSize: 28, color: "#4CAF50", fontWeight: "bold", marginBottom: 20 }}>
          ¥{product.price.toLocaleString()}
        </div>
        
        <div
          style={{
            padding: 16,
            background: "rgba(255,255,255,.05)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.1)",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          {product.description}
        </div>

        {/* 数量選択 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>数量</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.2)",
                background: "rgba(255,255,255,.06)",
                color: "white",
                cursor: "pointer",
                fontSize: 20,
              }}
            >
              −
            </button>
            <div
              style={{
                width: 60,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,.2)",
                borderRadius: 10,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {quantity}
            </div>
            <button
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.2)",
                background: "rgba(255,255,255,.06)",
                color: "white",
                cursor: "pointer",
                fontSize: 20,
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
            background: "rgba(76, 175, 80, 0.15)",
            border: "1px solid rgba(76, 175, 80, 0.3)",
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 14 }}>合計金額</div>
          <div style={{ fontSize: 22, fontWeight: "bold", color: "#4CAF50" }}>
            ¥{(product.price * quantity).toLocaleString()}
          </div>
        </div>

        {/* カートに追加ボタン */}
        <button
          onClick={addToCart}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: 12,
            border: "none",
            background: added ? "#4CAF50" : "rgba(0,150,255,.8)",
            color: "white",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          {added ? "✓ カートに追加しました" : "🛒 カートに追加"}
        </button>

        <button
          onClick={() => router.push("/cart")}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.2)",
            background: "rgba(255,255,255,.06)",
            color: "white",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          カートを見る
        </button>
      </div>
    </div>
  );
}
