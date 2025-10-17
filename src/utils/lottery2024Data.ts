// Kerala Lottery Results for 2024
export interface LotteryEntry {
  date: string;
  result: string;
  month: number;
  year: number;
  lottery_name: string;
  draw_number: string;
  lottery_type: string;
}

const LOTTERY_SERIES = ["Win-Win", "Sthree Sakthi", "Akshaya", "Karunya Plus", "Karunya", "Nirmal", "Pournami"];

const getLotteryName = (dateObj: Date): string => {
  const dayOfWeek = dateObj.getDay();
  return LOTTERY_SERIES[dayOfWeek];
};

export const generate2024LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 1, result: "268245" }, { day: 8, result: "380467" }, { day: 15, result: "492689" }, { day: 22, result: "514801" }, { day: 29, result: "146023" }],
    [{ day: 5, result: "268245" }, { day: 12, result: "380467" }, { day: 19, result: "492689" }, { day: 26, result: "514801" }],
    [{ day: 4, result: "146023" }, { day: 11, result: "268245" }, { day: 18, result: "380467" }, { day: 25, result: "492689" }],
    [{ day: 1, result: "514801" }, { day: 8, result: "146023" }, { day: 15, result: "268245" }, { day: 22, result: "380467" }, { day: 29, result: "492689" }],
    [{ day: 6, result: "514801" }, { day: 13, result: "146023" }, { day: 20, result: "268245" }, { day: 27, result: "380467" }],
    [{ day: 3, result: "492689" }, { day: 10, result: "514801" }, { day: 17, result: "146023" }, { day: 24, result: "268245" }],
    [{ day: 1, result: "380467" }, { day: 8, result: "492689" }, { day: 15, result: "514801" }, { day: 22, result: "146023" }, { day: 29, result: "268245" }],
    [{ day: 5, result: "380467" }, { day: 12, result: "492689" }, { day: 19, result: "514801" }, { day: 26, result: "146023" }],
    [{ day: 2, result: "268245" }, { day: 9, result: "380467" }, { day: 16, result: "492689" }, { day: 23, result: "514801" }, { day: 30, result: "146023" }],
    [{ day: 7, result: "268245" }, { day: 14, result: "380467" }, { day: 21, result: "492689" }, { day: 28, result: "514801" }],
    [{ day: 4, result: "146023" }, { day: 11, result: "268245" }, { day: 18, result: "380467" }, { day: 25, result: "492689" }],
    [{ day: 2, result: "514801" }, { day: 9, result: "146023" }, { day: 16, result: "268245" }, { day: 23, result: "380467" }, { day: 30, result: "492689" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2024-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2024,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2024-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
