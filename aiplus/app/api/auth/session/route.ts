import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const payload = verifyToken(accessToken);
    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email,
        userId: payload.username,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
