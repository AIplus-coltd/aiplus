import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashPassword, validatePasswordPolicy, verifyPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/tokens";
import { requireHttps } from "@/lib/auth/https";

export async function POST(req: NextRequest) {
  if (!requireHttps(req)) {
    return NextResponse.json({ error: "HTTPSが必須です" }, { status: 400 });
  }
  const body = await req.json();
  const { token, smsCode, newPassword } = body || {};

  if (!token || !smsCode || !newPassword) {
    return NextResponse.json({ error: "必要な情報が不足しています" }, { status: 400 });
  }

  if (!validatePasswordPolicy(newPassword)) {
    return NextResponse.json({ error: "パスワードは8文字以上で英大文字・小文字・数字を含めてください" }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const smsHash = hashToken(smsCode);
  const now = new Date().toISOString();

  const resetRes = await supabaseAdmin
    .from("password_reset_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("reset_hash", tokenHash)
    .eq("sms_hash", smsHash)
    .maybeSingle();

  if (!resetRes.data) {
    return NextResponse.json({ error: "再設定リンクまたはSMSコードが無効です" }, { status: 400 });
  }

  if (resetRes.data.used_at) {
    return NextResponse.json({ error: "このリンクは既に使用されています" }, { status: 400 });
  }

  if (resetRes.data.expires_at < now) {
    return NextResponse.json({ error: "リンクの有効期限が切れています" }, { status: 400 });
  }

  const historyRes = await supabaseAdmin
    .from("password_history")
    .select("password_hash")
    .eq("user_id", resetRes.data.user_id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (historyRes.data) {
    for (const row of historyRes.data) {
      if (await verifyPassword(newPassword, row.password_hash)) {
        return NextResponse.json({ error: "過去3回と同じパスワードは使用できません" }, { status: 400 });
      }
    }
  }

  const newHash = await hashPassword(newPassword);
  await supabaseAdmin.from("app_users").update({ password_hash: newHash }).eq("id", resetRes.data.user_id);
  await supabaseAdmin.from("password_history").insert({ user_id: resetRes.data.user_id, password_hash: newHash });
  await supabaseAdmin.from("password_reset_tokens").update({ used_at: new Date().toISOString() }).eq("id", resetRes.data.id);

  return NextResponse.json({ message: "パスワードを再設定しました" });
}
