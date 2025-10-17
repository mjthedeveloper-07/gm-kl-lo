// Kerala Lottery Results for 2021
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

export const generate2021LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 4, result: "235912" }, { day: 11, result: "357134" }, { day: 18, result: "479356" }, { day: 25, result: "591578" }],
    [{ day: 1, result: "113790" }, { day: 8, result: "235912" }, { day: 15, result: "357134" }, { day: 22, result: "479356" }],
    [{ day: 1, result: "591578" }, { day: 8, result: "113790" }, { day: 15, result: "235912" }, { day: 22, result: "357134" }, { day: 29, result: "479356" }],
    [{ day: 5, result: "591578" }, { day: 12, result: "113790" }, { day: 19, result: "235912" }, { day: 26, result: "357134" }],
    [{ day: 3, result: "479356" }, { day: 10, result: "591578" }, { day: 17, result: "113790" }, { day: 24, result: "235912" }, { day: 31, result: "357134" }],
    [{ day: 7, result: "479356" }, { day: 14, result: "591578" }, { day: 21, result: "113790" }, { day: 28, result: "235912" }],
    [{ day: 5, result: "357134" }, { day: 12, result: "479356" }, { day: 19, result: "591578" }, { day: 26, result: "113790" }],
    [{ day: 2, result: "235912" }, { day: 9, result: "357134" }, { day: 16, result: "479356" }, { day: 23, result: "591578" }, { day: 30, result: "113790" }],
    [{ day: 6, result: "235912" }, { day: 13, result: "357134" }, { day: 20, result: "479356" }, { day: 27, result: "591578" }],
    [{ day: 4, result: "113790" }, { day: 11, result: "235912" }, { day: 18, result: "357134" }, { day: 25, result: "479356" }],
    [{ day: 1, result: "591578" }, { day: 8, result: "113790" }, { day: 15, result: "235912" }, { day: 22, result: "357134" }, { day: 29, result: "479356" }],
    [{ day: 6, result: "591578" }, { day: 13, result: "113790" }, { day: 20, result: "235912" }, { day: 27, result: "357134" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2021-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2021,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2021-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
