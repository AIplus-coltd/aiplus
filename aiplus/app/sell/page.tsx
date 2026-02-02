"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productCategory, setProductCategory] = useState("その他");
  const [productStock, setProductStock] = useState("1");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [themeColor, setThemeColor] = useState("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");

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

    // マイ出品商品を取得
    const productsData = localStorage.getItem("myProducts");
    if (productsData) {
      setMyProducts(JSON.parse(productsData));
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setProductImage(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostProduct = () => {
    if (!productName.trim() || !productPrice.trim() || isNaN(Number(productPrice))) {
      alert("商品名と価格を入力してください");
      return;
    }

    const newProduct = {
      id: "prod-" + Date.now() + Math.random().toString(36).substring(2, 9),
      sellerId: currentUser?.id || "user-demo",
      sellerName: currentUser?.username || "Unknown",
      name: productName,
      price: Number(productPrice),
      description: productDesc,
      category: productCategory,
      stock: Number(productStock),
      image: productImage || `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
      soldCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [newProduct, ...myProducts];
    setMyProducts(updated);
    localStorage.setItem("myProducts", JSON.stringify(updated));

    // グローバルショップにも追加
    const shopProducts = localStorage.getItem("shopProducts");
    const allProducts = shopProducts ? JSON.parse(shopProducts) : [];
    allProducts.push({
      id: newProduct.id,
      name: newProduct.name,
      price: newProduct.price,
      image: newProduct.image,
      description: newProduct.description,
      category: newProduct.category,
      sellerId: newProduct.sellerId,
      sellerName: newProduct.sellerName,
    });
    localStorage.setItem("shopProducts", JSON.stringify(allProducts));

    // フォームをリセット
    setProductName("");
    setProductPrice("");
    setProductDesc("");
    setProductCategory("その他");
    setProductStock("1");
    setProductImage(null);
    setImagePreview("");

    alert("商品を出品しました！");
  };

  const deleteProduct = (id: string) => {
    const updated = myProducts.filter((p) => p.id !== id);
    setMyProducts(updated);
    localStorage.setItem("myProducts", JSON.stringify(updated));

    // グローバルショップからも削除
    const shopProducts = localStorage.getItem("shopProducts");
    if (shopProducts) {
      const allProducts = JSON.parse(shopProducts);
      const filtered = allProducts.filter((p: any) => p.id !== id);
      localStorage.setItem("shopProducts", JSON.stringify(filtered));
    }

    alert("商品を削除しました");
  };

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
        <div style={{ fontSize: 18, fontWeight: "bold", color: themeColor }}>商品出品</div>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>
        {/* 出品フォーム */}
        <div
          style={{
            background: backgroundColor === "light" ? "#fff" : "rgba(255,255,255,.05)",
            borderRadius: 16,
            padding: 24,
            marginBottom: 32,
            border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}20`}`,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>新しい商品を出品</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 画像アップロード */}
            <div>
              <label style={{ fontSize: 14, fontWeight: "600", marginBottom: 8, display: "block" }}>商品画像</label>
              <div style={{ marginBottom: 12 }}>
                {imagePreview && (
                  <div
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 10,
                      background: `url(${imagePreview}) center/cover`,
                      marginBottom: 12,
                      border: `2px solid ${themeColor}40`,
                    }}
                  />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `2px dashed ${themeColor}40`,
                  background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.05)",
                  color: backgroundColor === "light" ? "#333" : "white",
                  fontSize: 14,
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: "600", marginBottom: 8, display: "block" }}>商品名 *</label>
              <input
                type="text"
                placeholder="商品名を入力"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}40`}`,
                  background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.05)",
                  color: backgroundColor === "light" ? "#333" : "white",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: "600", marginBottom: 8, display: "block" }}>価格 (¥) *</label>
              <input
                type="number"
                placeholder="1000"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}40`}`,
                  background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.05)",
                  color: backgroundColor === "light" ? "#333" : "white",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: "600", marginBottom: 8, display: "block" }}>説明</label>
              <textarea
                placeholder="商品の説明を入力"
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}40`}`,
                  background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.05)",
                  color: backgroundColor === "light" ? "#333" : "white",
                  fontSize: 14,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 14, fontWeight: "600", marginBottom: 8, display: "block" }}>カテゴリ</label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}40`}`,
                    background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.05)",
                    color: backgroundColor === "light" ? "#333" : "white",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                >
                  <option>その他</option>
                  <option>電子機器</option>
                  <option>撮影機材</option>
                  <option>アクセサリ</option>
                  <option>書籍</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 14, fontWeight: "600", marginBottom: 8, display: "block" }}>在庫数</label>
                <input
                  type="number"
                  min="1"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}40`}`,
                    background: backgroundColor === "light" ? "#f5f5f5" : "rgba(255,255,255,.05)",
                    color: backgroundColor === "light" ? "#333" : "white",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              onClick={handlePostProduct}
              style={{
                padding: "16px",
                borderRadius: 12,
                border: "none",
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              商品を出品する
            </button>
          </div>
        </div>

        {/* マイ出品商品 */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
            マイ出品 ({myProducts.length})
          </h2>

          {myProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                opacity: 0.6,
              }}
            >
              <div style={{ fontSize: 14 }}>出品している商品がありません</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 16,
                    background: backgroundColor === "light" ? "#fff" : "rgba(255,255,255,.05)",
                    borderRadius: 12,
                    border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : `${themeColor}20`}`,
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      background: typeof product.image === "string" && product.image.startsWith("data:")
                        ? `url(${product.image}) center/cover`
                        : product.image,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: "bold" }}>{product.name}</div>
                    <div style={{ fontSize: 13, color: themeColor, fontWeight: "600", margin: "4px 0" }}>
                      ¥{product.price.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>
                      {product.category} | 在庫: {product.stock} | 売上: {product.soldCount}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "rgba(255,0,0,.2)",
                      color: "#ff6b6b",
                      fontSize: 12,
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    削除
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
