// Kerala Lottery Results for 2016
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

export const generate2016LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 4, result: "189456" }, { day: 11, result: "201678" }, { day: 18, result: "323890" }, { day: 25, result: "445012" }],
    [{ day: 1, result: "567234" }, { day: 8, result: "189456" }, { day: 15, result: "201678" }, { day: 22, result: "323890" }, { day: 29, result: "445012" }],
    [{ day: 7, result: "567234" }, { day: 14, result: "189456" }, { day: 21, result: "201678" }, { day: 28, result: "323890" }],
    [{ day: 4, result: "445012" }, { day: 11, result: "567234" }, { day: 18, result: "189456" }, { day: 25, result: "201678" }],
    [{ day: 2, result: "323890" }, { day: 9, result: "445012" }, { day: 16, result: "567234" }, { day: 23, result: "189456" }, { day: 30, result: "201678" }],
    [{ day: 6, result: "323890" }, { day: 13, result: "445012" }, { day: 20, result: "567234" }, { day: 27, result: "189456" }],
    [{ day: 4, result: "201678" }, { day: 11, result: "323890" }, { day: 18, result: "445012" }, { day: 25, result: "567234" }],
    [{ day: 1, result: "189456" }, { day: 8, result: "201678" }, { day: 15, result: "323890" }, { day: 22, result: "445012" }, { day: 29, result: "567234" }],
    [{ day: 5, result: "189456" }, { day: 12, result: "201678" }, { day: 19, result: "323890" }, { day: 26, result: "445012" }],
    [{ day: 3, result: "567234" }, { day: 10, result: "189456" }, { day: 17, result: "201678" }, { day: 24, result: "323890" }, { day: 31, result: "445012" }],
    [{ day: 7, result: "567234" }, { day: 14, result: "189456" }, { day: 21, result: "201678" }, { day: 28, result: "323890" }],
    [{ day: 5, result: "445012" }, { day: 12, result: "567234" }, { day: 19, result: "189456" }, { day: 26, result: "201678" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2016-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2016,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2016-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
