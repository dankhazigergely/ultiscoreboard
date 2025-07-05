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
    { id: 1, name: "parti (színjáték)", value: "1" },
    { id: 2, name: "piros parti (piros színjáték)", value: "2" },
    { id: 3, name: "40 -100", value: "4" },
    { id: 4, name: "négy ász + parti", value: "4+1" },
    { id: 5, name: "ultimó (ulti) + parti", value: "4+1" },
    { id: 6, name: "betli", value: "5" },
    { id: 7, name: "durchmars", value: "6" },
    { id: 8, name: "piros 40-100", value: "8" },
    { id: 9, name: "20 -100", value: "8" },
    { id: 10, name: "piros négy ász + piros parti", value: "8+2" },
    { id: 11, name: "piros ultimó ( piros ulti)+ piros parti", value: "8+2" },
    { id: 12, name: "piros betli", value: "10" },
    { id: 13, name: "piros durchmars vagy redurchmars", value: "12" },
    { id: 14, name: "piros 20-100", value: "16" },
    { id: 15, name: "terített betli", value: "20" },
    { id: 16, name: "terített durchmars", value: "24" },
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
                  <TableHead className="w-[80px]">Sorszám</TableHead>
                  <TableHead>A játék neve</TableHead>
                  <TableHead className="text-right">A játék értéke</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoringData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{item.value}</TableCell>
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
