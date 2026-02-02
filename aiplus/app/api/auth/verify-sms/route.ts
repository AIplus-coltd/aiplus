import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/auth/tokens";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, code } = body || {};

  if (!userId || !code) {
    return NextResponse.json({ error: "ユーザーIDとコードが必要です" }, { status: 400 });
  }

  const codeHash = hashToken(code);
  const now = new Date().toISOString();

  const userRes = await supabaseAdmin
    .from("app_users")
    .select("id, sms_verification_expires")
    .eq("user_id", userId)
    .eq("sms_verification_hash", codeHash)
    .maybeSingle();

  if (!userRes.data) {
    return NextResponse.json({ error: "SMSコードが無効です" }, { status: 400 });
  }

  if (userRes.data.sms_verification_expires && userRes.data.sms_verification_expires < now) {
    return NextResponse.json({ error: "SMSコードの有効期限が切れています" }, { status: 400 });
  }

  await supabaseAdmin
    .from("app_users")
    .update({
      is_phone_verified: true,
      sms_verification_hash: null,
      sms_verification_expires: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userRes.data.id);

  return NextResponse.json({ message: "SMS認証が完了しました" });
}
