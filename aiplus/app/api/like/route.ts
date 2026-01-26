import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_PATH = path.join(process.cwd(), "data", "feed.json");

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = Number(body?.id);

  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const items = JSON.parse(raw);

  const idx = items.findIndex((x: any) => x.id === id);
  if (idx === -1) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  items[idx].likes = Number(items[idx].likes || 0) + 1;

  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), "utf-8");

  return NextResponse.json({ ok: true, likes: items[idx].likes });
}