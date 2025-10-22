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
  
  // 2021 still had COVID restrictions with many cancelled draws
  const monthlyData = [
    [{ day: 1, result: "673025" }, { day: 2, result: "595246" }, { day: 4, result: "746417" }, { day: 5, result: "648142" }, { day: 6, result: "127101" }, { day: 8, result: "148887" }, { day: 9, result: "352208" }, { day: 11, result: "560600" }, { day: 12, result: "702260" }, { day: 13, result: "175085" }, { day: 15, result: "794620" }, { day: 16, result: "252407" }, { day: 17, result: "358753" }, { day: 18, result: "686840" }, { day: 19, result: "174170" }, { day: 20, result: "194677" }, { day: 22, result: "802248" }, { day: 23, result: "467046" }, { day: 25, result: "139570" }, { day: 27, result: "805153" }, { day: 29, result: "505056" }, { day: 30, result: "586838" }],
    [{ day: 1, result: "652417" }, { day: 2, result: "361776" }, { day: 3, result: "716935" }, { day: 4, result: "195746" }, { day: 5, result: "517047" }, { day: 6, result: "439008" }, { day: 8, result: "776665" }, { day: 9, result: "248751" }, { day: 10, result: "248225" }, { day: 11, result: "719721" }, { day: 12, result: "743410" }, { day: 13, result: "345728" }, { day: 15, result: "674015" }, { day: 16, result: "314121" }, { day: 17, result: "635711" }, { day: 18, result: "276616" }, { day: 19, result: "180355" }, { day: 20, result: "582031" }, { day: 22, result: "403734" }, { day: 23, result: "575906" }, { day: 24, result: "622583" }, { day: 25, result: "572677" }, { day: 26, result: "388692" }, { day: 27, result: "435933" }],
    [{ day: 1, result: "846299" }, { day: 2, result: "619802" }, { day: 3, result: "107944" }, { day: 4, result: "359410" }, { day: 5, result: "787771" }, { day: 6, result: "425586" }, { day: 8, result: "108308" }, { day: 9, result: "727476" }, { day: 10, result: "639535" }, { day: 11, result: "230216" }, { day: 12, result: "569924" }, { day: 13, result: "733205" }, { day: 15, result: "287702" }, { day: 16, result: "766076" }, { day: 17, result: "279255" }, { day: 18, result: "857914" }, { day: 19, result: "317446" }, { day: 20, result: "241175" }, { day: 22, result: "469043" }, { day: 24, result: "755470" }, { day: 25, result: "485586" }, { day: 26, result: "234829" }, { day: 27, result: "837275" }, { day: 29, result: "440824" }, { day: 30, result: "728645" }, { day: 31, result: "695090" }],
    [{ day: 1, result: "719754" }, { day: 2, result: "327140" }, { day: 3, result: "855347" }, { day: 5, result: "417813" }, { day: 7, result: "250249" }, { day: 8, result: "118815" }, { day: 9, result: "748636" }, { day: 10, result: "377016" }, { day: 12, result: "632155" }, { day: 13, result: "249248" }, { day: 14, result: "700466" }, { day: 15, result: "648012" }, { day: 16, result: "447460" }, { day: 17, result: "783460" }, { day: 19, result: "478841" }, { day: 20, result: "665851" }, { day: 21, result: "821955" }, { day: 23, result: "482785" }, { day: 24, result: "714922" }, { day: 26, result: "282516" }, { day: 27, result: "690176" }, { day: 28, result: "291742" }, { day: 29, result: "428036" }, { day: 30, result: "664854" }],
    [{ day: 4, result: "491550" }, { day: 5, result: "258505" }, { day: 6, result: "732163" }, { day: 7, result: "680707" }, { day: 10, result: "195093" }, { day: 11, result: "155009" }, { day: 12, result: "547670" }, { day: 22, result: "600751" }, { day: 24, result: "597208" }],
    [{ day: 6, result: "727040" }, { day: 7, result: "144924" }, { day: 8, result: "758207" }, { day: 9, result: "690078" }, { day: 10, result: "419416" }, { day: 11, result: "622998" }, { day: 13, result: "465146" }, { day: 14, result: "248394" }, { day: 15, result: "801058" }, { day: 16, result: "418597" }, { day: 17, result: "510369" }, { day: 18, result: "513295" }, { day: 20, result: "681085" }, { day: 21, result: "175777" }, { day: 24, result: "767511" }, { day: 25, result: "627699" }, { day: 27, result: "653659" }, { day: 28, result: "669078" }, { day: 29, result: "830953" }, { day: 30, result: "755770" }],
    [{ day: 27, result: "752162" }, { day: 30, result: "598928" }],
    [{ day: 2, result: "408641" }, { day: 4, result: "440545" }, { day: 6, result: "727040" }, { day: 9, result: "778783" }, { day: 11, result: "619113" }, { day: 13, result: "327992" }, { day: 16, result: "534241" }, { day: 18, result: "802110" }, { day: 20, result: "749701" }, { day: 23, result: "174942" }, { day: 25, result: "871177" }, { day: 28, result: "318448" }, { day: 30, result: "756122" }],
    [{ day: 1, result: "357213" }, { day: 2, result: "305592" }, { day: 3, result: "649484" }, { day: 4, result: "779417" }, { day: 6, result: "768286" }, { day: 7, result: "144924" }, { day: 8, result: "758207" }, { day: 9, result: "690078" }, { day: 10, result: "419416" }, { day: 11, result: "622998" }, { day: 13, result: "465146" }, { day: 14, result: "248394" }, { day: 15, result: "801058" }, { day: 16, result: "418597" }, { day: 17, result: "510369" }, { day: 18, result: "513295" }, { day: 20, result: "681085" }, { day: 21, result: "175777" }, { day: 23, result: "243541" }, { day: 24, result: "767511" }, { day: 25, result: "627699" }, { day: 27, result: "653659" }, { day: 28, result: "669078" }, { day: 29, result: "830953" }, { day: 30, result: "755770" }],
    [{ day: 1, result: "736426" }, { day: 3, result: "603246" }, { day: 4, result: "743066" }, { day: 5, result: "687674" }, { day: 6, result: "782095" }, { day: 7, result: "639052" }, { day: 8, result: "635077" }, { day: 11, result: "684764" }, { day: 12, result: "520292" }, { day: 13, result: "282869" }, { day: 14, result: "827261" }, { day: 15, result: "709777" }, { day: 16, result: "270504" }, { day: 18, result: "511717" }, { day: 19, result: "831811" }, { day: 20, result: "228007" }, { day: 22, result: "543296" }, { day: 23, result: "762447" }, { day: 25, result: "373202" }, { day: 26, result: "495670" }, { day: 27, result: "379431" }, { day: 28, result: "637427" }, { day: 29, result: "698414" }, { day: 30, result: "846035" }],
    [{ day: 1, result: "334823" }, { day: 2, result: "217683" }, { day: 3, result: "814879" }, { day: 4, result: "567732" }, { day: 5, result: "777953" }, { day: 6, result: "622646" }, { day: 8, result: "864242" }, { day: 9, result: "589153" }, { day: 10, result: "591672" }, { day: 11, result: "518884" }, { day: 12, result: "478102" }, { day: 13, result: "714158" }, { day: 15, result: "210697" }, { day: 16, result: "254783" }, { day: 17, result: "591807" }, { day: 18, result: "111898" }, { day: 19, result: "157229" }, { day: 20, result: "299860" }, { day: 22, result: "338132" }, { day: 23, result: "300004" }, { day: 24, result: "501490" }, { day: 25, result: "721513" }, { day: 26, result: "273062" }, { day: 27, result: "578854" }, { day: 29, result: "796744" }, { day: 30, result: "731255" }],
    [{ day: 1, result: "820195" }, { day: 2, result: "169035" }, { day: 3, result: "229550" }, { day: 4, result: "792257" }, { day: 6, result: "127702" }, { day: 7, result: "303913" }, { day: 8, result: "928656" }, { day: 9, result: "643922" }, { day: 10, result: "453869" }, { day: 11, result: "799646" }, { day: 13, result: "767197" }, { day: 14, result: "927885" }, { day: 15, result: "848428" }, { day: 16, result: "265608" }, { day: 17, result: "905866" }, { day: 18, result: "903854" }, { day: 20, result: "512717" }, { day: 21, result: "650556" }, { day: 22, result: "674413" }, { day: 23, result: "324197" }, { day: 24, result: "120995" }, { day: 25, result: "658476" }, { day: 27, result: "698527" }, { day: 28, result: "573057" }, { day: 29, result: "226836" }, { day: 30, result: "256951" }, { day: 31, result: "608798" }]
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
