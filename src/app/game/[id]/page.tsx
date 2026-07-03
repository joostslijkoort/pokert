"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ApiError, fetchGame, joinGame as joinGameApi } from "@/lib/api";
import type { PublicGame } from "@/lib/types";
import JoinForm from "@/components/game/JoinForm";
import GameRoom from "@/components/game/GameRoom";

const POLL_INTERVAL_MS = 1500;

function storageKey(gameId: string) {
  return `pokert:${gameId}:participantId`;
}

export default function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: gameId } = use(params);

  const [game, setGame] = useState<PublicGame | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(storageKey(gameId))
  );
  const [status, setStatus] = useState<"loading" | "ready" | "not-found">(
    "loading"
  );
  const participantIdRef = useRef<string | null>(null);

  useEffect(() => {
    participantIdRef.current = participantId;
  }, [participantId]);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchGame(gameId, participantIdRef.current);
      setGame(data);

      const storedId = participantIdRef.current;
      if (storedId && !data.participants.some((p) => p.id === storedId)) {
        window.localStorage.removeItem(storageKey(gameId));
        setParticipantId(null);
      }

      setStatus("ready");
    } catch (err) {
      // A 404 means the game genuinely no longer exists. Any other failure
      // (network blip, transient server error) shouldn't kick everyone else
      // in the room out — just skip this poll and retry on the next tick.
      if (err instanceof ApiError && err.status === 404) {
        setStatus("not-found");
      }
    }
  }, [gameId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [gameId, refresh]);

  async function handleJoin(name: string, isSpectator: boolean) {
    const { participantId: newId, game: updated } = await joinGameApi(
      gameId,
      name,
      isSpectator
    );
    window.localStorage.setItem(storageKey(gameId), newId);
    setParticipantId(newId);
    setGame(updated);
  }

  if (status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-400">Loading...</p>
      </main>
    );
  }

  if (status === "not-found" || !game) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Game not found
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          This game may have expired or the link is incorrect.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Start a new game
        </Link>
      </main>
    );
  }

  const me = participantId
    ? game.participants.find((p) => p.id === participantId)
    : undefined;

  if (!participantId || !me) {
    return <JoinForm gameName={game.name} onJoin={handleJoin} />;
  }

  return (
    <GameRoom
      game={game}
      participantId={participantId}
      isSpectator={me.isSpectator}
      onGameUpdate={setGame}
    />
  );
}
