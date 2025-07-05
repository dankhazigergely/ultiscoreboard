"use client";

import { useState, useEffect } from "react";
import type { Player, Round } from "@/lib/types";
import GameSetup from "@/components/game-setup";
import Scoreboard from "@/components/scoreboard";
import ScoringRules from "@/components/scoring-rules";

const GAME_STATE_KEY = 'ultiMokaGameState';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(GAME_STATE_KEY);
      if (savedState) {
        const { gameStarted, players, rounds } = JSON.parse(savedState);
        if (gameStarted && Array.isArray(players) && Array.isArray(rounds)) {
          setGameStarted(gameStarted);
          setPlayers(players);
          setRounds(rounds);
        }
      }
    } catch (error) {
      console.error("Failed to load game state from localStorage:", error);
      localStorage.removeItem(GAME_STATE_KEY);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    try {
      const gameState = { gameStarted, players, rounds };
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game state to localStorage:", error);
    }
  }, [gameStarted, players, rounds, isLoading]);

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
    kontraPlayerIds?: number[] | null,
    sittingOutPlayerId?: number | null,
    gameId?: number | null
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
      kontraPlayerIds,
      sittingOutPlayerId,
      gameId,
    };
    setRounds([...rounds, newRound]);
  };

  const handleResetGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setRounds([]);
    try {
      localStorage.removeItem(GAME_STATE_KEY);
    } catch (error) {
      console.error("Failed to clear game state from localStorage", error);
    }
  };

  const handleDeleteLastRound = () => {
    if (rounds.length === 0) {
      return;
    }

    const lastRound = rounds[rounds.length - 1];
    const restoredPlayers = players.map(player => {
      const scoreChange = lastRound.scores.find(s => s.playerId === player.id)?.change || 0;
      return { ...player, score: player.score - scoreChange };
    });

    setPlayers(restoredPlayers);
    setRounds(rounds.slice(0, -1));
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p>Játék betöltése...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-500 relative">
      <div className="absolute top-6 right-6 z-10">
        <ScoringRules />
      </div>
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
             <svg
                className="w-20 h-16 text-primary"
                viewBox="0 0 120 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(15 10) rotate(-15 20 30)">
                  <rect x="0" y="0" width="40" height="60" rx="4" className="fill-card stroke-current" strokeWidth="2" />
                  <text x="5" y="18" fontFamily="serif" fontSize="16" fontWeight="bold" className="fill-current">F</text>
                </g>
                <g transform="translate(65 10) rotate(15 20 30)">
                  <rect x="0" y="0" width="40" height="60" rx="4" className="fill-card stroke-current" strokeWidth="2" />
                  <text x="5" y="18" fontFamily="serif" fontSize="16" fontWeight="bold" className="fill-current">A</text>
                </g>
                <g transform="translate(40 10)">
                  <rect x="0" y="0" width="40" height="60" rx="4" className="fill-card stroke-current" strokeWidth="2" />
                  <text x="5" y="18" fontFamily="serif" fontSize="16" fontWeight="bold" className="fill-current">K</text>
                </g>
              </svg>
             <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-tight">
               UltiMóka
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
              onDeleteLastRound={handleDeleteLastRound}
            />
          )}
        </main>
      </div>
    </div>
  );
}
