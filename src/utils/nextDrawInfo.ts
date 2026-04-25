import { lotteryHistory, type LotteryResult } from "@/data/lotteryHistory";

export interface NextDrawInfo {
  nextDate: string;
  nextDay: string;
  nextLottery: string;
  latestResult: LotteryResult;
}

const WEEKDAY_TO_LOTTERY: Record<string, string> = {
  Mon: "Bhagyathara",
  Tue: "Sthree Sakthi",
  Wed: "Dhanalekshmi",
  Thu: "Karunya Plus",
  Fri: "Suvarna Keralam",
  Sat: "Karunya",
  Sun: "Samrudhi",
};

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Parse "DD.MM.YY" → Date (assumes 20YY)
const parseDate = (s: string): Date => {
  const [dd, mm, yy] = s.split(".").map(Number);
  return new Date(2000 + yy, mm - 1, dd);
};

// Format Date → "DD.MM.YY"
const formatDate = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear() % 100).padStart(2, "0");
  return `${dd}.${mm}.${yy}`;
};

export const getNextDrawInfo = (): NextDrawInfo => {
  const latest = lotteryHistory[0];
  const latestDate = parseDate(latest.date);

  const next = new Date(latestDate);
  next.setDate(next.getDate() + 1);

  const nextDay = SHORT_DAYS[next.getDay()];
  const nextDate = formatDate(next);
  const nextLottery = WEEKDAY_TO_LOTTERY[nextDay] ?? "Kerala Lottery";

  return {
    nextDate,
    nextDay,
    nextLottery,
    latestResult: latest,
  };
};
