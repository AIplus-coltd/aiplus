import { NextResponse } from "next/server";

export const setAuthCookies = (res: NextResponse, accessToken: string, refreshToken: string) => {
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15,
  });
  res.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
};

export const clearAuthCookies = (res: NextResponse) => {
  res.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
};
