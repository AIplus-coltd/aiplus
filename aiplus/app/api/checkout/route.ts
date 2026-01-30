import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Stripeのシークレットキーを環境変数から取得
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const { items } = await req.json();

  // 商品情報をStripeのLine Items形式に変換
  const line_items = items.map((item: any) => ({
    price_data: {
      currency: "jpy",
      product_data: {
        name: item.name,
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  // Stripe Checkoutセッション作成
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
