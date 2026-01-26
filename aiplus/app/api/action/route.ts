import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
const DATA_PATH = path.join(process.cwd(), "data", "feed.json");

export async function POST(req: Request) {
  const body = await req.json();
  const { type, id, user, text } = body;

  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const items = JSON.parse(raw);
  const idx = items.findIndex((x: any) => x.id === id);
  if (idx === -1) return NextResponse.json({ ok: false });

  // ❤️ いいね（トグル）
  if (type === "like") {
    const likedBy = items[idx].likedBy || [];
    const i = likedBy.indexOf(user);
    if (i >= 0) {
      likedBy.splice(i, 1);
      items[idx].likes--;
    } else {
      likedBy.push(user);
      items[idx].likes++;
    }
    items[idx].likedBy = likedBy;
  }

  // 💬 コメント（名前＋時刻）
  if (type === "comment") {
    items[idx].comments.unshift({
      user,
      text,
      time: new Date().toLocaleString("ja-JP"),
    });
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2));
  return NextResponse.json({ ok: true });
}