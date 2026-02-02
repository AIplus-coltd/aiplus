import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateNumericCode, generateToken, hashToken } from "@/lib/auth/tokens";
import { requireHttps } from "@/lib/auth/https";
import { sendEmail } from "@/lib/notify/email";
import { sendSms } from "@/lib/notify/sms";

const getBaseUrl = (req: NextRequest) => {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return host ? `${proto}://${host}` : "http://localhost:3000";
};

export async function POST(req: NextRequest) {
  if (!requireHttps(req)) {
    return NextResponse.json({ error: "HTTPSが必須です" }, { status: 400 });
  }
  const body = await req.json();
  const { email } = body || {};

  if (!email) {
    return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });
  }

  const userRes = await supabaseAdmin
    .from("app_users")
    .select("id, email, phone_number")
    .eq("email", email)
    .maybeSingle();

  if (!userRes.data) {
    return NextResponse.json({ error: "このメールは登録されていません" }, { status: 404 });
  }

  const resetToken = generateToken(16);
  const smsCode = generateNumericCode(6);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  await supabaseAdmin.from("password_reset_tokens").insert({
    user_id: userRes.data.id,
    reset_hash: hashToken(resetToken),
    sms_hash: hashToken(smsCode),
    expires_at: expiresAt,
  });

  const baseUrl = getBaseUrl(req);
  const resetUrl = `${baseUrl}/login/forgot-password?token=${encodeURIComponent(resetToken)}`;

  await sendEmail({
    to: userRes.data.email,
    subject: "【AIPLUS】パスワード再設定のご案内",
    html: `
      <p>以下のリンクからパスワードを再設定してください（30分有効）</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>または、以下のトークンを入力してください：<br><b>${resetToken}</b></p>
    `,
    text: `再設定リンク: ${resetUrl}\nトークン: ${resetToken}`,
  });

  await sendSms({
    to: userRes.data.phone_number,
    body: `【AIPLUS】パスワード再設定SMSコード: ${smsCode}（30分有効）`,
  });

  const response: Record<string, any> = { message: "再設定リンクとSMSコードを送信しました" };
  if (process.env.NODE_ENV !== "production") {
    response.dev = { resetToken, smsCode };
  }

  return NextResponse.json(response);
}
