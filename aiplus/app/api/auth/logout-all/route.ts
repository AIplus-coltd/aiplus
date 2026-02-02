import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

  await supabaseAdmin.from("refresh_tokens").update({ revoked_at: new Date().toISOString() }).eq("user_id", payload.sub);

  const res = NextResponse.json({ message: "全端末からログアウトしました" });
  clearAuthCookies(res);
  return res;
}
