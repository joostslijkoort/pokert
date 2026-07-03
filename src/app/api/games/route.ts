import { NextRequest, NextResponse } from "next/server";
import { createGame } from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Game name is required" }, { status: 400 });
  }

  const game = await createGame(name.slice(0, 80));
  return NextResponse.json({ gameId: game.id });
}
