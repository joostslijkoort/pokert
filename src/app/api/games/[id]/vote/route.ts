import { NextRequest, NextResponse } from "next/server";
import { castVote, toPublicGame } from "@/lib/store";
import { FIBONACCI_CARDS } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const participantId =
    typeof body?.participantId === "string" ? body.participantId : "";
  const vote = body?.vote;

  if (!participantId || !FIBONACCI_CARDS.includes(vote)) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  const game = castVote(id, participantId, vote);
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(toPublicGame(game, participantId));
}
