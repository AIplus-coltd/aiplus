import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/tokens";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, smsCode } = body || {};

  if (!email || !password || !smsCode) {
    return NextResponse.json({ error: "必要な情報が不足しています" }, { status: 400 });
  }

  const userRes = await supabaseAdmin
    .from("app_users")
    .select("id, user_id, email, password_hash, login_sms_hash, login_sms_expires")
    .eq("email", email)
    .maybeSingle();

  if (!userRes.data) {
    return NextResponse.json({ error: "このメールは登録されていません" }, { status: 404 });
  }

  const isValid = await verifyPassword(password, userRes.data.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  }

  if (!userRes.data.login_sms_hash || !userRes.data.login_sms_expires) {
    return NextResponse.json({ error: "追加SMS認証が必要です" }, { status: 403 });
  }

  if (userRes.data.login_sms_expires < new Date().toISOString()) {
    return NextResponse.json({ error: "SMSコードの有効期限が切れています" }, { status: 400 });
  }

  if (hashToken(smsCode) !== userRes.data.login_sms_hash) {
    return NextResponse.json({ error: "SMSコードが違います" }, { status: 400 });
  }

  await supabaseAdmin
    .from("app_users")
    .update({ login_sms_hash: null, login_sms_expires: null, last_login_ip: req.headers.get("x-forwarded-for") || "", last_login_at: new Date().toISOString() })
    .eq("id", userRes.data.id);

  const payload = { sub: userRes.data.id, email: userRes.data.email, username: userRes.data.user_id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await supabaseAdmin.from("refresh_tokens").insert({
    user_id: userRes.data.id,
    token_hash: hashToken(refreshToken),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const res = NextResponse.json({ message: "ログイン成功", user: { id: userRes.data.id, userId: userRes.data.user_id, email: userRes.data.email } });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
}
