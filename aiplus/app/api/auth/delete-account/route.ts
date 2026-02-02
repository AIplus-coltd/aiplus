import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/auth/password";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  let payload;
  try {
    payload = verifyToken(accessToken);
  } catch {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, password } = body || {};
  if (!userId || !password) {
    return NextResponse.json({ error: "IDとパスワードを入力してください" }, { status: 400 });
  }

  if (payload.username !== userId) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const userRes = await supabaseAdmin
    .from("app_users")
    .select("id, password_hash")
    .eq("id", payload.sub)
    .maybeSingle();

  if (!userRes.data) {
    return NextResponse.json({ error: "アカウントが見つかりません" }, { status: 404 });
  }

  const ok = await verifyPassword(password, userRes.data.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  }

  const now = new Date();
  const deleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await supabaseAdmin
    .from("app_users")
    .update({ delete_requested_at: now.toISOString(), deleted_at: deleteAt.toISOString() })
    .eq("id", payload.sub);

  await supabaseAdmin.from("refresh_tokens").update({ revoked_at: now.toISOString() }).eq("user_id", payload.sub);

  const res = NextResponse.json({ message: "退会手続きが完了しました。30日以内は復旧可能です。" });
  clearAuthCookies(res);
  return res;
}
