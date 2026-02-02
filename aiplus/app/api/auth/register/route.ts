import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashPassword, validatePasswordPolicy } from "@/lib/auth/password";
import { generateNumericCode, generateToken, hashToken } from "@/lib/auth/tokens";
import { isAtLeast13, isValidEmail, isValidPhone, isValidUserId } from "@/lib/auth/validation";
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
  if (process.env.NODE_ENV === "production" && !requireHttps(req)) {
    return NextResponse.json({ error: "HTTPSが必須です" }, { status: 400 });
  }

  const body = await req.json();
  const { userId, email, password, phoneNumber, birthDate } = body || {};

  if (!userId || !email || !password || !phoneNumber || !birthDate) {
    return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
  }

  if (!isValidUserId(userId)) {
    return NextResponse.json({ error: "ユーザーIDは3〜20文字で入力してください" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "メールアドレス形式が正しくありません" }, { status: 400 });
  }

  if (!isValidPhone(phoneNumber)) {
    return NextResponse.json({ error: "SMS認証可能な電話番号を入力してください" }, { status: 400 });
  }

  if (!isAtLeast13(birthDate)) {
    return NextResponse.json({ error: "13歳未満は登録できません" }, { status: 400 });
  }

  if (!validatePasswordPolicy(password)) {
    return NextResponse.json({ error: "パスワードは8文字以上で英大文字・小文字・数字を含めてください" }, { status: 400 });
  }

  const emailCheck = await supabaseAdmin.from("app_users").select("id").eq("email", email).maybeSingle();
  console.log("Email check:", emailCheck);
  if (emailCheck.data) {
    return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 409 });
  }

  const idCheck = await supabaseAdmin.from("app_users").select("id").eq("user_id", userId).maybeSingle();
  console.log("User ID check:", idCheck);
  if (idCheck.data) {
    return NextResponse.json({ error: "このユーザーIDは既に使用されています" }, { status: 409 });
  }

  const phoneCheck = await supabaseAdmin.from("app_users").select("id").eq("phone_number", phoneNumber).maybeSingle();
  console.log("Phone check:", phoneCheck);
  if (phoneCheck.data) {
    return NextResponse.json({ error: "この電話番号は既に登録されています" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const emailToken = generateToken(16);
  const smsCode = generateNumericCode(6);
  const emailHash = hashToken(emailToken);
  const smsHash = hashToken(smsCode);
  const now = new Date();
  const expires = new Date(now.getTime() + 1000 * 60 * 30);

  const insertRes = await supabaseAdmin
    .from("app_users")
    .insert({
      user_id: userId,
      email,
      phone_number: phoneNumber,
      birth_date: birthDate,
      password_hash: passwordHash,
      email_verification_hash: emailHash,
      email_verification_expires: expires.toISOString(),
      sms_verification_hash: smsHash,
      sms_verification_expires: expires.toISOString(),
    })
    .select("id, user_id, email")
    .single();

  console.log("Insert result:", insertRes);
  if (insertRes.error || !insertRes.data) {
    console.error("Insert error:", insertRes.error);
    return NextResponse.json({ error: "新規登録に失敗しました", details: insertRes.error?.message }, { status: 500 });
  }

  await supabaseAdmin.from("password_history").insert({
    user_id: insertRes.data.id,
    password_hash: passwordHash,
  });

  const baseUrl = getBaseUrl(req);
  const verifyUrl = `${baseUrl}/verify?token=${encodeURIComponent(emailToken)}&userId=${encodeURIComponent(userId)}`;

  try {
    await sendEmail({
      to: email,
      subject: "【AIPLUS】メール認証のご案内",
      html: `
        <p>以下のリンクからメール認証を完了してください（30分有効）</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>または、以下のトークンを入力してください：<br><b>${emailToken}</b></p>
      `,
      text: `メール認証リンク: ${verifyUrl}\nトークン: ${emailToken}`,
    });
  } catch (error) {
    console.error("Email送信エラー:", error);
  }

  try {
    await sendSms({
      to: phoneNumber,
      body: `【AIPLUS】SMS認証コード: ${smsCode}（30分有効）`,
    });
  } catch (error) {
    console.error("SMS送信エラー:", error);
  }

  const response: Record<string, any> = {
    message: "認証メールとSMSを送信しました",
    user: {
      id: insertRes.data.id,
      userId: insertRes.data.user_id,
      email: insertRes.data.email,
    },
  };

  if (process.env.NODE_ENV !== "production") {
    response.dev = { emailToken, smsCode };
  }

  return NextResponse.json(response, { status: 201 });
}
