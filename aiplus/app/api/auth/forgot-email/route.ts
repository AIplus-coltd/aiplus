import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  const maskedName = name.length <= 2 ? `${name[0]}***` : `${name.slice(0, 2)}***`;
  return `${maskedName}@${domain}`;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phoneNumber, birthDate } = body || {};

  if (!phoneNumber || !birthDate) {
    return NextResponse.json({ error: "電話番号と生年月日を入力してください" }, { status: 400 });
  }

  const userRes = await supabaseAdmin
    .from("app_users")
    .select("email")
    .eq("phone_number", phoneNumber)
    .eq("birth_date", birthDate)
    .maybeSingle();

  if (!userRes.data) {
    return NextResponse.json({ error: "入力された情報が一致しません" }, { status: 404 });
  }

  return NextResponse.json({ email: maskEmail(userRes.data.email) });
}
