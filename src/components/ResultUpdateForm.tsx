import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { lotteryHistory, type LotteryResult } from "@/data/lotteryHistory";

interface ResultUpdateFormProps {
  onResultAdded?: (result: LotteryResult) => void;
}

export const ResultUpdateForm = ({ onResultAdded }: ResultUpdateFormProps) => {
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [lottery, setLottery] = useState("");
  const [draw, setDraw] = useState("");
  const [result, setResult] = useState("");

  const lotteryTypes = [
    "Win-Win",
    "Sthree Sakthi",
    "Akshaya",
    "Karunya Plus",
    "Nirmal",
    "Karunya",
    "Fifty Fifty",
    "Bhagyathara",
    "Dhanalekshmi",
    "Samrudhi",
    "Suvarna Keralam"
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate result is 6 digits
    if (!/^\d{6}$/.test(result)) {
      toast.error("Result must be exactly 6 digits");
      return;
    }

    // Parse date
    const [dayPart, monthPart, yearPart] = date.split(".");
    const year = parseInt(`20${yearPart}`);
    const month = parseInt(monthPart);

    const newResult: LotteryResult = {
      date,
      day,
      lottery,
      draw,
      result,
      year,
      month,
      lotteryType: "regular"
    };

    // Add to history (in a real app, this would persist to database)
    lotteryHistory.unshift(newResult);

    toast.success("Result added successfully! Predictions will update based on this latest result.");
    
    if (onResultAdded) {
      onResultAdded(newResult);
    }

    // Clear form
    setDate("");
    setDay("");
    setLottery("");
    setDraw("");
    setResult("");
  };

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Add New Result
        </CardTitle>
        <CardDescription>
          Update the latest lottery result to trigger next-day predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date (DD.MM.YY)</Label>
              <Input
                id="date"
                placeholder="20.10.25"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                pattern="\d{2}\.\d{2}\.\d{2}"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Select value={day} onValueChange={setDay} required>
                <SelectTrigger id="day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lottery">Lottery Type</Label>
            <Select value={lottery} onValueChange={setLottery} required>
              <SelectTrigger id="lottery">
                <SelectValue placeholder="Select lottery type" />
              </SelectTrigger>
              <SelectContent>
                {lotteryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="draw">Draw Number</Label>
              <Input
                id="draw"
                placeholder="1"
                value={draw}
                onChange={(e) => setDraw(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="result">Result (6 digits)</Label>
              <Input
                id="result"
                placeholder="784922"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                required
                maxLength={6}
                pattern="\d{6}"
              />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2">
            <TrendingUp className="h-4 w-4" />
            Add Result & Update Predictions
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
