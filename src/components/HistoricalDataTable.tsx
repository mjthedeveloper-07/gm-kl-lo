import { useState } from "react";
import { lotteryHistory, getResultsByYear, getResultsByMonth, getYearRange } from "@/data/lotteryHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface HistoricalDataTableProps {
  highlightPattern?: string;
}

export const HistoricalDataTable = ({ highlightPattern }: HistoricalDataTableProps) => {
  const { min, max } = getYearRange();
  const [selectedYear, setSelectedYear] = useState<number>(max);
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [lotteryType, setLotteryType] = useState<string>("all");

  const filteredResults = (() => {
    let results = selectedMonth === "all" 
      ? getResultsByYear(selectedYear)
      : getResultsByMonth(selectedYear, selectedMonth as number);
    
    if (lotteryType !== "all") {
      results = results.filter(r => r.lotteryType === lotteryType);
    }
    
    if (searchTerm) {
      results = results.filter(r => 
        r.result.includes(searchTerm) || 
        r.draw.includes(searchTerm) ||
        r.lottery.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return results;
  })();

  const availableYears = Array.from({ length: max - min + 1 }, (_, i) => max - i);

  const isHighlighted = (result: string) => {
    if (!highlightPattern) return false;
    return result.includes(highlightPattern) || result.slice(-3) === highlightPattern;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Lottery Results ({min}-{max})</CardTitle>
        <CardDescription>
          Comprehensive {max - min + 1}-year database with {lotteryHistory.length} lottery results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="year" className="text-sm font-medium mb-1">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger id="year" className="w-full">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month" className="text-sm font-medium mb-1">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(v === "all" ? "all" : Number(v))}>
                <SelectTrigger id="month" className="w-full">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium mb-1">Type</Label>
              <Select value={lotteryType} onValueChange={setLotteryType}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bumper">Bumper</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search" className="text-sm font-medium mb-1">Search</Label>
              <Input
                id="search"
                placeholder="Result, draw, lottery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{filteredResults.length} results found</Badge>
          </div>
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
