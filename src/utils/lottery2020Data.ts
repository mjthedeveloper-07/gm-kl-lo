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
  
  // 2020 had extensive COVID-19 lockdown periods with many cancelled draws
  const monthlyData = [
    [{ day: 1, result: "423449" }, { day: 2, result: "325083" }, { day: 3, result: "845074" }, { day: 4, result: "374730" }, { day: 5, result: "530997" }, { day: 6, result: "461417" }, { day: 7, result: "420180" }, { day: 8, result: "373408" }, { day: 9, result: "337608" }, { day: 10, result: "189822" }, { day: 11, result: "395767" }, { day: 12, result: "889278" }, { day: 13, result: "717310" }, { day: 14, result: "975793" }, { day: 15, result: "398949" }, { day: 16, result: "115691" }, { day: 17, result: "256223" }, { day: 18, result: "828847" }, { day: 19, result: "745266" }, { day: 20, result: "468814" }, { day: 21, result: "109677" }, { day: 22, result: "167848" }, { day: 23, result: "196313" }, { day: 24, result: "855556" }, { day: 25, result: "177024" }, { day: 27, result: "196961" }, { day: 28, result: "311063" }, { day: 29, result: "339343" }, { day: 30, result: "597021" }, { day: 31, result: "846095" }],
    [{ day: 1, result: "410895" }, { day: 2, result: "474140" }, { day: 3, result: "813960" }, { day: 4, result: "180958" }, { day: 5, result: "465029" }, { day: 6, result: "584995" }, { day: 7, result: "347268" }, { day: 8, result: "478912" }, { day: 9, result: "457478" }, { day: 10, result: "800754" }, { day: 11, result: "202108" }, { day: 12, result: "103302" }, { day: 13, result: "592252" }, { day: 14, result: "101793" }, { day: 15, result: "589235" }, { day: 16, result: "828299" }, { day: 17, result: "508139" }, { day: 18, result: "176976" }, { day: 19, result: "382415" }, { day: 20, result: "822404" }, { day: 21, result: "257268" }, { day: 22, result: "254683" }, { day: 23, result: "798635" }, { day: 24, result: "684973" }, { day: 25, result: "533585" }, { day: 26, result: "287605" }, { day: 27, result: "218704" }, { day: 28, result: "222441" }, { day: 29, result: "750949" }],
    [{ day: 2, result: "196758" }, { day: 3, result: "505462" }, { day: 4, result: "368794" }, { day: 5, result: "309018" }, { day: 6, result: "647000" }, { day: 7, result: "816169" }, { day: 8, result: "155820" }, { day: 9, result: "331766" }, { day: 10, result: "710485" }, { day: 11, result: "845582" }, { day: 12, result: "557383" }, { day: 13, result: "190598" }, { day: 14, result: "885915" }, { day: 15, result: "151064" }, { day: 16, result: "864122" }, { day: 17, result: "897789" }, { day: 18, result: "243891" }, { day: 19, result: "849641" }, { day: 20, result: "861787" }, { day: 21, result: "349819" }, { day: 22, result: "687704" }, { day: 23, result: "225896" }, { day: 24, result: "268763" }, { day: 25, result: "298807" }, { day: 26, result: "203169" }, { day: 27, result: "432465" }, { day: 28, result: "112967" }],
    // April-June 2020: Major COVID-19 lockdown - very few draws
    [], // April - all cancelled
    [], // May - all cancelled
    [], // June - all cancelled
    [{ day: 1, result: "186816" }, { day: 2, result: "179847" }, { day: 3, result: "253892" }, { day: 4, result: "167144" }, { day: 6, result: "164143" }, { day: 7, result: "322513" }, { day: 8, result: "193729" }, { day: 9, result: "557396" }, { day: 10, result: "133208" }, { day: 11, result: "236932" }, { day: 13, result: "234067" }, { day: 14, result: "223105" }, { day: 15, result: "314042" }, { day: 16, result: "243344" }, { day: 17, result: "255310" }, { day: 18, result: "147295" }, { day: 20, result: "187835" }, { day: 21, result: "447584" }, { day: 22, result: "197314" }, { day: 23, result: "226176" }, { day: 24, result: "177508" }, { day: 25, result: "476809" }, { day: 27, result: "534257" }, { day: 30, result: "252755" }],
    [{ day: 1, result: "252598" }, { day: 3, result: "281716" }, { day: 5, result: "143181" }, { day: 7, result: "466762" }, { day: 11, result: "587042" }, { day: 13, result: "165267" }, { day: 17, result: "251916" }, { day: 19, result: "242490" }, { day: 21, result: "579592" }, { day: 25, result: "254895" }, { day: 27, result: "417106" }, { day: 29, result: "574875" }],
    [{ day: 2, result: "605405" }, { day: 4, result: "532868" }, { day: 8, result: "184508" }, { day: 10, result: "589225" }, { day: 12, result: "254673" }, { day: 14, result: "587420" }, { day: 16, result: "796407" }, { day: 18, result: "162993" }, { day: 22, result: "837070" }, { day: 24, result: "719196" }, { day: 26, result: "815464" }, { day: 28, result: "471818" }, { day: 30, result: "846510" }],
    [{ day: 3, result: "658129" }, { day: 5, result: "282484" }, { day: 7, result: "489735" }, { day: 9, result: "753748" }, { day: 10, result: "508706" }, { day: 12, result: "567238" }, { day: 14, result: "509910" }, { day: 16, result: "309864" }, { day: 19, result: "246187" }, { day: 21, result: "333853" }, { day: 23, result: "199833" }, { day: 26, result: "278087" }, { day: 28, result: "220631" }, { day: 30, result: "638915" }],
    [{ day: 2, result: "732140" }, { day: 4, result: "267576" }, { day: 6, result: "131387" }, { day: 9, result: "525531" }, { day: 11, result: "681417" }, { day: 13, result: "786186" }, { day: 16, result: "299577" }, { day: 18, result: "456030" }, { day: 20, result: "894706" }, { day: 22, result: "312252" }, { day: 25, result: "342702" }, { day: 27, result: "201323" }, { day: 30, result: "833912" }],
    [{ day: 1, result: "161958" }, { day: 2, result: "222347" }, { day: 4, result: "246268" }, { day: 5, result: "221819" }, { day: 7, result: "716735" }, { day: 8, result: "864192" }, { day: 9, result: "548999" }, { day: 11, result: "613424" }, { day: 12, result: "507606" }, { day: 14, result: "860666" }, { day: 15, result: "647444" }, { day: 16, result: "468435" }, { day: 18, result: "444808" }, { day: 19, result: "723241" }, { day: 21, result: "197852" }, { day: 22, result: "312075" }, { day: 23, result: "620096" }, { day: 27, result: "693433" }, { day: 28, result: "140911" }, { day: 29, result: "228972" }]
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
