import { useState } from "react";
import { lotteryHistory, getResultsByYear, getResultsByMonth } from "@/data/lotteryHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface HistoricalDataTableProps {
  highlightPattern?: string;
}

export const HistoricalDataTable = ({ highlightPattern }: HistoricalDataTableProps) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResults = (() => {
    let results = selectedMonth === "all" 
      ? getResultsByYear(selectedYear)
      : getResultsByMonth(selectedYear, selectedMonth as number);
    
    if (searchTerm) {
      results = results.filter(r => 
        r.result.includes(searchTerm) || 
        r.draw.includes(searchTerm) ||
        r.lottery.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return results;
  })();

  const isHighlighted = (result: string) => {
    if (!highlightPattern) return false;
    return result.includes(highlightPattern) || result.slice(-3) === highlightPattern;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Lottery Results</CardTitle>
        <CardDescription>
          Browse past winning numbers and patterns ({lotteryHistory.length} total records)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(v === "all" ? "all" : Number(v))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <SelectItem key={month} value={month.toString()}>
                  {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search result, draw, or lottery..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="rounded-md border max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Lottery</TableHead>
                <TableHead>Draw</TableHead>
                <TableHead>Winning Number</TableHead>
                <TableHead>Last 4</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result, index) => (
                  <TableRow key={index} className={isHighlighted(result.result) ? "bg-primary/10" : ""}>
                    <TableCell className="font-medium">{result.date}</TableCell>
                    <TableCell>{result.day}</TableCell>
                    <TableCell className="text-xs">{result.lottery}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.draw}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-lg text-black dark:text-white">
                      {result.result}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {result.result.slice(-4)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
