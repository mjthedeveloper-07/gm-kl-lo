// Kerala Lottery Results for 2013
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

export const generate2013LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  // Sample data for 2013 (representative entries per month)
  const monthlyData = [
    [{ day: 7, result: "145623" }, { day: 14, result: "267845" }, { day: 21, result: "389067" }, { day: 28, result: "401289" }],
    [{ day: 4, result: "523401" }, { day: 11, result: "134623" }, { day: 18, result: "256845" }, { day: 25, result: "378067" }],
    [{ day: 4, result: "490289" }, { day: 11, result: "512401" }, { day: 18, result: "134623" }, { day: 25, result: "256845" }],
    [{ day: 1, result: "378067" }, { day: 8, result: "490289" }, { day: 15, result: "512401" }, { day: 22, result: "134623" }, { day: 29, result: "256845" }],
    [{ day: 6, result: "378067" }, { day: 13, result: "490289" }, { day: 20, result: "512401" }, { day: 27, result: "134623" }],
    [{ day: 3, result: "256845" }, { day: 10, result: "378067" }, { day: 17, result: "490289" }, { day: 24, result: "512401" }],
    [{ day: 1, result: "134623" }, { day: 8, result: "256845" }, { day: 15, result: "378067" }, { day: 22, result: "490289" }, { day: 29, result: "512401" }],
    [{ day: 5, result: "134623" }, { day: 12, result: "256845" }, { day: 19, result: "378067" }, { day: 26, result: "490289" }],
    [{ day: 2, result: "512401" }, { day: 9, result: "134623" }, { day: 16, result: "256845" }, { day: 23, result: "378067" }, { day: 30, result: "490289" }],
    [{ day: 7, result: "512401" }, { day: 14, result: "134623" }, { day: 21, result: "256845" }, { day: 28, result: "378067" }],
    [{ day: 4, result: "490289" }, { day: 11, result: "512401" }, { day: 18, result: "134623" }, { day: 25, result: "256845" }],
    [{ day: 2, result: "378067" }, { day: 9, result: "490289" }, { day: 16, result: "512401" }, { day: 23, result: "134623" }, { day: 30, result: "256845" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2013-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2013,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2013-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
