import lotteryData from "./lotteryData.json";

export interface LotteryResult {
  date: string;
  day: string;
  lottery: string;
  draw: string;
  result: string;
  year: number;
  month: number;
  lotteryType?: "bumper" | "regular";
}

// Comprehensive historical lottery results from 2009-2026 (2300+ entries)
export const lotteryHistory: LotteryResult[] = lotteryData as LotteryResult[];

// Helper functions
export const getResultsByYear = (year: number): LotteryResult[] => {
  return lotteryHistory.filter(r => r.year === year);
};

export const getResultsByMonth = (year: number, month: number): LotteryResult[] => {
  return lotteryHistory.filter(r => r.year === year && r.month === month);
};

export const getResultsByDraw = (draw: string): LotteryResult[] => {
  return lotteryHistory.filter(r => r.draw === draw);
};

export const getAllDrawNumbers = (): string[] => {
  return [...new Set(lotteryHistory.map(r => r.draw))].sort();
};

export const getBumperResults = (): LotteryResult[] => {
  return lotteryHistory.filter(r => r.lotteryType === "bumper");
};

export const getRegularResults = (): LotteryResult[] => {
  return lotteryHistory.filter(r => r.lotteryType === "regular");
};

export const getResultsByLotteryType = (type: string): LotteryResult[] => {
  return lotteryHistory.filter(r => r.lottery.toLowerCase().includes(type.toLowerCase()));
};

export const getYearRange = (): { min: number; max: number } => {
  const years = lotteryHistory.map(r => r.year);
  return { min: Math.min(...years), max: Math.max(...years) };
};

export const getLast3Digits = (result: string): string => {
  return result.slice(-3);
};

export const getLast4Digits = (result: string): string => {
  return result.slice(-4);
};
