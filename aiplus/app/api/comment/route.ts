import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type FeedItem = {
  id: number;
  videoUrl: string;
  user: string;
  comments?: string[];
};

const DATA_PATH = path.join(process.cwd(), "data", "feed.json");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { id?: number; text?: string }
    | null;

  const id = Number(body?.id);
  const text = (body?.text ?? "").toString().trim();

  if (!id || !text) {
    return NextResponse.json({ ok: false, message: "bad request" }, { status: 400 });
  }

  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const items = JSON.parse(raw) as FeedItem[];

  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) {
    return NextResponse.json({ ok: false, message: "not found" }, { status: 404 });
  }

  const comments = Array.isArray(items[idx].comments) ? items[idx].comments! : [];
  comments.push(text);
  items[idx].comments = comments;

  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), "utf-8");

  return NextResponse.json({ ok: true, item: items[idx] });
}