import type { Player, Round } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Swords } from "lucide-react";

interface ScoreHistoryProps {
  players: Player[];
  rounds: Round[];
}

export default function ScoreHistory({ players, rounds }: ScoreHistoryProps) {
  if (rounds.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-8">
        Még nincsenek rögzített körök.
      </div>
    );
  }

  const getPlayerName = (id: number | null | undefined) => {
    if (id === null || id === undefined) return null;
    return players.find(p => p.id === id)?.name || null;
  }

  return (
    <div className="mt-8">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-bold text-primary hover:no-underline">
            Játék Története
          </AccordionTrigger>
          <AccordionContent>
            <Card className="shadow-md">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Kör</TableHead>
                        {players.map((player) => (
                          <TableHead key={player.id} className="text-center">{player.name}</TableHead>
                        ))}
                        <TableHead className="text-right">Megjegyzések</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rounds.slice().reverse().map((round) => (
                        <TableRow key={round.roundNumber}>
                          <TableCell className="font-medium">{round.roundNumber}.</TableCell>
                          {players.map((player) => {
                            const scoreChange = round.scores.find(
                              (s) => s.playerId === player.id
                            )?.change || 0;
                            return (
                              <TableCell key={player.id} className="text-center font-semibold">
                                {scoreChange > 0 ? `+${scoreChange}` : scoreChange === 0 ? "—" : scoreChange}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end items-center">
                              {round.ultiPlayerId !== null && round.ultiPlayerId !== undefined && (
                                  <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
                                      <Crown className="h-3 w-3" />
                                      <span className="hidden sm:inline">{getPlayerName(round.ultiPlayerId)}</span>
                                  </Badge>
                              )}
                              {round.kontraPlayerId !== null && round.kontraPlayerId !== undefined && (
                                  <Badge variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-800 border-red-200">
                                      <Swords className="h-3 w-3" />
                                      <span className="hidden sm:inline">{getPlayerName(round.kontraPlayerId)}</span>
                                  </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
