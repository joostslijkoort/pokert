import { NextRequest, NextResponse } from "next/server";
import { joinGame } from "@/lib/store";
import { toPublicGame } from "@/lib/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const isSpectator = Boolean(body?.isSpectator);

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const result = joinGame(id, name.slice(0, 40), isSpectator);
  if (!result) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json({
    participantId: result.participantId,
    game: toPublicGame(result.game, result.participantId),
  });
}
