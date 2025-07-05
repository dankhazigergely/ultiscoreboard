"use client";

import { useState } from "react";
import type { Player, Round } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, PlusCircle, RotateCw, Swords, Trophy, Download } from "lucide-react";
import ScoreHistory from "./score-history";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ScoreboardProps {
  players: Player[];
  rounds: Round[];
  onAddRound: (
    scores: { playerId: number; change: number }[],
    ultiPlayerId?: number | null,
    kontraPlayerId?: number | null
  ) => void;
  onResetGame: () => void;
}

export default function Scoreboard({ players, rounds, onAddRound, onResetGame }: ScoreboardProps) {
  const [roundScores, setRoundScores] = useState<Map<number, string>>(new Map());
  const [ultiPlayerId, setUltiPlayerId] = useState<number | null>(null);
  const [kontraPlayerId, setKontraPlayerId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitialInput, setIsInitialInput] = useState(true);
  const { toast } = useToast();

  const handleScoreChange = (playerId: number, value: string) => {
    const newScores = new Map(roundScores);

    if (isInitialInput) {
      const newInitialScores = new Map<number, string>();
      players.forEach(p => newInitialScores.set(p.id, ""));
      newInitialScores.set(playerId, value);
      setRoundScores(newInitialScores);
    } else {
      newScores.set(playerId, value);
      setRoundScores(newScores);
    }
  };
  
  const handleScoreBlur = (playerId: number) => {
    if (!isInitialInput) return;

    const value = roundScores.get(playerId);
    if (!value || value.trim() === "") return;

    const score = parseInt(value, 10);
    if (isNaN(score)) return;

    const newScores = new Map(roundScores);
    const scoreToDistribute = -score;
    const otherPlayers = players.filter((p) => p.id !== playerId);
    const numOtherPlayers = otherPlayers.length;

    if (numOtherPlayers > 0) {
      const baseScore = Math.trunc(scoreToDistribute / numOtherPlayers);
      let remainder = scoreToDistribute % numOtherPlayers;

      otherPlayers.forEach((p) => {
        let distributedScore = baseScore;
        if (remainder !== 0) {
          distributedScore += Math.sign(remainder);
          remainder -= Math.sign(remainder);
        }
        newScores.set(p.id, String(distributedScore));
      });
    }
    setRoundScores(newScores);
    setIsInitialInput(false);
  };


  const handleAddRoundSubmit = () => {
    const scores = players.map((p) => ({
      playerId: p.id,
      change: parseInt(roundScores.get(p.id) || "0", 10) || 0,
    }));
    
    const sum = scores.reduce((acc, s) => acc + s.change, 0);
    if (sum !== 0) {
       toast({
        title: "Érvénytelen pontok",
        description: "A pontok összegének nullának kell lennie.",
        variant: "destructive",
      });
      return;
    }

    onAddRound(scores, ultiPlayerId, kontraPlayerId);
    setDialogOpen(false);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (isOpen) {
        setRoundScores(new Map(players.map(p => [p.id, ""])));
        setUltiPlayerId(null);
        setKontraPlayerId(null);
        setIsInitialInput(true);
    }
  }

  const handleExportCSV = () => {
    if (rounds.length === 0) {
      toast({
        title: "Nincs adat",
        description: "Nincsenek körök az exportáláshoz.",
        variant: "destructive",
      });
      return;
    }

    const escapeCsvCell = (cell: string | number | null | undefined) => {
      const strCell = String(cell === null || cell === undefined ? "" : cell);
      if (strCell.includes(',')) {
        return `"${strCell.replace(/"/g, '""')}"`;
      }
      return strCell;
    };

    const getPlayerName = (id: number | null | undefined) => {
      if (id === null || id === undefined) return '';
      return players.find(p => p.id === id)?.name || '';
    };

    const headers = [
      'Kör',
      ...players.map(p => escapeCsvCell(p.name)),
      'Ultit mondta',
      'Kontrát mondta'
    ].join(',');

    const rows = rounds.map(round => {
      const rowData = [
        round.roundNumber,
        ...players.map(p => {
          const score = round.scores.find(s => s.playerId === p.id);
          return score ? score.change : 0;
        }),
        escapeCsvCell(getPlayerName(round.ultiPlayerId)),
        escapeCsvCell(getPlayerName(round.kontraPlayerId))
      ];
      return rowData.join(',');
    });

    const totalsRow = [
      'Összesen',
      ...players.map(p => p.score),
      '',
      ''
    ].join(',');

    let csvContent = headers + '\n' + rows.join('\n') + '\n' + totalsRow;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `ultimoka_eredmenyek_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getLeaderId = () => {
    if (players.length === 0) return null;
    let maxScore = -Infinity;
    let leaders: number[] = [];
    players.forEach(player => {
      if(player.score > maxScore){
        maxScore = player.score;
        leaders = [player.id];
      } else if (player.score === maxScore) {
        leaders.push(player.id);
      }
    });
    return leaders.length === 1 ? leaders[0] : null;
  };

  const leaderId = getLeaderId();

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-center mb-4 text-primary">Jelenlegi Állás</h2>
        <div className={`grid gap-4 sm:gap-6 grid-cols-1 ${players.length === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-4'}`}>
          {players.map((player) => (
            <Card key={player.id} className={`shadow-md transition-all duration-300 ${leaderId === player.id ? 'border-primary border-2 shadow-lg scale-105' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium truncate">{player.name}</CardTitle>
                {leaderId === player.id && <Trophy className="h-5 w-5 text-amber-500" />}
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{player.score}</div>
                <p className="text-xs text-muted-foreground">pont</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Új Kör Hozzáadása
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Új Kör Pontszámai</DialogTitle>
              <DialogDescription>
                Adja meg az egyes játékosok által ebben a körben szerzett vagy elvesztett pontokat. Az összegnek 0-nak kell lennie.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {players.map((player) => (
                <div key={player.id} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`score-${player.id}`} className="text-right col-span-1 truncate pr-2">
                    {player.name}
                  </Label>
                  <Input
                    id={`score-${player.id}`}
                    type="number"
                    step="1"
                    placeholder="0"
                    className="col-span-3"
                    value={roundScores.get(player.id) || ""}
                    onChange={(e) => handleScoreChange(player.id, e.target.value)}
                    onBlur={() => handleScoreBlur(player.id)}
                  />
                </div>
              ))}
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ulti-caller" className="text-right col-span-1 flex items-center justify-end gap-1"><Crown className="h-4 w-4" /> Ulti</Label>
                  <Select onValueChange={(val) => setUltiPlayerId(val === "none" ? null : Number(val))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Válasszon játékost" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nincs</SelectItem>
                      {players.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kontra-caller" className="text-right col-span-1 flex items-center justify-end gap-1"><Swords className="h-4 w-4" /> Kontra</Label>
                   <Select onValueChange={(val) => setKontraPlayerId(val === "none" ? null : Number(val))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Válasszon játékost" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nincs</SelectItem>
                      {players.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Mégse</Button>
              </DialogClose>
              <Button type="submit" onClick={handleAddRoundSubmit} className="bg-accent hover:bg-accent/90">Kör Mentése</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" onClick={handleExportCSV} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Exportálás (CSV)
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
             <Button variant="destructive" className="w-full sm:w-auto">
                <RotateCw className="mr-2 h-4 w-4" /> Játék Törlése
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Biztosan törli a játékot?</AlertDialogTitle>
              <AlertDialogDescription>
                Ez a művelet nem vonható vissza. Ezzel véglegesen törli a jelenlegi játékadatokat.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mégse</AlertDialogCancel>
              <AlertDialogAction onClick={onResetGame}>Törlés</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
      
      <ScoreHistory players={players} rounds={rounds} />
    </div>
  );
}
