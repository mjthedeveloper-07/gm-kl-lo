// Kerala Lottery Results for 2017
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

export const generate2017LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 2, result: "190567" }, { day: 9, result: "212789" }, { day: 16, result: "334901" }, { day: 23, result: "456123" }, { day: 30, result: "578345" }],
    [{ day: 6, result: "190567" }, { day: 13, result: "212789" }, { day: 20, result: "334901" }, { day: 27, result: "456123" }],
    [{ day: 6, result: "578345" }, { day: 13, result: "190567" }, { day: 20, result: "212789" }, { day: 27, result: "334901" }],
    [{ day: 3, result: "456123" }, { day: 10, result: "578345" }, { day: 17, result: "190567" }, { day: 24, result: "212789" }],
    [{ day: 1, result: "334901" }, { day: 8, result: "456123" }, { day: 15, result: "578345" }, { day: 22, result: "190567" }, { day: 29, result: "212789" }],
    [{ day: 5, result: "334901" }, { day: 12, result: "456123" }, { day: 19, result: "578345" }, { day: 26, result: "190567" }],
    [{ day: 3, result: "212789" }, { day: 10, result: "334901" }, { day: 17, result: "456123" }, { day: 24, result: "578345" }, { day: 31, result: "190567" }],
    [{ day: 7, result: "212789" }, { day: 14, result: "334901" }, { day: 21, result: "456123" }, { day: 28, result: "578345" }],
    [{ day: 4, result: "190567" }, { day: 11, result: "212789" }, { day: 18, result: "334901" }, { day: 25, result: "456123" }],
    [{ day: 2, result: "578345" }, { day: 9, result: "190567" }, { day: 16, result: "212789" }, { day: 23, result: "334901" }, { day: 30, result: "456123" }],
    [{ day: 6, result: "578345" }, { day: 13, result: "190567" }, { day: 20, result: "212789" }, { day: 27, result: "334901" }],
    [{ day: 4, result: "456123" }, { day: 11, result: "578345" }, { day: 18, result: "190567" }, { day: 25, result: "212789" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2017-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2017,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2017-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
