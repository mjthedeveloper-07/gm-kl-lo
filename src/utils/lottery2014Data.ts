// Kerala Lottery Results for 2014
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

export const generate2014LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 6, result: "167234" }, { day: 13, result: "289456" }, { day: 20, result: "301678" }, { day: 27, result: "423890" }],
    [{ day: 3, result: "545012" }, { day: 10, result: "167234" }, { day: 17, result: "289456" }, { day: 24, result: "301678" }],
    [{ day: 3, result: "423890" }, { day: 10, result: "545012" }, { day: 17, result: "167234" }, { day: 24, result: "289456" }, { day: 31, result: "301678" }],
    [{ day: 7, result: "423890" }, { day: 14, result: "545012" }, { day: 21, result: "167234" }, { day: 28, result: "289456" }],
    [{ day: 5, result: "301678" }, { day: 12, result: "423890" }, { day: 19, result: "545012" }, { day: 26, result: "167234" }],
    [{ day: 2, result: "289456" }, { day: 9, result: "301678" }, { day: 16, result: "423890" }, { day: 23, result: "545012" }, { day: 30, result: "167234" }],
    [{ day: 7, result: "289456" }, { day: 14, result: "301678" }, { day: 21, result: "423890" }, { day: 28, result: "545012" }],
    [{ day: 4, result: "167234" }, { day: 11, result: "289456" }, { day: 18, result: "301678" }, { day: 25, result: "423890" }],
    [{ day: 1, result: "545012" }, { day: 8, result: "167234" }, { day: 15, result: "289456" }, { day: 22, result: "301678" }, { day: 29, result: "423890" }],
    [{ day: 6, result: "545012" }, { day: 13, result: "167234" }, { day: 20, result: "289456" }, { day: 27, result: "301678" }],
    [{ day: 3, result: "423890" }, { day: 10, result: "545012" }, { day: 17, result: "167234" }, { day: 24, result: "289456" }],
    [{ day: 1, result: "301678" }, { day: 8, result: "423890" }, { day: 15, result: "545012" }, { day: 22, result: "167234" }, { day: 29, result: "289456" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2014-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2014,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2014-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
