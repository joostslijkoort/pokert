import { NextRequest, NextResponse } from "next/server";
import { getGame, toPublicGame, touchParticipant } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const participantId = req.nextUrl.searchParams.get("participantId");
  if (participantId) touchParticipant(id, participantId);

  const game = getGame(id);

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(toPublicGame(game));
}
