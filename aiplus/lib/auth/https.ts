import { NextRequest } from "next/server";

export const requireHttps = (req: NextRequest) => {
  if (process.env.NODE_ENV !== "production") return true;
  const proto = req.headers.get("x-forwarded-proto");
  return proto ? proto === "https" : req.nextUrl.protocol === "https:";
};
