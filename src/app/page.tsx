"use client";

import { useState } from "react";
import type { Player, Round } from "@/lib/types";
import GameSetup from "@/components/game-setup";
import Scoreboard from "@/components/scoreboard";
import { Crown } from "lucide-react";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);

  const handleStartGame = (playerNames: string[]) => {
    setPlayers(
      playerNames.map((name, i) => ({ id: i, name, score: 0 }))
    );
    setRounds([]);
    setGameStarted(true);
  };

  const handleAddRound = (
    scores: { playerId: number; change: number }[],
    ultiPlayerId?: number | null,
    kontraPlayerId?: number | null
  ) => {
    const updatedPlayers = players.map((player) => {
      const scoreChange = scores.find((s) => s.playerId === player.id)?.change || 0;
      return { ...player, score: player.score + scoreChange };
    });
    setPlayers(updatedPlayers);

    const newRound: Round = {
      roundNumber: rounds.length + 1,
      scores,
      ultiPlayerId,
      kontraPlayerId,
    };
    setRounds([...rounds, newRound]);
  };

  const handleResetGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setRounds([]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-500">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
             <Crown className="w-12 h-12 text-primary" />
             <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-tight">
               UltiScoreboard
             </h1>
          </div>
          <p className="mt-2 text-lg text-muted-foreground">
            Kövesd az Ulti kártyajáték pontszámait egyszerűen.
          </p>
        </header>

        <main className="transition-opacity duration-500">
          {!gameStarted ? (
            <GameSetup onStartGame={handleStartGame} />
          ) : (
            <Scoreboard
              players={players}
              rounds={rounds}
              onAddRound={handleAddRound}
              onResetGame={handleResetGame}
            />
          )}
        </main>
      </div>
    </div>
  );
}
