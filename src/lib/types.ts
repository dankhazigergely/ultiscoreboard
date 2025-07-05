export interface Player {
  id: number;
  name: string;
  score: number;
}

export interface Round {
  roundNumber: number;
  scores: { playerId: number; change: number }[];
  ultiPlayerId?: number | null;
  kontraPlayerId?: number | null;
}
