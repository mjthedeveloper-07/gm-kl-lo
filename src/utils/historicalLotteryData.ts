// Historical lottery data generator functions for years 2012-2024
export interface LotteryEntry {
  date: string;
  result: string;
  month: number;
  year: number;
  lottery_name: string;
  draw_number: string;
  lottery_type: string;
}

import { generate2012LotteryData } from './lottery2012Data';
import { generate2013LotteryData } from './lottery2013Data';
import { generate2014LotteryData } from './lottery2014Data';
import { generate2015LotteryData } from './lottery2015Data';
import { generate2016LotteryData } from './lottery2016Data';
import { generate2017LotteryData } from './lottery2017Data';
import { generate2018LotteryData } from './lottery2018Data';
import { generate2019LotteryData } from './lottery2019Data';
import { generate2020LotteryData } from './lottery2020Data';
import { generate2021LotteryData } from './lottery2021Data';
import { generate2022LotteryData } from './lottery2022Data';
import { generate2023LotteryData } from './lottery2023Data';
import { generate2024LotteryData } from './lottery2024Data';

export const getHistoricalDataStats = () => {
  const data2012 = generate2012LotteryData();
  const data2013 = generate2013LotteryData();
  const data2014 = generate2014LotteryData();
  const data2015 = generate2015LotteryData();
  const data2016 = generate2016LotteryData();
  const data2017 = generate2017LotteryData();
  const data2018 = generate2018LotteryData();
  const data2019 = generate2019LotteryData();
  const data2020 = generate2020LotteryData();
  const data2021 = generate2021LotteryData();
  const data2022 = generate2022LotteryData();
  const data2023 = generate2023LotteryData();
  const data2024 = generate2024LotteryData();

  return {
    totalEntries: data2012.length + data2013.length + data2014.length + 
                  data2015.length + data2016.length + data2017.length +
                  data2018.length + data2019.length + data2020.length + 
                  data2021.length + data2022.length + data2023.length + data2024.length,
    byYear: {
      2012: data2012.length,
      2013: data2013.length,
      2014: data2014.length,
      2015: data2015.length,
      2016: data2016.length,
      2017: data2017.length,
      2018: data2018.length,
      2019: data2019.length,
      2020: data2020.length,
      2021: data2021.length,
      2022: data2022.length,
      2023: data2023.length,
      2024: data2024.length
    },
    dateRange: {
      start: "2012-01-01",
      end: "2024-12-31",
    }
  };
};

export const generateAllHistoricalData = (): LotteryEntry[] => {
  return [
    ...generate2012LotteryData(),
    ...generate2013LotteryData(),
    ...generate2014LotteryData(),
    ...generate2015LotteryData(),
    ...generate2016LotteryData(),
    ...generate2017LotteryData(),
    ...generate2018LotteryData(),
    ...generate2019LotteryData(),
    ...generate2020LotteryData(),
    ...generate2021LotteryData(),
    ...generate2022LotteryData(),
    ...generate2023LotteryData(),
    ...generate2024LotteryData()
  ].sort((a, b) => a.date.localeCompare(b.date));
};

export {
  generate2012LotteryData,
  generate2013LotteryData,
  generate2014LotteryData,
  generate2015LotteryData,
  generate2016LotteryData,
  generate2017LotteryData,
  generate2018LotteryData,
  generate2019LotteryData,
  generate2020LotteryData,
  generate2021LotteryData,
  generate2022LotteryData,
  generate2023LotteryData,
  generate2024LotteryData
};
