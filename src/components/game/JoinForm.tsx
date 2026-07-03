"use client";

import { useState } from "react";

type Props = {
  gameName: string;
  onJoin: (name: string, isSpectator: boolean) => Promise<void>;
};

export default function JoinForm({ gameName, onJoin }: Props) {
  const [name, setName] = useState("");
  const [isSpectator, setIsSpectator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await onJoin(name.trim(), isSpectator);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game");
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Joining
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {gameName}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <label
            htmlFor="player-name"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Your name
          </label>
          <input
            id="player-name"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Joost"
            maxLength={40}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />

          <label className="mt-4 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isSpectator}
              onChange={(e) => setIsSpectator(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-700"
            />
            Join as spectator (won&apos;t vote)
          </label>

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="mt-4 w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join game"}
          </button>
        </form>
      </div>
    </main>
  );
}
