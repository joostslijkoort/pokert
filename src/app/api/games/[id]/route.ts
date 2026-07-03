import { NextRequest, NextResponse } from "next/server";
import { getGame, toPublicGame, touchParticipant } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const participantId = req.nextUrl.searchParams.get("participantId");
  const game = participantId
    ? await touchParticipant(id, participantId)
    : await getGame(id);

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(toPublicGame(game, participantId ?? undefined));
}
