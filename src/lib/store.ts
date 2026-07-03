import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";
import type { CardValue, Game, PublicGame } from "./types";

const STALE_PARTICIPANT_MS = 5 * 60 * 1000;
const GAME_TTL_SECONDS = 6 * 60 * 60;

const redis = Redis.fromEnv();

function gameKey(gameId: string) {
  return `game:${gameId}`;
}

async function writeGame(game: Game): Promise<void> {
  await redis.set(gameKey(game.id), game, { ex: GAME_TTL_SECONDS });
}

export async function createGame(name: string): Promise<Game> {
  const game: Game = {
    id: nanoid(10),
    name,
    createdAt: Date.now(),
    revealed: false,
    participants: [],
  };
  await writeGame(game);
  return game;
}

export async function getGame(gameId: string): Promise<Game | undefined> {
  const game = await redis.get<Game>(gameKey(gameId));
  if (!game) return undefined;

  const cutoff = Date.now() - STALE_PARTICIPANT_MS;
  const activeParticipants = game.participants.filter((p) => p.lastSeen >= cutoff);
  if (activeParticipants.length !== game.participants.length) {
    game.participants = activeParticipants;
    await writeGame(game);
  }
  return game;
}

export async function joinGame(
  gameId: string,
  name: string,
  isSpectator: boolean
): Promise<{ game: Game; participantId: string } | undefined> {
  const game = await getGame(gameId);
  if (!game) return undefined;

  const participantId = nanoid(10);
  game.participants.push({
    id: participantId,
    name,
    isSpectator,
    vote: null,
    lastSeen: Date.now(),
  });
  await writeGame(game);
  return { game, participantId };
}

export async function touchParticipant(
  gameId: string,
  participantId: string
): Promise<Game | undefined> {
  const game = await getGame(gameId);
  if (!game) return undefined;
  const participant = game.participants.find((p) => p.id === participantId);
  if (participant) {
    participant.lastSeen = Date.now();
    await writeGame(game);
  }
  return game;
}

export async function castVote(
  gameId: string,
  participantId: string,
  vote: CardValue
): Promise<Game | undefined> {
  const game = await getGame(gameId);
  if (!game) return undefined;
  const participant = game.participants.find((p) => p.id === participantId);
  if (!participant || participant.isSpectator) return game;
  participant.vote = vote;
  participant.lastSeen = Date.now();
  await writeGame(game);
  return game;
}

export async function revealVotes(gameId: string): Promise<Game | undefined> {
  const game = await getGame(gameId);
  if (!game) return undefined;
  game.revealed = true;
  await writeGame(game);
  return game;
}

export async function resetRound(gameId: string): Promise<Game | undefined> {
  const game = await getGame(gameId);
  if (!game) return undefined;
  game.revealed = false;
  game.participants.forEach((p) => (p.vote = null));
  await writeGame(game);
  return game;
}

export async function removeParticipant(
  gameId: string,
  participantId: string
): Promise<Game | undefined> {
  const game = await getGame(gameId);
  if (!game) return undefined;
  game.participants = game.participants.filter((p) => p.id !== participantId);
  await writeGame(game);
  return game;
}

export function toPublicGame(game: Game, viewerId?: string): PublicGame {
  const numericVotes = game.participants
    .filter((p) => !p.isSpectator && p.vote !== null && !Number.isNaN(Number(p.vote)))
    .map((p) => Number(p.vote));

  const average =
    game.revealed && numericVotes.length > 0
      ? Math.round(
          (numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length) *
            10
        ) / 10
      : null;

  return {
    id: game.id,
    name: game.name,
    revealed: game.revealed,
    average,
    participants: game.participants.map((p) => ({
      id: p.id,
      name: p.name,
      isSpectator: p.isSpectator,
      hasVoted: p.vote !== null,
      vote: game.revealed || p.id === viewerId ? p.vote : null,
    })),
  };
}
