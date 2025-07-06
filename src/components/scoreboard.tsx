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
import { PlusCircle, RotateCw, Swords, Trophy, Download, ArrowRight, ArrowLeft, Trash2 } from "lucide-react";
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
    kontraPlayerIds?: number[] | null,
    sittingOutPlayerId?: number | null,
    gameId?: number | null
  ) => void;
  onResetGame: () => void;
  onDeleteLastRound: () => void;
}

export default function Scoreboard({ players, rounds, onAddRound, onResetGame, onDeleteLastRound }: ScoreboardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedGamePlayerId, setSelectedGamePlayerId] = useState<string | undefined>(undefined);
  const [sittingOutPlayerId, setSittingOutPlayerId] = useState<string | undefined>(undefined);
  const [selectedGameId, setSelectedGameId] = useState<string | undefined>(undefined);
  const [gameWon, setGameWon] = useState<"yes" | "no">("yes");
  const [kontraPlayerIds, setKontraPlayerIds] = useState<number[]>([]);
  const [roundScores, setRoundScores] = useState<Map<number, string>>(new Map());
  const [ultiPlayerId, setUltiPlayerId] = useState<number | null>(null);

  const mainPlayerId = selectedGamePlayerId ? parseInt(selectedGamePlayerId, 10) : null;
  const sittingOutPlayerIdNum = players.length === 4 && sittingOutPlayerId ? parseInt(sittingOutPlayerId, 10) : null;
  const activePlayers = players.filter(p => p.id !== sittingOutPlayerIdNum);
  const otherActivePlayers = mainPlayerId !== null
    ? activePlayers.filter(p => p.id !== mainPlayerId)
    : [];
  const isColorless = selectedGameId ? colorlessGameIds.includes(parseInt(selectedGameId, 10)) : false;

  const resetDialogState = () => {
    setStep(1);
    setSelectedGamePlayerId(undefined);
    setSittingOutPlayerId(undefined);
    setSelectedGameId(undefined);
    setGameWon("yes");
    setKontraPlayerIds([]);
    setRoundScores(new Map());
    setUltiPlayerId(null);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (isOpen) {
      resetDialogState();
    }
  };

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
    if (players.length === 4 && !sittingOutPlayerId) {
      toast({
        title: "Hiányzó adatok",
        description: "Négy játékos esetén ki kell választani a kimaradót.",
        variant: "destructive",
      });
      return;
    }

    const mainPlayerIdNum = parseInt(selectedGamePlayerId, 10);
    const game = scoringData.find(g => g.id === parseInt(selectedGameId, 10));

    if (!game) return;

    const baseScore = parseScoreValue(game.value);
    const newScores = new Map<number, string>();
    const winModifier = gameWon === 'yes' ? 1 : -1;


    if (sittingOutPlayerIdNum !== null) {
      newScores.set(sittingOutPlayerIdNum, "0");
    }
    
    const currentOtherActivePlayers = activePlayers.filter(p => p.id !== mainPlayerIdNum);
    
    if (isColorless) {
      let mainPlayerTotalChange = 0;
      currentOtherActivePlayers.forEach(p => {
        const isKontraPlayer = kontraPlayerIds.includes(p.id);
        const scoreMultiplier = isKontraPlayer ? 2 : 1;
        const scoreForThisPlayer = baseScore * scoreMultiplier * winModifier;
        newScores.set(p.id, String(-scoreForThisPlayer));
        mainPlayerTotalChange += scoreForThisPlayer;
      });
      newScores.set(mainPlayerIdNum, String(mainPlayerTotalChange));
    } else {
      const scoreMultiplier = kontraPlayerIds.length > 0 ? 2 : 1;
      const finalScore = baseScore * scoreMultiplier * winModifier;
      const numOtherPlayers = currentOtherActivePlayers.length;
      newScores.set(mainPlayerIdNum, String(finalScore * numOtherPlayers));
      currentOtherActivePlayers.forEach(p => newScores.set(p.id, String(-finalScore)));
    }


    setRoundScores(newScores);

    // Set the declarer player ID. The property is misnamed 'ultiPlayerId'
    // in the data structure, but it's used to store the declarer ('felvevő').
    // This ensures the declarer is saved for all game types, not just 'ulti'.
    setUltiPlayerId(mainPlayerIdNum);

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
    
    const gameIdNum = selectedGameId ? parseInt(selectedGameId, 10) : null;
    onAddRound(scores, ultiPlayerId, kontraPlayerIds, sittingOutPlayerIdNum, gameIdNum);
    setDialogOpen(false);
  };

  const handleExportCSV = () => {
    if (rounds.length === 0) {
      toast({ title: "Nincs adat", description: "Nincsenek körök az exportáláshoz.", variant: "destructive" });
      return;
    }
    const escapeCsvCell = (cell: string | number | null | undefined) => {
      const strCell = String(cell === null || cell === undefined ? "" : cell);
      return strCell.includes(',') ? `"${strCell.replace(/"/g, '""')}"` : strCell;
    };
    const getPlayerName = (id: number | null | undefined): string => players.find(p => p.id === id)?.name || '';
    const getKontraPlayerNames = (ids: number[] | null | undefined): string => (ids ? ids.map(id => getPlayerName(id)).join(', ') : '');
    const getGameName = (id: number | null | undefined): string => scoringData.find(g => g.id === id)?.name || '';

    const headers = ['Kör', ...players.map(p => escapeCsvCell(p.name)), 'Felvevő', 'Bemondás', 'Kontrát mondta', 'Kimaradt'].join(',');
    const rows = rounds.map(round => [
      round.roundNumber,
      ...players.map(p => round.scores.find(s => s.playerId === p.id)?.change || 0),
      escapeCsvCell(getPlayerName(round.ultiPlayerId)),
      escapeCsvCell(getGameName(round.gameId)),
      escapeCsvCell(getKontraPlayerNames(round.kontraPlayerIds)),
      escapeCsvCell(getPlayerName(round.sittingOutPlayerId))
    ].join(','));
    const totalsRow = ['Összesen', ...players.map(p => p.score), '', '', '', ''].join(',');
    let csvContent = headers + '\n' + rows.join('\n') + '\n' + totalsRow;

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ultimoka_eredmenyek_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLeaderId = () => {
    if (players.length === 0) return null;
    let maxScore = -Infinity;
    let leaders: number[] = [];
    players.forEach(player => {
      if (player.score > maxScore) {
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

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
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
                    <Label htmlFor="game-player">Felvevő játékos</Label>
                    <Select onValueChange={(value) => { setSelectedGamePlayerId(value); if(players.length === 4) setSittingOutPlayerId(undefined); }} value={selectedGamePlayerId}>
                      <SelectTrigger id="game-player">
                        <SelectValue placeholder="Válasszon játékost" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                   {players.length === 4 && selectedGamePlayerId && (
                    <div className="space-y-2">
                      <Label htmlFor="sitting-out-player">Kimaradó játékos</Label>
                      <Select onValueChange={setSittingOutPlayerId} value={sittingOutPlayerId}>
                        <SelectTrigger id="sitting-out-player">
                          <SelectValue placeholder="Válassza ki a kimaradót" />
                        </SelectTrigger>
                        <SelectContent>
                          {players
                            .filter(p => String(p.id) !== selectedGamePlayerId)
                            .map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="game-type">Bemondás</Label>
                    <Select onValueChange={(value) => { setSelectedGameId(value); setKontraPlayerIds([]); }} value={selectedGameId}>
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
                            {otherActivePlayers.map(p => (
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
                                    setKontraPlayerIds(checked ? otherActivePlayers.map(p => p.id) : []);
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
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={rounds.length === 0} className="w-full sm:w-auto bg-card text-card-foreground hover:bg-muted hover:text-muted-foreground">
              <Trash2 className="mr-2 h-4 w-4" /> Utolsó kör törlése
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Biztosan törli az utolsó kört?</AlertDialogTitle>
              <AlertDialogDescription>
                Ez a művelet nem vonható vissza. Ezzel véglegesen törli az utolsó rögzített kört és visszaállítja a pontszámokat az előző állapotra.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mégse</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteLastRound}>Törlés</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
      
      <ScoreHistory players={players} rounds={rounds} onExportCSV={handleExportCSV} />
    </div>
  );
}
