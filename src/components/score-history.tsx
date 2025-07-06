import type { Player, Round } from "@/lib/types";
import { scoringData } from "@/lib/scoring";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
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
import { Swords, UserX, Download, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ScoreHistoryProps {
  players: Player[];
  rounds: Round[];
  onExportCSV: () => void;
}

export default function ScoreHistory({ players, rounds, onExportCSV }: ScoreHistoryProps) {
  if (rounds.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-8">
        Még nincsenek rögzített körök.
      </div>
    );
  }

  const getPlayerName = (id: number | null | undefined) => {
    if (id === null || id === undefined) return "-";
    return players.find(p => p.id === id)?.name || "Ismeretlen";
  }

  const getGameName = (id: number | null | undefined) => {
    if (id === null || id === undefined) return "-";
    return scoringData.find(g => g.id === id)?.name || "Ismeretlen";
  }

  return (
    <div className="mt-8">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
            <AccordionPrimitive.Header className="flex items-center justify-between py-4">
                <AccordionPrimitive.Trigger className="flex items-center gap-2 text-2xl font-bold text-primary hover:underline [&[data-state=open]>svg]:rotate-180">
                    <span>Játék Története</span>
                    <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                </AccordionPrimitive.Trigger>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onExportCSV}
                    className="bg-card text-card-foreground hover:bg-muted hover:text-muted-foreground"
                >
                    <Download className="h-5 w-5" />
                    <span className="sr-only">Exportálás (CSV)</span>
                </Button>
            </AccordionPrimitive.Header>
          <AccordionContent>
            <Card className="shadow-md">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Kör</TableHead>
                        {players.map((player) => (
                          <TableHead key={player.id} className="text-center">{player.name}</TableHead>
                        ))}
                        <TableHead>Felvevő</TableHead>
                        <TableHead>Bemondás</TableHead>
                        <TableHead>Kontrák</TableHead>
                        {players.length === 4 && <TableHead>Kimaradt</TableHead>}
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
                          <TableCell>{getPlayerName(round.ultiPlayerId)}</TableCell>
                          <TableCell className="min-w-[120px]">{getGameName(round.gameId)}</TableCell>
                          <TableCell>
                            {round.kontraPlayerIds && round.kontraPlayerIds.length > 0 && (
                                <Badge variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-800 border-red-200">
                                    <Swords className="h-3 w-3" />
                                    <span className="hidden sm:inline">{round.kontraPlayerIds.map(id => getPlayerName(id)).join(', ')}</span>
                                </Badge>
                            )}
                          </TableCell>
                          {players.length === 4 && (
                            <TableCell>
                               {round.sittingOutPlayerId !== null && round.sittingOutPlayerId !== undefined && (
                                    <Badge variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-800 border-gray-200">
                                        <UserX className="h-3 w-3" />
                                        <span className="hidden sm:inline">{getPlayerName(round.sittingOutPlayerId)}</span>
                                    </Badge>
                                )}
                            </TableCell>
                          )}
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
