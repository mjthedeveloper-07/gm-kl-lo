// Kerala Lottery Results for 2023
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

export const generate2023LotteryData = (): LotteryEntry[] => {
  const data: LotteryEntry[] = [];
  
  const monthlyData = [
    [{ day: 1, result: "673215" }, { day: 2, result: "697023" }, { day: 3, result: "825245" }, { day: 4, result: "235548" }, { day: 5, result: "829783" }, { day: 6, result: "129177" }, { day: 7, result: "225885" }, { day: 8, result: "665886" }, { day: 9, result: "670474" }, { day: 10, result: "699910" }, { day: 11, result: "144539" }, { day: 12, result: "522034" }, { day: 13, result: "289981" }, { day: 14, result: "890581" }, { day: 15, result: "286861" }, { day: 16, result: "634255" }, { day: 17, result: "116554" }, { day: 18, result: "327216" }, { day: 19, result: "236433" }, { day: 20, result: "332073" }, { day: 21, result: "704947" }, { day: 22, result: "220378" }, { day: 23, result: "150650" }, { day: 24, result: "216469" }, { day: 25, result: "318488" }, { day: 27, result: "717052" }, { day: 28, result: "151451" }, { day: 29, result: "884555" }, { day: 30, result: "444962" }, { day: 31, result: "921967" }],
    [{ day: 1, result: "148407" }, { day: 2, result: "726145" }, { day: 3, result: "640222" }, { day: 4, result: "683576" }, { day: 5, result: "840504" }, { day: 6, result: "698752" }, { day: 7, result: "501963" }, { day: 8, result: "525247" }, { day: 9, result: "982748" }, { day: 10, result: "672485" }, { day: 11, result: "342893" }, { day: 12, result: "820555" }, { day: 13, result: "317032" }, { day: 14, result: "570994" }, { day: 15, result: "544194" }, { day: 16, result: "145424" }, { day: 17, result: "773104" }, { day: 18, result: "560758" }, { day: 19, result: "222282" }, { day: 20, result: "405795" }, { day: 21, result: "375239" }, { day: 22, result: "613551" }, { day: 23, result: "243910" }, { day: 24, result: "655771" }, { day: 25, result: "818775" }, { day: 26, result: "830529" }, { day: 27, result: "270100" }, { day: 28, result: "104268" }],
    [{ day: 2, result: "110270" }, { day: 3, result: "373171" }, { day: 4, result: "853989" }, { day: 5, result: "996627" }, { day: 6, result: "478568" }, { day: 7, result: "317545" }, { day: 8, result: "365438" }, { day: 9, result: "495979" }, { day: 10, result: "214912" }, { day: 11, result: "300259" }, { day: 12, result: "338068" }, { day: 13, result: "617055" }, { day: 14, result: "672019" }, { day: 15, result: "220333" }, { day: 16, result: "911065" }, { day: 17, result: "473576" }, { day: 18, result: "570940" }, { day: 19, result: "225511" }, { day: 20, result: "384524" }, { day: 21, result: "965359" }, { day: 22, result: "626621" }, { day: 23, result: "800219" }, { day: 24, result: "475588" }, { day: 25, result: "206025" }, { day: 26, result: "858713" }, { day: 27, result: "258961" }, { day: 28, result: "893279" }, { day: 29, result: "115501" }, { day: 30, result: "845711" }, { day: 31, result: "145621" }],
    [{ day: 1, result: "178792" }, { day: 2, result: "241754" }, { day: 3, result: "499106" }, { day: 4, result: "280459" }, { day: 5, result: "445814" }, { day: 6, result: "523562" }, { day: 7, result: "484827" }, { day: 8, result: "434230" }, { day: 9, result: "206200" }, { day: 10, result: "409074" }, { day: 11, result: "799001" }, { day: 12, result: "919608" }, { day: 13, result: "586813" }, { day: 14, result: "917956" }, { day: 16, result: "131422" }, { day: 17, result: "254298" }, { day: 18, result: "322904" }, { day: 19, result: "857457" }, { day: 20, result: "624370" }, { day: 21, result: "511035" }, { day: 22, result: "814004" }, { day: 23, result: "407756" }, { day: 24, result: "188354" }, { day: 25, result: "798958" }, { day: 26, result: "268290" }, { day: 27, result: "435072" }, { day: 28, result: "255746" }, { day: 29, result: "171902" }, { day: 30, result: "667585" }],
    [{ day: 1, result: "939503" }, { day: 3, result: "255835" }, { day: 4, result: "852356" }, { day: 5, result: "210777" }, { day: 6, result: "603113" }, { day: 7, result: "622186" }, { day: 8, result: "197092" }, { day: 9, result: "202737" }, { day: 10, result: "704626" }, { day: 11, result: "698536" }, { day: 12, result: "482230" }, { day: 13, result: "129409" }, { day: 14, result: "329221" }, { day: 15, result: "943012" }, { day: 16, result: "816456" }, { day: 17, result: "516213" }, { day: 18, result: "665263" }, { day: 19, result: "324277" }, { day: 20, result: "627833" }, { day: 21, result: "958011" }, { day: 22, result: "723519" }, { day: 23, result: "873084" }, { day: 24, result: "755357" }, { day: 25, result: "390862" }, { day: 26, result: "195777" }, { day: 27, result: "744599" }, { day: 28, result: "588588" }, { day: 29, result: "169699" }, { day: 30, result: "247429" }, { day: 31, result: "557075" }],
    [{ day: 1, result: "516437" }, { day: 3, result: "738617" }, { day: 4, result: "682046" }, { day: 5, result: "435030" }, { day: 6, result: "506004" }, { day: 8, result: "302095" }, { day: 9, result: "864867" }, { day: 10, result: "905089" }, { day: 11, result: "190927" }, { day: 13, result: "695529" }, { day: 14, result: "810616" }, { day: 15, result: "772087" }, { day: 16, result: "556302" }, { day: 17, result: "489862" }, { day: 19, result: "588401" }, { day: 20, result: "253199" }, { day: 22, result: "507803" }, { day: 23, result: "507803" }, { day: 24, result: "965999" }, { day: 25, result: "873729" }, { day: 26, result: "364446" }, { day: 27, result: "748787" }, { day: 30, result: "713201" }],
    [{ day: 1, result: "839068" }, { day: 3, result: "787439" }, { day: 7, result: "137452" }, { day: 9, result: "108952" }, { day: 11, result: "303966" }, { day: 13, result: "787010" }, { day: 29, result: "203263" }, { day: 30, result: "465665" }],
    [{ day: 11, result: "633441" }, { day: 29, result: "547717" }],
    [],
    [{ day: 31, result: "226992" }],
    [],
    [{ day: 31, result: "450400" }]
  ];
  
  monthlyData.forEach((monthData, monthIndex) => {
    monthData.forEach(({ day, result }) => {
      const dateStr = `2023-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);
      
      data.push({
        date: dateStr,
        result,
        month: monthIndex + 1,
        year: 2023,
        lottery_name: getLotteryName(dateObj),
        draw_number: `W-2023-${monthIndex + 1}-${day}`,
        lottery_type: "regular"
      });
    });
  });
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
};
