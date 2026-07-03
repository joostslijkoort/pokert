import type { CardValue, PublicGame } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error ?? "Something went wrong", res.status);
  }
  return data as T;
}

export function createGame(name: string) {
  return request<{ gameId: string }>("/api/games", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function fetchGame(gameId: string, participantId?: string | null) {
  const query = participantId
    ? `?participantId=${encodeURIComponent(participantId)}`
    : "";
  return request<PublicGame>(`/api/games/${gameId}${query}`);
}

export function joinGame(
  gameId: string,
  name: string,
  isSpectator: boolean
) {
  return request<{ participantId: string; game: PublicGame }>(
    `/api/games/${gameId}/join`,
    {
      method: "POST",
      body: JSON.stringify({ name, isSpectator }),
    }
  );
}

export function castVote(
  gameId: string,
  participantId: string,
  vote: CardValue
) {
  return request<PublicGame>(`/api/games/${gameId}/vote`, {
    method: "POST",
    body: JSON.stringify({ participantId, vote }),
  });
}

export function revealVotes(gameId: string) {
  return request<PublicGame>(`/api/games/${gameId}/reveal`, {
    method: "POST",
  });
}

export function resetRound(gameId: string) {
  return request<PublicGame>(`/api/games/${gameId}/reset`, {
    method: "POST",
  });
}
