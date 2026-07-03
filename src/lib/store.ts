import { nanoid } from "nanoid";
import type { CardValue, Game, PublicGame } from "./types";

const STALE_PARTICIPANT_MS = 5 * 60 * 1000;

type Store = {
  games: Map<string, Game>;
};

const globalForStore = globalThis as unknown as { pokertStore?: Store };

const store: Store =
  globalForStore.pokertStore ??
  (globalForStore.pokertStore = {
    games: new Map(),
  });

export function createGame(name: string): Game {
  const game: Game = {
    id: nanoid(10),
    name,
    createdAt: Date.now(),
    revealed: false,
    participants: [],
  };
  store.games.set(game.id, game);
  return game;
}

export function getGame(gameId: string): Game | undefined {
  const game = store.games.get(gameId);
  if (!game) return undefined;
  const cutoff = Date.now() - STALE_PARTICIPANT_MS;
  game.participants = game.participants.filter((p) => p.lastSeen >= cutoff);
  return game;
}

export function joinGame(
  gameId: string,
  name: string,
  isSpectator: boolean
): { game: Game; participantId: string } | undefined {
  const game = getGame(gameId);
  if (!game) return undefined;

  const participantId = nanoid(10);
  game.participants.push({
    id: participantId,
    name,
    isSpectator,
    vote: null,
    lastSeen: Date.now(),
  });
  return { game, participantId };
}

export function touchParticipant(gameId: string, participantId: string) {
  const game = getGame(gameId);
  const participant = game?.participants.find((p) => p.id === participantId);
  if (participant) participant.lastSeen = Date.now();
}

export function castVote(
  gameId: string,
  participantId: string,
  vote: CardValue
): Game | undefined {
  const game = getGame(gameId);
  if (!game) return undefined;
  const participant = game.participants.find((p) => p.id === participantId);
  if (!participant || participant.isSpectator) return game;
  participant.vote = vote;
  participant.lastSeen = Date.now();
  return game;
}

export function revealVotes(gameId: string): Game | undefined {
  const game = getGame(gameId);
  if (!game) return undefined;
  game.revealed = true;
  return game;
}

export function resetRound(gameId: string): Game | undefined {
  const game = getGame(gameId);
  if (!game) return undefined;
  game.revealed = false;
  game.participants.forEach((p) => (p.vote = null));
  return game;
}

export function removeParticipant(
  gameId: string,
  participantId: string
): Game | undefined {
  const game = getGame(gameId);
  if (!game) return undefined;
  game.participants = game.participants.filter((p) => p.id !== participantId);
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
