import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/auth/tokens";
import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "リフレッシュトークンがありません" }, { status: 401 });
  }

  const tokenHash = hashToken(refreshToken);
  const tokenRes = await supabaseAdmin
    .from("refresh_tokens")
    .select("id, user_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!tokenRes.data || tokenRes.data.revoked_at) {
    return NextResponse.json({ error: "リフレッシュトークンが無効です" }, { status: 401 });
  }

  if (tokenRes.data.expires_at < new Date().toISOString()) {
    return NextResponse.json({ error: "リフレッシュトークンの期限が切れています" }, { status: 401 });
  }

  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    return NextResponse.json({ error: "トークン検証に失敗しました" }, { status: 401 });
  }

  const accessToken = signAccessToken({ sub: payload.sub, email: payload.email, username: payload.username });
  const newRefreshToken = signRefreshToken({ sub: payload.sub, email: payload.email, username: payload.username });

  await supabaseAdmin.from("refresh_tokens").update({ revoked_at: new Date().toISOString() }).eq("id", tokenRes.data.id);
  await supabaseAdmin.from("refresh_tokens").insert({
    user_id: tokenRes.data.user_id,
    token_hash: hashToken(newRefreshToken),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const res = NextResponse.json({ message: "更新しました" });
  setAuthCookies(res, accessToken, newRefreshToken);
  return res;
}
