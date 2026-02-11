import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return new TextEncoder().encode(secret);
};

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (url.pathname === "/feed") {
    url.pathname = "/tabs/feed";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith("/tabs/me")) {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return jwtVerify(token, getJwtSecret())
      .then(() => NextResponse.next())
      .catch(() => {
        url.pathname = "/login";
        return NextResponse.redirect(url);
      });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/feed", "/tabs/me/:path*"],
};
