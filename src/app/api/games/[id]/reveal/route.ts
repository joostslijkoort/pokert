import { NextRequest, NextResponse } from "next/server";
import { revealVotes, toPublicGame } from "@/lib/store";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const game = revealVotes(id);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  return NextResponse.json(toPublicGame(game));
}
