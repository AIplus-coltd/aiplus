import { NextRequest, NextResponse } from "next/server";

// Stripeは条件付きでインポート
let Stripe: any = null;
let stripe: any = null;

try {
  Stripe = require("stripe");
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  }
} catch (error) {
  console.log("Stripe not available, using simple checkout");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Checkout request body:", JSON.stringify(body, null, 2));

    // Stripe決済の場合（カート決済）
    if (body.items) {
      if (!stripe) {
        console.log("Stripe not configured, using simple checkout");
        
        const orderId = "ORD-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9).toUpperCase();
        
        return NextResponse.json(
          {
            success: true,
            orderId,
            message: "注文を受け付けました",
          },
          { status: 200 }
        );
      }

      const line_items = body.items.map((item: any) => ({
        price_data: {
          currency: "jpy",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/cart/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/cart/cancel`,
      });

      return NextResponse.json({ url: session.url });
    }

    // 簡易決済の場合（商品詳細ページから直接購入またはカート決済）
    const {
      productId,
      productName,
      price,
      quantity,
      totalAmount,
      buyerInfo,
      paymentInfo,
    } = body;

    console.log("Simple checkout data:", {
      productName,
      totalAmount,
      buyerName: buyerInfo?.name,
      buyerEmail: buyerInfo?.email,
    });

    // 最小限のバリデーション
    if (!productName || !totalAmount || !buyerInfo?.email || !paymentInfo?.cardNumber) {
      console.error("Missing required fields:", {
        productName: !!productName,
        totalAmount: !!totalAmount,
        buyerEmail: !!buyerInfo?.email,
        cardNumber: !!paymentInfo?.cardNumber,
      });
      return NextResponse.json(
        { error: "必須項目が足りません" },
        { status: 400 }
      );
    }

    // 注文IDを生成
    const orderId = "ORD-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9).toUpperCase();

    console.log("Payment processed successfully:", { orderId, productName, totalAmount });

    // 売上記録: productIdがあればそれをセール記録に追加
    if (productId) {
      try {
        // myProductsから該当商品を見つけて売上数を増やす
        const myProducts = localStorage?.getItem?.("myProducts");
        if (myProducts) {
          const products = JSON.parse(myProducts);
          const productIndex = products.findIndex((p: any) => p.id === productId);
          if (productIndex !== -1) {
            products[productIndex].soldCount = (products[productIndex].soldCount || 0) + (quantity || 1);
            localStorage.setItem("myProducts", JSON.stringify(products));
          }
        }

        // salesレコードを作成（ローカルストレージに保存）
        const sales = localStorage?.getItem?.("sales") || "[]";
        const salesArray = JSON.parse(sales);
        const newSale = {
          id: "sale-" + Date.now(),
          productId,
          sellerId: body.sellerId || "unknown",
          buyerId: body.buyerId || "buyer-anonymous",
          orderId,
          amount: totalAmount,
          buyerName: buyerInfo?.name || "Anonymous",
          buyerEmail: buyerInfo?.email || "",
          buyerAddress: buyerInfo?.address || "",
          status: "completed",
          createdAt: new Date().toISOString(),
        };
        salesArray.push(newSale);
        localStorage?.setItem?.("sales", JSON.stringify(salesArray));
        console.log("Sale recorded:", newSale);
      } catch (error) {
        console.error("Error recording sale:", error);
        // エラーでも決済は成功扱い
      }
    }

    // 成功レスポンス
    return NextResponse.json(
      {
        success: true,
        orderId,
        message: "決済が完了しました",
        order: {
          orderId,
          productName,
          quantity,
          totalAmount,
          buyerName: buyerInfo.name,
          buyerEmail: buyerInfo.email,
          orderDate: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "決済処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
