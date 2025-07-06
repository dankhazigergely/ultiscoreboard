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
import { scoringData } from "@/lib/scoring";

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
                  <TableHead>A játék neve</TableHead>
                  <TableHead className="text-right">A játék értéke</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scoringData.map((item) => (
                  <TableRow key={item.id}>
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
