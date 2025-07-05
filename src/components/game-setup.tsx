"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameSetupProps {
  onStartGame: (playerNames: string[]) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [numPlayers, setNumPlayers] = useState(3);
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""]);
  const { toast } = useToast();

  const handleNumPlayersChange = (value: string) => {
    const newNumPlayers = parseInt(value, 10);
    setNumPlayers(newNumPlayers);
    setPlayerNames(Array(newNumPlayers).fill(""));
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerNames.some((name) => name.trim() === "")) {
      toast({
        title: "Hiba",
        description: "Minden játékosnak meg kell adni egy nevet.",
        variant: "destructive",
      });
      return;
    }
    onStartGame(playerNames);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Users className="w-6 h-6" />
          Új Játék Beállítása
        </CardTitle>
        <CardDescription>Adja meg a játékosok számát és nevét a kezdéshez.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="num-players">Játékosok száma</Label>
            <Select
              defaultValue="3"
              onValueChange={handleNumPlayersChange}
            >
              <SelectTrigger id="num-players" className="w-full">
                <SelectValue placeholder="Válassza ki a játékosok számát" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Játékos</SelectItem>
                <SelectItem value="4">4 Játékos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {playerNames.map((name, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`player-${index + 1}`}>{`Játékos ${
                  index + 1
                } neve`}</Label>
                <Input
                  id={`player-${index + 1}`}
                  placeholder={`pl. 'Jancsi'`}
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
            Játék Indítása
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
