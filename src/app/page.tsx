"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const { gameId } = await createGame(name.trim());
      router.push(`/game/${gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pokert
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Fibonacci planning poker for your team.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <label
            htmlFor="game-name"
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Game name
          </label>
          <input
            id="game-name"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 42 planning"
            maxLength={80}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="mt-4 w-full rounded-lg bg-indigo-600 cursor-pointer px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create game"}
          </button>
        </form>
      </div>
    </main>
  );
}
