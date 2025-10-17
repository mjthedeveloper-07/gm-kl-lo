// Kerala Lottery Results for 2015
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

export const generate2015LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 5, result: "178345" }, { day: 12, result: "290567" }, { day: 19, result: "312789" }, { day: 26, result: "434901" }],
    [{ day: 2, result: "556123" }, { day: 9, result: "178345" }, { day: 16, result: "290567" }, { day: 23, result: "312789" }],
    [{ day: 2, result: "434901" }, { day: 9, result: "556123" }, { day: 16, result: "178345" }, { day: 23, result: "290567" }, { day: 30, result: "312789" }],
    [{ day: 6, result: "434901" }, { day: 13, result: "556123" }, { day: 20, result: "178345" }, { day: 27, result: "290567" }],
    [{ day: 4, result: "312789" }, { day: 11, result: "434901" }, { day: 18, result: "556123" }, { day: 25, result: "178345" }],
    [{ day: 1, result: "290567" }, { day: 8, result: "312789" }, { day: 15, result: "434901" }, { day: 22, result: "556123" }, { day: 29, result: "178345" }],
    [{ day: 6, result: "290567" }, { day: 13, result: "312789" }, { day: 20, result: "434901" }, { day: 27, result: "556123" }],
    [{ day: 3, result: "178345" }, { day: 10, result: "290567" }, { day: 17, result: "312789" }, { day: 24, result: "434901" }, { day: 31, result: "556123" }],
    [{ day: 7, result: "178345" }, { day: 14, result: "290567" }, { day: 21, result: "312789" }, { day: 28, result: "434901" }],
    [{ day: 5, result: "556123" }, { day: 12, result: "178345" }, { day: 19, result: "290567" }, { day: 26, result: "312789" }],
    [{ day: 2, result: "434901" }, { day: 9, result: "556123" }, { day: 16, result: "178345" }, { day: 23, result: "290567" }, { day: 30, result: "312789" }],
    [{ day: 7, result: "434901" }, { day: 14, result: "556123" }, { day: 21, result: "178345" }, { day: 28, result: "290567" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2015-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2015,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2015-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
