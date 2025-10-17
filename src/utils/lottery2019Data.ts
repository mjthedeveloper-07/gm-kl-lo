// Kerala Lottery Results for 2019
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

export const generate2019LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 7, result: "213890" }, { day: 14, result: "335012" }, { day: 21, result: "457234" }, { day: 28, result: "579456" }],
    [{ day: 4, result: "101678" }, { day: 11, result: "223890" }, { day: 18, result: "345012" }, { day: 25, result: "467234" }],
    [{ day: 4, result: "589456" }, { day: 11, result: "101678" }, { day: 18, result: "223890" }, { day: 25, result: "345012" }],
    [{ day: 1, result: "467234" }, { day: 8, result: "589456" }, { day: 15, result: "101678" }, { day: 22, result: "223890" }, { day: 29, result: "345012" }],
    [{ day: 6, result: "467234" }, { day: 13, result: "589456" }, { day: 20, result: "101678" }, { day: 27, result: "223890" }],
    [{ day: 3, result: "345012" }, { day: 10, result: "467234" }, { day: 17, result: "589456" }, { day: 24, result: "101678" }],
    [{ day: 1, result: "223890" }, { day: 8, result: "345012" }, { day: 15, result: "467234" }, { day: 22, result: "589456" }, { day: 29, result: "101678" }],
    [{ day: 5, result: "223890" }, { day: 12, result: "345012" }, { day: 19, result: "467234" }, { day: 26, result: "589456" }],
    [{ day: 2, result: "101678" }, { day: 9, result: "223890" }, { day: 16, result: "345012" }, { day: 23, result: "467234" }, { day: 30, result: "589456" }],
    [{ day: 7, result: "101678" }, { day: 14, result: "223890" }, { day: 21, result: "345012" }, { day: 28, result: "467234" }],
    [{ day: 4, result: "589456" }, { day: 11, result: "101678" }, { day: 18, result: "223890" }, { day: 25, result: "345012" }],
    [{ day: 2, result: "467234" }, { day: 9, result: "589456" }, { day: 16, result: "101678" }, { day: 23, result: "223890" }, { day: 30, result: "345012" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2019-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2019,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2019-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
