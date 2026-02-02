"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hybridGet, hybridSet } from "@/lib/hybrid-storage";

interface SellerInfo {
  // 銀行口座情報
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branchName: string;
  
  // 連絡先情報
  phoneNumber: string;
  email: string;
  
  // 住所情報
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building: string;
  
  // 身分証明書
  idDocument: string; // base64 encoded image
  idDocumentType: string; // 運転免許証、マイナンバーカード、パスポート等
  
  // その他
  fullName: string;
  birthDate: string;
}

export default function SellerInfoPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [sellerInfo, setSellerInfo] = useState<SellerInfo>({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    branchName: "",
    phoneNumber: "",
    email: "",
    postalCode: "",
    prefecture: "",
    city: "",
    address: "",
    building: "",
    idDocument: "",
    idDocumentType: "運転免許証",
    fullName: "",
    birthDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ユーザーIDを取得
  useEffect(() => {
    const resolveUserId = () => {
      let id: string | null = null;
      
      const currentUserRaw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
      if (currentUserRaw) {
        try {
          const parsed = JSON.parse(currentUserRaw);
          id = parsed?.id || parsed?.user_id || null;
        } catch {}
      }
      
      if (!id) id = localStorage.getItem("me");
      
      if (!id) {
        id = "demo-user";
        localStorage.setItem("me", id);
      }
      
      return id;
    };

    const id = resolveUserId();
    setUserId(id);
    loadSellerInfo(id);
  }, []);

  // 保存された出品者情報を読み込み
  const loadSellerInfo = async (id: string) => {
    try {
      const saved = await hybridGet(`sellerInfo_${id}`);
      if (saved) {
        setSellerInfo(saved);
      }
    } catch (error) {
      console.error("出品者情報の読み込みエラー:", error);
    }
  };

  // 入力値の更新
  const handleChange = (field: keyof SellerInfo, value: string) => {
    setSellerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 身分証明書のアップロード
  const handleIdDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ ファイルサイズは5MB以下にしてください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSellerInfo(prev => ({
        ...prev,
        idDocument: base64
      }));
      setMessage("✓ 身分証明書をアップロードしました");
      setTimeout(() => setMessage(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  // 保存
  const handleSave = async () => {
    // バリデーション
    if (!sellerInfo.fullName) {
      setMessage("❌ 氏名を入力してください");
      return;
    }
    if (!sellerInfo.phoneNumber) {
      setMessage("❌ 電話番号を入力してください");
      return;
    }
    if (!sellerInfo.bankName || !sellerInfo.accountNumber || !sellerInfo.accountHolder) {
      setMessage("❌ 銀行口座情報を入力してください");
      return;
    }
    if (!sellerInfo.postalCode || !sellerInfo.prefecture || !sellerInfo.city || !sellerInfo.address) {
      setMessage("❌ 住所を入力してください");
      return;
    }
    if (!sellerInfo.idDocument) {
      setMessage("❌ 身分証明書をアップロードしてください");
      return;
    }

    setSaving(true);
    try {
      await hybridSet(`sellerInfo_${userId}`, sellerInfo);
      setMessage("✓ 出品者情報を保存しました");
      setTimeout(() => {
        router.push("/tabs/me");
      }, 1500);
    } catch (error) {
      console.error("保存エラー:", error);
      setMessage("❌ 保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "transparent",
      paddingBottom: "80px"
    }}>
      {/* ヘッダー */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            padding: "4px"
          }}
        >
          ←
        </button>
        <h1 style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: "600",
          color: "#fff"
        }}>
          出品者情報登録
        </h1>
      </div>

      {/* メッセージ */}
      {message && (
        <div style={{
          margin: "16px",
          padding: "12px 16px",
          background: message.includes("✓") ? "rgba(0,255,0,0.2)" : "rgba(255,0,0,0.2)",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "14px",
          textAlign: "center"
        }}>
          {message}
        </div>
      )}

      {/* フォーム */}
      <div style={{ padding: "16px" }}>
        {/* 基本情報 */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#fff",
            marginBottom: "16px"
          }}>
            基本情報
          </h2>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              氏名 <span style={{ color: "#ff4444" }}>*</span>
            </label>
            <input
              type="text"
              value={sellerInfo.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="山田 太郎"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              生年月日 <span style={{ color: "#ff4444" }}>*</span>
            </label>
            <input
              type="date"
              value={sellerInfo.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              電話番号 <span style={{ color: "#ff4444" }}>*</span>
            </label>
            <input
              type="tel"
              value={sellerInfo.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="090-1234-5678"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={sellerInfo.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="example@email.com"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>
        </div>

        {/* 住所情報 */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#fff",
            marginBottom: "16px"
          }}>
            住所 <span style={{ color: "#ff4444" }}>*</span>
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              郵便番号
            </label>
            <input
              type="text"
              value={sellerInfo.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              placeholder="123-4567"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              都道府県
            </label>
            <input
              type="text"
              value={sellerInfo.prefecture}
              onChange={(e) => handleChange("prefecture", e.target.value)}
              placeholder="東京都"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              市区町村
            </label>
            <input
              type="text"
              value={sellerInfo.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="渋谷区"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              番地
            </label>
            <input
              type="text"
              value={sellerInfo.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="道玄坂1-2-3"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              建物名・部屋番号
            </label>
            <input
              type="text"
              value={sellerInfo.building}
              onChange={(e) => handleChange("building", e.target.value)}
              placeholder="〇〇マンション 101号室"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>
        </div>

        {/* 銀行口座情報 */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#fff",
            marginBottom: "16px"
          }}>
            銀行口座情報 <span style={{ color: "#ff4444" }}>*</span>
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              銀行名
            </label>
            <input
              type="text"
              value={sellerInfo.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              placeholder="○○銀行"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              支店名
            </label>
            <input
              type="text"
              value={sellerInfo.branchName}
              onChange={(e) => handleChange("branchName", e.target.value)}
              placeholder="△△支店"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              口座番号
            </label>
            <input
              type="text"
              value={sellerInfo.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
              placeholder="1234567"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              口座名義
            </label>
            <input
              type="text"
              value={sellerInfo.accountHolder}
              onChange={(e) => handleChange("accountHolder", e.target.value)}
              placeholder="ヤマダ タロウ"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>
        </div>

        {/* 身分証明書 */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px"
        }}>
          <h2 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#fff",
            marginBottom: "16px"
          }}>
            身分証明書 <span style={{ color: "#ff4444" }}>*</span>
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              証明書の種類
            </label>
            <select
              value={sellerInfo.idDocumentType}
              onChange={(e) => handleChange("idDocumentType", e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px"
              }}
            >
              <option value="運転免許証">運転免許証</option>
              <option value="マイナンバーカード">マイナンバーカード</option>
              <option value="パスポート">パスポート</option>
              <option value="健康保険証">健康保険証</option>
              <option value="住民票">住民票</option>
            </select>
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px"
            }}>
              画像アップロード (JPG, PNG, 5MB以下)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleIdDocumentUpload}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px"
              }}
            />
            {sellerInfo.idDocument && (
              <div style={{ marginTop: "12px" }}>
                <img
                  src={sellerInfo.idDocument}
                  alt="身分証明書"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)"
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 注意事項 */}
        <div style={{
          background: "rgba(255,165,0,0.2)",
          border: "1px solid rgba(255,165,0,0.5)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px"
        }}>
          <p style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.9)",
            margin: 0,
            lineHeight: "1.6"
          }}>
            ⚠️ 注意事項<br/>
            • 入力された情報は販売代金の振込に使用されます<br/>
            • 身分証明書は本人確認のために必要です<br/>
            • 情報は厳重に管理され、第三者に開示されることはありません<br/>
            • 虚偽の情報を入力した場合、販売資格を失う可能性があります
          </p>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            padding: "16px",
            background: saving ? "rgba(128,128,128,0.5)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: saving ? "not-allowed" : "pointer",
            transition: "all 0.3s ease"
          }}
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
}
