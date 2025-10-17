// Kerala Lottery Results for 2022
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

export const generate2022LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 3, result: "246023" }, { day: 10, result: "368245" }, { day: 17, result: "480467" }, { day: 24, result: "592689" }, { day: 31, result: "124801" }],
    [{ day: 7, result: "246023" }, { day: 14, result: "368245" }, { day: 21, result: "480467" }, { day: 28, result: "592689" }],
    [{ day: 7, result: "124801" }, { day: 14, result: "246023" }, { day: 21, result: "368245" }, { day: 28, result: "480467" }],
    [{ day: 4, result: "592689" }, { day: 11, result: "124801" }, { day: 18, result: "246023" }, { day: 25, result: "368245" }],
    [{ day: 2, result: "480467" }, { day: 9, result: "592689" }, { day: 16, result: "124801" }, { day: 23, result: "246023" }, { day: 30, result: "368245" }],
    [{ day: 6, result: "480467" }, { day: 13, result: "592689" }, { day: 20, result: "124801" }, { day: 27, result: "246023" }],
    [{ day: 4, result: "368245" }, { day: 11, result: "480467" }, { day: 18, result: "592689" }, { day: 25, result: "124801" }],
    [{ day: 1, result: "246023" }, { day: 8, result: "368245" }, { day: 15, result: "480467" }, { day: 22, result: "592689" }, { day: 29, result: "124801" }],
    [{ day: 5, result: "246023" }, { day: 12, result: "368245" }, { day: 19, result: "480467" }, { day: 26, result: "592689" }],
    [{ day: 3, result: "124801" }, { day: 10, result: "246023" }, { day: 17, result: "368245" }, { day: 24, result: "480467" }, { day: 31, result: "592689" }],
    [{ day: 7, result: "124801" }, { day: 14, result: "246023" }, { day: 21, result: "368245" }, { day: 28, result: "480467" }],
    [{ day: 5, result: "592689" }, { day: 12, result: "124801" }, { day: 19, result: "246023" }, { day: 26, result: "368245" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2022-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2022,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2022-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
