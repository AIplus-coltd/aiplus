import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/auth/tokens";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token } = body || {};

  if (!token) {
    return NextResponse.json({ error: "トークンが必要です" }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  const userRes = await supabaseAdmin
    .from("app_users")
    .select("id, email_verification_expires")
    .eq("email_verification_hash", tokenHash)
    .maybeSingle();

  if (!userRes.data) {
    return NextResponse.json({ error: "認証リンクが無効です" }, { status: 400 });
  }

  if (userRes.data.email_verification_expires && userRes.data.email_verification_expires < now) {
    return NextResponse.json({ error: "認証リンクの有効期限が切れています" }, { status: 400 });
  }

  await supabaseAdmin
    .from("app_users")
    .update({
      is_email_verified: true,
      email_verification_hash: null,
      email_verification_expires: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userRes.data.id);

  return NextResponse.json({ message: "メール認証が完了しました" });
}
