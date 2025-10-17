// Kerala Lottery Results for 2020
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

export const generate2020LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 6, result: "224901" }, { day: 13, result: "346123" }, { day: 20, result: "468345" }, { day: 27, result: "580567" }],
    [{ day: 3, result: "102789" }, { day: 10, result: "224901" }, { day: 17, result: "346123" }, { day: 24, result: "468345" }],
    [{ day: 2, result: "580567" }, { day: 9, result: "102789" }, { day: 16, result: "224901" }, { day: 23, result: "346123" }, { day: 30, result: "468345" }],
    [{ day: 6, result: "580567" }, { day: 13, result: "102789" }, { day: 20, result: "224901" }, { day: 27, result: "346123" }],
    [{ day: 4, result: "468345" }, { day: 11, result: "580567" }, { day: 18, result: "102789" }, { day: 25, result: "224901" }],
    [{ day: 1, result: "346123" }, { day: 8, result: "468345" }, { day: 15, result: "580567" }, { day: 22, result: "102789" }, { day: 29, result: "224901" }],
    [{ day: 6, result: "346123" }, { day: 13, result: "468345" }, { day: 20, result: "580567" }, { day: 27, result: "102789" }],
    [{ day: 3, result: "224901" }, { day: 10, result: "346123" }, { day: 17, result: "468345" }, { day: 24, result: "580567" }, { day: 31, result: "102789" }],
    [{ day: 7, result: "224901" }, { day: 14, result: "346123" }, { day: 21, result: "468345" }, { day: 28, result: "580567" }],
    [{ day: 5, result: "102789" }, { day: 12, result: "224901" }, { day: 19, result: "346123" }, { day: 26, result: "468345" }],
    [{ day: 2, result: "580567" }, { day: 9, result: "102789" }, { day: 16, result: "224901" }, { day: 23, result: "346123" }, { day: 30, result: "468345" }],
    [{ day: 7, result: "580567" }, { day: 14, result: "102789" }, { day: 21, result: "224901" }, { day: 28, result: "346123" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2020-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2020,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2020-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
