import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const scoringData = [
  { game: "Ulti", points: "4", description: "Az utolsó adut (ulti) elviszi a játékos." },
  { game: "Betli", points: "5", description: "A játékos egyetlen ütést sem visz el." },
  { game: "40-100", points: "8", description: "A játékos bemondja és teljesíti a 40-et és a 100-at is." },
  { game: "Durchmarsch", points: "6", description: "A játékos az összes ütést elviszi." },
  { game: "Csendes 100", points: "4", description: "Bejelentés nélküli 100 pont elérése." },
  { game: "Csendes 4 ász", points: "8", description: "Bejelentés nélküli 4 ász ütés." },
  { game: "Csendes Ulti bukás", points: "8", description: "Az ultit nem sikerül elvinni (csendesen)." },
  { game: "Kontra", points: "x2", description: "Duplázza a játék pontértékét." },
  { game: "Rekontra", points: "x4", description: "Négyszerezi a játék pontértékét." },
  { game: "Szubkontra", points: "x8", description: "Nyolcszorozza a játék pontértékét." },
  { game: "Hirschkontra", points: "x16", description: "Tizenhatszorozza a játék pontértékét." },
];

export default function ScoringRules() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Pontozási szabályok</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Ulti Pontozási Szabályok</SheetTitle>
          <SheetDescription>
            Áttekintés a leggyakoribb licitekről és pontértékeikről.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-6rem)] mt-4 pr-4">
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Játék</TableHead>
                  <TableHead className="text-center">Pont</TableHead>
                  <TableHead>Leírás</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoringData.map((item) => (
                  <TableRow key={item.game}>
                    <TableCell className="font-medium">{item.game}</TableCell>
                    <TableCell className="text-center">{item.points}</TableCell>
                    <TableCell>{item.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
