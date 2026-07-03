"use client";

import type { PublicParticipant } from "@/lib/types";

type Props = {
  participants: PublicParticipant[];
  revealed: boolean;
  currentParticipantId: string;
};

export default function ParticipantList({
  participants,
  revealed,
  currentParticipantId,
}: Props) {
  const voters = participants.filter((p) => !p.isSpectator);
  const spectators = participants.filter((p) => p.isSpectator);

  return (
    <div className="w-full max-w-md space-y-4">
      <ul className="space-y-2">
        {voters.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {p.name}
              {p.id === currentParticipantId && (
                <span className="ml-1 text-zinc-400">(you)</span>
              )}
            </span>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm font-semibold ${
                revealed
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
                  : p.hasVoted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              }`}
            >
              {revealed ? (p.vote ?? "–") : p.hasVoted ? "✓" : ""}
            </span>
          </li>
        ))}
      </ul>

      {spectators.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Spectators
          </p>
          <ul className="flex flex-wrap gap-2">
            {spectators.map((p) => (
              <li
                key={p.id}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {p.name}
                {p.id === currentParticipantId && " (you)"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
