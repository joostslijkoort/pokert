export const FIBONACCI_CARDS = [
  "0",
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "34",
  "55",
  "89",
  "?",
  "☕",
] as const;

export type CardValue = (typeof FIBONACCI_CARDS)[number];

export type Participant = {
  id: string;
  name: string;
  isSpectator: boolean;
  vote: CardValue | null;
  lastSeen: number;
};

export type Game = {
  id: string;
  name: string;
  createdAt: number;
  revealed: boolean;
  participants: Participant[];
};

export type PublicParticipant = {
  id: string;
  name: string;
  isSpectator: boolean;
  hasVoted: boolean;
  vote: CardValue | null;
};

export type PublicGame = {
  id: string;
  name: string;
  revealed: boolean;
  participants: PublicParticipant[];
  average: number | null;
};
