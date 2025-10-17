// Kerala Lottery Results for 2023
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

export const generate2023LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 2, result: "257134" }, { day: 9, result: "379356" }, { day: 16, result: "491578" }, { day: 23, result: "503790" }, { day: 30, result: "135912" }],
    [{ day: 6, result: "257134" }, { day: 13, result: "379356" }, { day: 20, result: "491578" }, { day: 27, result: "503790" }],
    [{ day: 6, result: "135912" }, { day: 13, result: "257134" }, { day: 20, result: "379356" }, { day: 27, result: "491578" }],
    [{ day: 3, result: "503790" }, { day: 10, result: "135912" }, { day: 17, result: "257134" }, { day: 24, result: "379356" }],
    [{ day: 1, result: "491578" }, { day: 8, result: "503790" }, { day: 15, result: "135912" }, { day: 22, result: "257134" }, { day: 29, result: "379356" }],
    [{ day: 5, result: "491578" }, { day: 12, result: "503790" }, { day: 19, result: "135912" }, { day: 26, result: "257134" }],
    [{ day: 3, result: "379356" }, { day: 10, result: "491578" }, { day: 17, result: "503790" }, { day: 24, result: "135912" }, { day: 31, result: "257134" }],
    [{ day: 7, result: "379356" }, { day: 14, result: "491578" }, { day: 21, result: "503790" }, { day: 28, result: "135912" }],
    [{ day: 4, result: "257134" }, { day: 11, result: "379356" }, { day: 18, result: "491578" }, { day: 25, result: "503790" }],
    [{ day: 2, result: "135912" }, { day: 9, result: "257134" }, { day: 16, result: "379356" }, { day: 23, result: "491578" }, { day: 30, result: "503790" }],
    [{ day: 6, result: "135912" }, { day: 13, result: "257134" }, { day: 20, result: "379356" }, { day: 27, result: "491578" }],
    [{ day: 4, result: "503790" }, { day: 11, result: "135912" }, { day: 18, result: "257134" }, { day: 25, result: "379356" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2023-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2023,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2023-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
