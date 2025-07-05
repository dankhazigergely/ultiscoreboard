"use client";

import { useState } from "react";
import type { Player, Round } from "@/lib/types";
import { scoringData, parseScoreValue, colorlessGameIds } from "@/lib/scoring";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, PlusCircle, RotateCw, Swords, Trophy, Download, ArrowRight, ArrowLeft } from "lucide-react";
import ScoreHistory from "./score-history";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface ScoreboardProps {
  players: Player[];
  rounds: Round[];
  onAddRound: (
    scores: { playerId: number; change: number }[],
    ultiPlayerId?: number | null,
    kontraPlayerIds?: number[] | null
  ) => void;
  onResetGame: () => void;
}

export default function Scoreboard({ players, rounds, onAddRound, onResetGame }: ScoreboardProps) {
  const [roundScores, setRoundScores] = useState<Map<number, string>>(new Map());
  const [ultiPlayerId, setUltiPlayerId] = useState<number | null>(null);
  const [kontraPlayerIds, setKontraPlayerIds] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedGamePlayerId, setSelectedGamePlayerId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameWon, setGameWon] = useState<"yes" | "no">("yes");


  const handleScoreChange = (playerId: number, value: string) => {
    const newScores = new Map(roundScores);
    newScores.set(playerId, value);
    setRoundScores(newScores);
  };
  
  const handleNextStep = () => {
    if (!selectedGamePlayerId || !selectedGameId) {
      toast({
        title: "Hiányzó adatok",
        description: "Kérlek válassz játékost és játékot a folytatáshoz.",
        variant: "destructive",
      });
      return;
    }
    
    const mainPlayerId = parseInt(selectedGamePlayerId, 10);
    const game = scoringData.find(g => g.id === parseInt(selectedGameId, 10));
    if (!game) return;
    
    let baseScore = parseScoreValue(game.value);
    
    const isColorless = colorlessGameIds.includes(game.id);
    if (kontraPlayerIds.length > 0) {
      if (isColorless) {
        // For colorless games, score doubles for each kontra (2^n)
        const multiplier = 2 ** kontraPlayerIds.length;
        baseScore *= multiplier;
      } else {
        // For color games, simple double
        baseScore *= 2;
      }
    }

    const newScores = new Map<number, string>();
    const otherPlayers = players.filter(p => p.id !== mainPlayerId);
    const numOtherPlayers = otherPlayers.length;

    if (gameWon === 'yes') {
      newScores.set(String(mainPlayerId), String(baseScore * numOtherPlayers));
      otherPlayers.forEach(p => newScores.set(String(p.id), String(-baseScore)));
    } else { // gameLost
      newScores.set(String(mainPlayerId), String(-baseScore * numOtherPlayers));
      otherPlayers.forEach(p => newScores.set(String(p.id), String(baseScore)));
    }

    const finalScores = new Map<number, string>();
    newScores.forEach((value, key) => {
      finalScores.set(parseInt(key, 10), value);
    });

    setRoundScores(finalScores);
    
    // Automatically set ulti player if the game involves it
    if (game.name.toLowerCase().includes("ulti") || game.name.toLowerCase().includes("ultimó")) {
      setUltiPlayerId(mainPlayerId);
    } else {
      setUltiPlayerId(null);
    }
    
    setStep(2);
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

    onAddRound(scores, ultiPlayerId, kontraPlayerIds);
    setDialogOpen(false);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (isOpen) {
        // Reset all states for the dialog
        setStep(1);
        setRoundScores(new Map());
        setUltiPlayerId(null);
        setKontraPlayerIds([]);
        setSelectedGamePlayerId(null);
        setSelectedGameId(null);
        setGameWon("yes");
    }
  };

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

    const getPlayerName = (id: number | null | undefined): string => {
      if (id === null || id === undefined) return '';
      return players.find(p => p.id === id)?.name || '';
    };

    const getKontraPlayerNames = (ids: number[] | null | undefined): string => {
        if (!ids || ids.length === 0) return '';
        return ids.map(id => getPlayerName(id)).join(', ');
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
        escapeCsvCell(getKontraPlayerNames(round.kontraPlayerIds))
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

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
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

  const mainPlayerId = selectedGamePlayerId ? parseInt(selectedGamePlayerId, 10) : null;
  const otherPlayers = mainPlayerId !== null ? players.filter(p => p.id !== mainPlayerId) : [];
  const isColorless = selectedGameId ? colorlessGameIds.includes(parseInt(selectedGameId, 10)) : false;

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
            {step === 1 && (
              <>
                <DialogHeader>
                  <DialogTitle>Új Kör (1/2): Játék részletei</DialogTitle>
                  <DialogDescription>
                    Válassza ki a játékost, a bemondott játékot és az eredményt.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="game-player">Játékos</Label>
                    <Select onValueChange={setSelectedGamePlayerId} value={selectedGamePlayerId || undefined}>
                      <SelectTrigger id="game-player">
                        <SelectValue placeholder="Válasszon játékost" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="game-type">Játék típusa</Label>
                    <Select onValueChange={setSelectedGameId} value={selectedGameId || undefined}>
                      <SelectTrigger id="game-type">
                        <SelectValue placeholder="Válasszon játékot" />
                      </SelectTrigger>
                      <SelectContent>
                        {scoringData.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name} ({g.value} pont)</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label>Eredmény</Label>
                    <RadioGroup defaultValue="yes" onValueChange={(val: "yes" | "no") => setGameWon(val)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="r-won" />
                            <Label htmlFor="r-won">Nyert</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="r-lost" />
                            <Label htmlFor="r-lost">Vesztett</Label>
                        </div>
                    </RadioGroup>
                  </div>

                  {selectedGamePlayerId && selectedGameId && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1"><Swords className="h-4 w-4" /> Kontra</Label>
                      {isColorless ? (
                        <div className="space-y-2 rounded-md border p-4">
                            <Label className="text-sm text-muted-foreground">Ki mondott kontrát?</Label>
                            {otherPlayers.map(p => (
                                <div key={p.id} className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id={`kontra-check-${p.id}`}
                                        checked={kontraPlayerIds.includes(p.id)}
                                        onCheckedChange={(checked) => {
                                            const newIds = checked 
                                                ? [...kontraPlayerIds, p.id] 
                                                : kontraPlayerIds.filter(id => id !== p.id);
                                            setKontraPlayerIds(newIds);
                                        }}
                                    />
                                    <Label htmlFor={`kontra-check-${p.id}`} className="font-normal">{p.name}</Label>
                                </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 rounded-md border p-4 justify-between">
                            <Label htmlFor="kontra-switch" className="font-normal">Mindenki kontrázott?</Label>
                            <Switch
                                id="kontra-switch"
                                checked={kontraPlayerIds.length > 0}
                                onCheckedChange={(checked) => {
                                    setKontraPlayerIds(checked ? otherPlayers.map(p => p.id) : []);
                                }}
                            />
                        </div>
                      )}
                    </div>
                  )}

                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Mégse</Button>
                  </DialogClose>
                  <Button onClick={handleNextStep} className="bg-accent hover:bg-accent/90">
                    Tovább <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogFooter>
              </>
            )}
            {step === 2 && (
              <>
                <DialogHeader>
                  <DialogTitle>Új Kör (2/2): Pontok</DialogTitle>
                  <DialogDescription>
                    Ellenőrizze vagy módosítsa a pontokat. Az összegnek 0-nak kell lennie.
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
                      />
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Vissza
                  </Button>
                  <Button type="submit" onClick={handleAddRoundSubmit} className="bg-accent hover:bg-accent/90">Kör Mentése</Button>
                </DialogFooter>
              </>
            )}
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
              </Description>
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
