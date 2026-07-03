"use client";

import { useEffect, useState } from "react";
import { castVote, resetRound, revealVotes } from "@/lib/api";
import { FIBONACCI_CARDS, type CardValue, type PublicGame } from "@/lib/types";
import Card from "./Card";
import ParticipantList from "./ParticipantList";

type Props = {
  game: PublicGame;
  participantId: string;
  isSpectator: boolean;
  onGameUpdate: (game: PublicGame) => void;
};

export default function GameRoom({
  game,
  participantId,
  isSpectator,
  onGameUpdate,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const me = game.participants.find((p) => p.id === participantId);
  const myVote = me?.vote ?? null;

  async function handleVote(value: CardValue) {
    setPending(true);
    try {
      const updated = await castVote(game.id, participantId, value);
      onGameUpdate(updated);
    } finally {
      setPending(false);
    }
  }

  async function handleReveal() {
    setPending(true);
    try {
      onGameUpdate(await revealVotes(game.id));
    } finally {
      setPending(false);
    }
  }

  async function handleReset() {
    setPending(true);
    try {
      onGameUpdate(await resetRound(game.id));
    } finally {
      setPending(false);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
  }

  const voters = game.participants.filter((p) => !p.isSpectator);
  const votedCount = voters.filter((p) => p.hasVoted).length;

  return (
    <main className="flex flex-1 flex-col items-center gap-8 bg-zinc-50 px-4 py-10 dark:bg-black">
      <header className="w-full max-w-2xl text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {game.name}
        </h1>
        <button
          type="button"
          onClick={handleCopyLink}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          {copied ? "Link copied!" : "Copy invite link"}
        </button>
      </header>

      <section className="flex w-full max-w-2xl flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {game.revealed ? (
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Average
            </p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {game.average ?? "–"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {votedCount} / {voters.length} voted
          </p>
        )}

        <div className="flex gap-2">
          {!game.revealed ? (
            <button
              type="button"
              onClick={handleReveal}
              disabled={pending || votedCount === 0}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reveal votes
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              disabled={pending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              New round
            </button>
          )}
        </div>
      </section>

      <ParticipantList
        participants={game.participants}
        revealed={game.revealed}
        currentParticipantId={participantId}
      />

      {!isSpectator && (
        <section className="w-full max-w-2xl">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-zinc-400">
            Pick your card
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {FIBONACCI_CARDS.map((value) => (
              <Card
                key={value}
                value={value}
                selected={myVote === value}
                disabled={pending || game.revealed}
                onClick={() => handleVote(value)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
