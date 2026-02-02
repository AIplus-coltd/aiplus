import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { generateNumericCode, hashToken } from "@/lib/auth/tokens";
import { setAuthCookies } from "@/lib/auth/cookies";
import { requireHttps } from "@/lib/auth/https";
import { sendSms } from "@/lib/notify/sms";

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && !requireHttps(req)) {
    return NextResponse.json({ error: "HTTPSが必須です" }, { status: 400 });
  }
  const body = await req.json();
  const { email, password } = body || {};

  if (!email || !password) {
    return NextResponse.json({ error: "メールアドレスとパスワードを入力してください" }, { status: 400 });
  }

  // emailまたはuser_idでログイン可能にする
  const isEmail = email.includes('@');
  const userRes = await supabaseAdmin
    .from("app_users")
    .select("id, user_id, email, phone_number, password_hash, failed_login_count, locked_until, is_email_verified, is_phone_verified, delete_requested_at, deleted_at, last_login_ip")
    .eq(isEmail ? "email" : "user_id", email)
    .maybeSingle();

  console.log("Login user lookup:", userRes);
  if (!userRes.data) {
    console.log("User not found for:", email);
    return NextResponse.json({ error: isEmail ? "このメールは登録されていません" : "このユーザーIDは登録されていません" }, { status: 404 });
  }

  if (userRes.data.deleted_at && userRes.data.deleted_at <= new Date().toISOString()) {
    return NextResponse.json({ error: "退会済みのアカウントです" }, { status: 403 });
  }

  if (userRes.data.delete_requested_at && userRes.data.deleted_at && userRes.data.deleted_at > new Date().toISOString()) {
    return NextResponse.json({ error: "退会手続き中です。30日以内は復旧可能です" }, { status: 403 });
  }

  if (userRes.data.locked_until && userRes.data.locked_until > new Date().toISOString()) {
    return NextResponse.json({ error: "しばらく待ってから再度お試しください" }, { status: 423 });
  }

  const isValid = await verifyPassword(password, userRes.data.password_hash);
  if (!isValid) {
    const nextFailed = (userRes.data.failed_login_count || 0) + 1;
    const updates: Record<string, any> = { failed_login_count: nextFailed };
    if (nextFailed >= MAX_FAILED) {
      updates.locked_until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
      updates.failed_login_count = 0;
    }
    await supabaseAdmin.from("app_users").update(updates).eq("id", userRes.data.id);
    return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  }

  if (process.env.NODE_ENV === "production") {
    if (!userRes.data.is_email_verified || !userRes.data.is_phone_verified) {
      return NextResponse.json({ error: "本人確認が完了していません" }, { status: 403 });
    }
  }

  const currentIp = req.headers.get("x-forwarded-for") || "";
  if (process.env.NODE_ENV === "production" && userRes.data.last_login_ip && currentIp && userRes.data.last_login_ip !== currentIp) {
    const smsCode = generateNumericCode(6);
    await supabaseAdmin
      .from("app_users")
      .update({
        login_sms_hash: hashToken(smsCode),
        login_sms_expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
      .eq("id", userRes.data.id);

    if (!userRes.data.phone_number) {
      return NextResponse.json({ error: "SMS送信先が未登録です" }, { status: 400 });
    }

    try {
      await sendSms({
        to: userRes.data.phone_number,
        body: `【AIPLUS】追加認証コード: ${smsCode}（15分有効）`,
      });
    } catch (error) {
      console.error("SMS送信エラー:", error);
    }

    const response: Record<string, any> = { error: "追加SMS認証が必要です", requiresSms: true };
    if (process.env.NODE_ENV !== "production") {
      response.dev = { smsCode };
    }
    return NextResponse.json(response, { status: 403 });
  }

  await supabaseAdmin.from("app_users").update({ failed_login_count: 0, locked_until: null }).eq("id", userRes.data.id);

  const payload = {
    sub: userRes.data.id,
    email: userRes.data.email,
    username: userRes.data.user_id,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const refreshHash = hashToken(refreshToken);

  await supabaseAdmin.from("refresh_tokens").insert({
    user_id: userRes.data.id,
    token_hash: refreshHash,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ip_address: req.headers.get("x-forwarded-for") || "",
    user_agent: req.headers.get("user-agent") || "",
  });

  await supabaseAdmin
    .from("app_users")
    .update({ last_login_ip: currentIp, last_login_at: new Date().toISOString() })
    .eq("id", userRes.data.id);

  const res = NextResponse.json({
    message: "ログイン成功",
    user: {
      id: userRes.data.id,
      userId: userRes.data.user_id,
      email: userRes.data.email,
    },
  });

  setAuthCookies(res, accessToken, refreshToken);
  return res;
}
