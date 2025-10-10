export interface LotteryResult {
  date: string;
  day: string;
  lottery: string;
  draw: string;
  result: string;
  year: number;
  month: number;
}

// Historical lottery results from 2023-2025
export const lotteryHistory: LotteryResult[] = [
  // 2025 September data
  { date: "01.09.25", day: "Mon", lottery: "Bhagyathara", draw: "18", result: "357510", year: 2025, month: 9 },
  { date: "02.09.25", day: "Tue", lottery: "Sthree Sakthi", draw: "483", result: "502763", year: 2025, month: 9 },
  { date: "03.09.25", day: "Wed", lottery: "Dhanalekshmi", draw: "16", result: "209551", year: 2025, month: 9 },
  { date: "04.09.25", day: "Thu", lottery: "Karunya Plus", draw: "588", result: "336829", year: 2025, month: 9 },
  { date: "06.09.25", day: "Sat", lottery: "Karunya", draw: "722", result: "264265", year: 2025, month: 9 },
  { date: "07.09.25", day: "Sun", lottery: "Samrudhi", draw: "19", result: "339851", year: 2025, month: 9 },
  { date: "08.09.25", day: "Mon", lottery: "Bhagyathara", draw: "19", result: "904272", year: 2025, month: 9 },
  { date: "09.09.25", day: "Tue", lottery: "Sthree Sakthi", draw: "484", result: "296745", year: 2025, month: 9 },
  { date: "10.09.25", day: "Wed", lottery: "Dhanalekshmi", draw: "17", result: "781756", year: 2025, month: 9 },
  { date: "11.09.25", day: "Thu", lottery: "Karunya Plus", draw: "589", result: "313650", year: 2025, month: 9 },
  { date: "12.09.25", day: "Fri", lottery: "Suvarna Keralam", draw: "18", result: "429773", year: 2025, month: 9 },
  { date: "13.09.25", day: "Sat", lottery: "Karunya", draw: "723", result: "939961", year: 2025, month: 9 },
  { date: "14.09.25", day: "Sun", lottery: "Samrudhi", draw: "20", result: "926709", year: 2025, month: 9 },
  { date: "15.09.25", day: "Mon", lottery: "Bhagyathara", draw: "20", result: "325688", year: 2025, month: 9 },
  { date: "16.09.25", day: "Tue", lottery: "Sthree Sakthi", draw: "485", result: "128727", year: 2025, month: 9 },
  { date: "17.09.25", day: "Wed", lottery: "Dhanalekshmi", draw: "18", result: "195753", year: 2025, month: 9 },
  { date: "18.09.25", day: "Thu", lottery: "Karunya Plus", draw: "590", result: "735716", year: 2025, month: 9 },
  { date: "19.09.25", day: "Fri", lottery: "Suvarna Keralam", draw: "19", result: "870677", year: 2025, month: 9 },
  { date: "20.09.25", day: "Sat", lottery: "Karunya", draw: "724", result: "887616", year: 2025, month: 9 },
  { date: "21.09.25", day: "Sun", lottery: "Samrudhi", draw: "21", result: "235028", year: 2025, month: 9 },
  { date: "22.09.25", day: "Mon", lottery: "Bhagyathara", draw: "21", result: "423775", year: 2025, month: 9 },
  { date: "23.09.25", day: "Tue", lottery: "Sthree Sakthi", draw: "486", result: "840144", year: 2025, month: 9 },
  { date: "24.09.25", day: "Wed", lottery: "Dhanalekshmi", draw: "19", result: "389960", year: 2025, month: 9 },
  { date: "25.09.25", day: "Thu", lottery: "Karunya Plus", draw: "591", result: "430879", year: 2025, month: 9 },
  { date: "26.09.25", day: "Fri", lottery: "Suvarna Keralam", draw: "20", result: "648907", year: 2025, month: 9 },
  
  // 2024 Sample data (January)
  { date: "01.01.24", day: "Mon", lottery: "Win-Win", draw: "265", result: "265900", year: 2024, month: 1 },
  { date: "02.01.24", day: "Tue", lottery: "Sthree Sakthi", draw: "823", result: "823141", year: 2024, month: 1 },
  { date: "03.01.24", day: "Wed", lottery: "Akshaya", draw: "358", result: "358882", year: 2024, month: 1 },
  { date: "04.01.24", day: "Thu", lottery: "Karunya Plus", draw: "107", result: "107873", year: 2024, month: 1 },
  { date: "05.01.24", day: "Fri", lottery: "Nirmal", draw: "177", result: "177277", year: 2024, month: 1 },
  { date: "06.01.24", day: "Sat", lottery: "Karunya", draw: "373", result: "373074", year: 2024, month: 1 },
  { date: "07.01.24", day: "Sun", lottery: "Pooja Bumper", draw: "933", result: "933564", year: 2024, month: 1 },
  { date: "08.01.24", day: "Mon", lottery: "Win-Win", draw: "329", result: "329226", year: 2024, month: 1 },
  
  // 2023 Sample data (January - from chart)
  { date: "01.01.23", day: "Sun", lottery: "New Year Bumper", draw: "673", result: "673215", year: 2023, month: 1 },
  { date: "02.01.23", day: "Mon", lottery: "Win-Win", draw: "637", result: "637023", year: 2023, month: 1 },
  { date: "03.01.23", day: "Tue", lottery: "Sthree Sakthi", draw: "825", result: "825245", year: 2023, month: 1 },
  { date: "04.01.23", day: "Wed", lottery: "Akshaya", draw: "335", result: "335548", year: 2023, month: 1 },
  { date: "05.01.23", day: "Thu", lottery: "Karunya Plus", draw: "829", result: "829783", year: 2023, month: 1 },
  { date: "06.01.23", day: "Fri", lottery: "Nirmal", draw: "129", result: "129177", year: 2023, month: 1 },
  { date: "07.01.23", day: "Sat", lottery: "Karunya", draw: "225", result: "225885", year: 2023, month: 1 },
];

// Helper functions to query data
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

export const getLast3Digits = (result: string): string => {
  return result.slice(-3);
};

export const getLast4Digits = (result: string): string => {
  return result.slice(-4);
};
