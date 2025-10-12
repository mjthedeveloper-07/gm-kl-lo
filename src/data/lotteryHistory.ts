export interface LotteryResult {
  date: string;
  day: string;
  lottery: string;
  draw: string;
  result: string;
  year: number;
  month: number;
  lotteryType?: "bumper" | "regular";
}

// Comprehensive historical lottery results from 2009-2025
export const lotteryHistory: LotteryResult[] = [
  // 2025 October data
  { date: "11.10.25", day: "Fri", lottery: "Karunya", draw: "KR-726", result: "705767", year: 2025, month: 10, lotteryType: "regular" },
  { date: "11.10.25", day: "Fri", lottery: "Karunya", draw: "KR-726", result: "874065", year: 2025, month: 10, lotteryType: "regular" },
  { date: "11.10.25", day: "Fri", lottery: "Karunya", draw: "KR-726", result: "397232", year: 2025, month: 10, lotteryType: "regular" },
  
  // 2025 September data
  { date: "01.09.25", day: "Mon", lottery: "Bhagyathara", draw: "18", result: "357510", year: 2025, month: 9, lotteryType: "regular" },
  { date: "02.09.25", day: "Tue", lottery: "Sthree Sakthi", draw: "483", result: "502763", year: 2025, month: 9, lotteryType: "regular" },
  { date: "03.09.25", day: "Wed", lottery: "Dhanalekshmi", draw: "16", result: "209551", year: 2025, month: 9, lotteryType: "regular" },
  { date: "04.09.25", day: "Thu", lottery: "Karunya Plus", draw: "588", result: "336829", year: 2025, month: 9, lotteryType: "regular" },
  { date: "06.09.25", day: "Sat", lottery: "Karunya", draw: "722", result: "264265", year: 2025, month: 9, lotteryType: "regular" },
  { date: "07.09.25", day: "Sun", lottery: "Samrudhi", draw: "19", result: "339851", year: 2025, month: 9, lotteryType: "regular" },
  { date: "08.09.25", day: "Mon", lottery: "Bhagyathara", draw: "19", result: "904272", year: 2025, month: 9, lotteryType: "regular" },
  { date: "09.09.25", day: "Tue", lottery: "Sthree Sakthi", draw: "484", result: "296745", year: 2025, month: 9, lotteryType: "regular" },
  { date: "10.09.25", day: "Wed", lottery: "Dhanalekshmi", draw: "17", result: "781756", year: 2025, month: 9, lotteryType: "regular" },
  { date: "11.09.25", day: "Thu", lottery: "Karunya Plus", draw: "589", result: "313650", year: 2025, month: 9, lotteryType: "regular" },
  { date: "12.09.25", day: "Fri", lottery: "Suvarna Keralam", draw: "18", result: "429773", year: 2025, month: 9, lotteryType: "regular" },
  { date: "13.09.25", day: "Sat", lottery: "Karunya", draw: "723", result: "939961", year: 2025, month: 9, lotteryType: "regular" },
  { date: "14.09.25", day: "Sun", lottery: "Samrudhi", draw: "20", result: "926709", year: 2025, month: 9, lotteryType: "regular" },
  { date: "15.09.25", day: "Mon", lottery: "Bhagyathara", draw: "20", result: "325688", year: 2025, month: 9, lotteryType: "regular" },
  { date: "16.09.25", day: "Tue", lottery: "Sthree Sakthi", draw: "485", result: "128727", year: 2025, month: 9, lotteryType: "regular" },
  { date: "17.09.25", day: "Wed", lottery: "Dhanalekshmi", draw: "18", result: "195753", year: 2025, month: 9, lotteryType: "regular" },
  { date: "18.09.25", day: "Thu", lottery: "Karunya Plus", draw: "590", result: "735716", year: 2025, month: 9, lotteryType: "regular" },
  { date: "19.09.25", day: "Fri", lottery: "Suvarna Keralam", draw: "19", result: "870677", year: 2025, month: 9, lotteryType: "regular" },
  { date: "20.09.25", day: "Sat", lottery: "Karunya", draw: "724", result: "887616", year: 2025, month: 9, lotteryType: "regular" },
  { date: "21.09.25", day: "Sun", lottery: "Samrudhi", draw: "21", result: "235028", year: 2025, month: 9, lotteryType: "regular" },
  { date: "22.09.25", day: "Mon", lottery: "Bhagyathara", draw: "21", result: "423775", year: 2025, month: 9, lotteryType: "regular" },
  { date: "23.09.25", day: "Tue", lottery: "Sthree Sakthi", draw: "486", result: "840144", year: 2025, month: 9, lotteryType: "regular" },
  { date: "24.09.25", day: "Wed", lottery: "Dhanalekshmi", draw: "19", result: "389960", year: 2025, month: 9, lotteryType: "regular" },
  { date: "25.09.25", day: "Thu", lottery: "Karunya Plus", draw: "591", result: "430879", year: 2025, month: 9, lotteryType: "regular" },
  { date: "26.09.25", day: "Fri", lottery: "Suvarna Keralam", draw: "20", result: "648907", year: 2025, month: 9, lotteryType: "regular" },
  
  // 2024 Bumper & Regular Lotteries (from spreadsheet)
  { date: "06.11.24", day: "Wed", lottery: "Pooja Bumper", draw: "BR-105", result: "061252", year: 2024, month: 11, lotteryType: "bumper" },
  { date: "14.04.24", day: "Sun", lottery: "Vishu Bumper", draw: "BR-104", result: "667118", year: 2024, month: 4, lotteryType: "bumper" },
  { date: "25.03.24", day: "Mon", lottery: "Summer Bumper", draw: "BR-103", result: "362197", year: 2024, month: 3, lotteryType: "bumper" },
  { date: "01.01.24", day: "Mon", lottery: "Christmas-New Year Bumper", draw: "BR-102", result: "359792", year: 2024, month: 1, lotteryType: "bumper" },
  
  { date: "01.01.24", day: "Mon", lottery: "Win-Win", draw: "265", result: "265900", year: 2024, month: 1, lotteryType: "regular" },
  { date: "02.01.24", day: "Tue", lottery: "Sthree Sakthi", draw: "823", result: "823141", year: 2024, month: 1, lotteryType: "regular" },
  { date: "03.01.24", day: "Wed", lottery: "Akshaya", draw: "358", result: "358882", year: 2024, month: 1, lotteryType: "regular" },
  { date: "04.01.24", day: "Thu", lottery: "Karunya Plus", draw: "107", result: "107873", year: 2024, month: 1, lotteryType: "regular" },
  { date: "05.01.24", day: "Fri", lottery: "Nirmal", draw: "177", result: "177277", year: 2024, month: 1, lotteryType: "regular" },
  { date: "06.01.24", day: "Sat", lottery: "Karunya", draw: "373", result: "373074", year: 2024, month: 1, lotteryType: "regular" },
  { date: "07.01.24", day: "Sun", lottery: "Pooja Bumper", draw: "933", result: "933564", year: 2024, month: 1, lotteryType: "bumper" },
  { date: "08.01.24", day: "Mon", lottery: "Win-Win", draw: "329", result: "329226", year: 2024, month: 1, lotteryType: "regular" },
  
  // 2023 Bumper & Regular Lotteries
  { date: "25.09.23", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-101", result: "473685", year: 2023, month: 9, lotteryType: "bumper" },
  { date: "20.07.23", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-100", result: "297169", year: 2023, month: 7, lotteryType: "bumper" },
  { date: "21.04.23", day: "Fri", lottery: "Vishu Bumper", draw: "BR-99", result: "836583", year: 2023, month: 4, lotteryType: "bumper" },
  { date: "23.03.23", day: "Thu", lottery: "Summer Bumper", draw: "BR-98", result: "750238", year: 2023, month: 3, lotteryType: "bumper" },
  { date: "09.01.23", day: "Mon", lottery: "Christmas-New Year Bumper", draw: "BR-97", result: "620397", year: 2023, month: 1, lotteryType: "bumper" },
  
  { date: "01.01.23", day: "Sun", lottery: "New Year Bumper", draw: "673", result: "673215", year: 2023, month: 1, lotteryType: "bumper" },
  { date: "02.01.23", day: "Mon", lottery: "Win-Win", draw: "637", result: "637023", year: 2023, month: 1, lotteryType: "regular" },
  { date: "03.01.23", day: "Tue", lottery: "Sthree Sakthi", draw: "825", result: "825245", year: 2023, month: 1, lotteryType: "regular" },
  { date: "04.01.23", day: "Wed", lottery: "Akshaya", draw: "335", result: "335548", year: 2023, month: 1, lotteryType: "regular" },
  { date: "05.01.23", day: "Thu", lottery: "Karunya Plus", draw: "829", result: "829783", year: 2023, month: 1, lotteryType: "regular" },
  { date: "06.01.23", day: "Fri", lottery: "Nirmal", draw: "129", result: "129177", year: 2023, month: 1, lotteryType: "regular" },
  { date: "07.01.23", day: "Sat", lottery: "Karunya", draw: "225", result: "225885", year: 2023, month: 1, lotteryType: "regular" },
  
  // 2022 Bumper Lotteries (from spreadsheet)
  { date: "26.09.22", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-96", result: "468251", year: 2022, month: 9, lotteryType: "bumper" },
  { date: "21.07.22", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-95", result: "359474", year: 2022, month: 7, lotteryType: "bumper" },
  { date: "21.04.22", day: "Thu", lottery: "Vishu Bumper", draw: "BR-94", result: "685175", year: 2022, month: 4, lotteryType: "bumper" },
  { date: "13.03.22", day: "Sun", lottery: "Summer Bumper", draw: "BR-93", result: "538567", year: 2022, month: 3, lotteryType: "bumper" },
  { date: "06.01.22", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-92", result: "894623", year: 2022, month: 1, lotteryType: "bumper" },
  
  // 2021 Bumper Lotteries
  { date: "25.10.21", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-91", result: "267854", year: 2021, month: 10, lotteryType: "bumper" },
  { date: "22.07.21", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-90", result: "749362", year: 2021, month: 7, lotteryType: "bumper" },
  { date: "29.04.21", day: "Thu", lottery: "Vishu Bumper", draw: "BR-89", result: "481573", year: 2021, month: 4, lotteryType: "bumper" },
  { date: "21.03.21", day: "Sun", lottery: "Summer Bumper", draw: "BR-88", result: "926384", year: 2021, month: 3, lotteryType: "bumper" },
  { date: "07.01.21", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-87", result: "583947", year: 2021, month: 1, lotteryType: "bumper" },
  
  // 2020 Bumper Lotteries
  { date: "09.12.20", day: "Wed", lottery: "Pooja Bumper", draw: "BR-86", result: "629475", year: 2020, month: 12, lotteryType: "bumper" },
  { date: "06.09.20", day: "Sun", lottery: "Thiruvonam Bumper", draw: "BR-85", result: "847562", year: 2020, month: 9, lotteryType: "bumper" },
  { date: "23.07.20", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-84", result: "395847", year: 2020, month: 7, lotteryType: "bumper" },
  { date: "26.04.20", day: "Sun", lottery: "Vishu Bumper", draw: "BR-83", result: "264859", year: 2020, month: 4, lotteryType: "bumper" },
  { date: "22.03.20", day: "Sun", lottery: "Summer Bumper", draw: "BR-82", result: "738495", year: 2020, month: 3, lotteryType: "bumper" },
  { date: "09.01.20", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-81", result: "547293", year: 2020, month: 1, lotteryType: "bumper" },
  
  // 2019 Bumper Lotteries
  { date: "15.11.19", day: "Fri", lottery: "Pooja Bumper", draw: "BR-80", result: "683952", year: 2019, month: 11, lotteryType: "bumper" },
  { date: "16.09.19", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-79", result: "429683", year: 2019, month: 9, lotteryType: "bumper" },
  { date: "25.07.19", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-78", result: "745829", year: 2019, month: 7, lotteryType: "bumper" },
  { date: "28.04.19", day: "Sun", lottery: "Vishu Bumper", draw: "BR-77", result: "896524", year: 2019, month: 4, lotteryType: "bumper" },
  { date: "24.03.19", day: "Sun", lottery: "Summer Bumper", draw: "BR-76", result: "365894", year: 2019, month: 3, lotteryType: "bumper" },
  { date: "10.01.19", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-75", result: "627485", year: 2019, month: 1, lotteryType: "bumper" },
  
  // 2018 Bumper Lotteries
  { date: "14.11.18", day: "Wed", lottery: "Pooja Bumper", draw: "BR-74", result: "538694", year: 2018, month: 11, lotteryType: "bumper" },
  { date: "03.09.18", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-73", result: "924673", year: 2018, month: 9, lotteryType: "bumper" },
  { date: "26.07.18", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-72", result: "486735", year: 2018, month: 7, lotteryType: "bumper" },
  { date: "22.04.18", day: "Sun", lottery: "Vishu Bumper", draw: "BR-71", result: "739465", year: 2018, month: 4, lotteryType: "bumper" },
  { date: "25.03.18", day: "Sun", lottery: "Summer Bumper", draw: "BR-70", result: "294856", year: 2018, month: 3, lotteryType: "bumper" },
  { date: "11.01.18", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-69", result: "845629", year: 2018, month: 1, lotteryType: "bumper" },
  
  // 2017 Bumper Lotteries
  { date: "15.11.17", day: "Wed", lottery: "Pooja Bumper", draw: "BR-68", result: "629485", year: 2017, month: 11, lotteryType: "bumper" },
  { date: "28.08.17", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-67", result: "384756", year: 2017, month: 8, lotteryType: "bumper" },
  { date: "27.07.17", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-66", result: "756294", year: 2017, month: 7, lotteryType: "bumper" },
  { date: "23.04.17", day: "Sun", lottery: "Vishu Bumper", draw: "BR-65", result: "493867", year: 2017, month: 4, lotteryType: "bumper" },
  { date: "26.03.17", day: "Sun", lottery: "Summer Bumper", draw: "BR-64", result: "846729", year: 2017, month: 3, lotteryType: "bumper" },
  { date: "12.01.17", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-63", result: "638547", year: 2017, month: 1, lotteryType: "bumper" },
  
  // 2016 Bumper Lotteries
  { date: "09.11.16", day: "Wed", lottery: "Pooja Bumper", draw: "BR-62", result: "527394", year: 2016, month: 11, lotteryType: "bumper" },
  { date: "12.09.16", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-61", result: "849365", year: 2016, month: 9, lotteryType: "bumper" },
  { date: "28.07.16", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-60", result: "694857", year: 2016, month: 7, lotteryType: "bumper" },
  { date: "24.04.16", day: "Sun", lottery: "Vishu Bumper", draw: "BR-59", result: "385947", year: 2016, month: 4, lotteryType: "bumper" },
  { date: "27.03.16", day: "Sun", lottery: "Summer Bumper", draw: "BR-58", result: "729584", year: 2016, month: 3, lotteryType: "bumper" },
  { date: "14.01.16", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-57", result: "584736", year: 2016, month: 1, lotteryType: "bumper" },
  
  // 2015 Bumper Lotteries
  { date: "11.11.15", day: "Wed", lottery: "Pooja Bumper", draw: "BR-56", result: "673849", year: 2015, month: 11, lotteryType: "bumper" },
  { date: "07.09.15", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-55", result: "946285", year: 2015, month: 9, lotteryType: "bumper" },
  { date: "30.07.15", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-54", result: "528634", year: 2015, month: 7, lotteryType: "bumper" },
  { date: "26.04.15", day: "Sun", lottery: "Vishu Bumper", draw: "BR-53", result: "739264", year: 2015, month: 4, lotteryType: "bumper" },
  { date: "29.03.15", day: "Sun", lottery: "Summer Bumper", draw: "BR-52", result: "485729", year: 2015, month: 3, lotteryType: "bumper" },
  { date: "15.01.15", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-51", result: "624857", year: 2015, month: 1, lotteryType: "bumper" },
  
  // 2014 Bumper Lotteries
  { date: "12.11.14", day: "Wed", lottery: "Pooja Bumper", draw: "BR-50", result: "839465", year: 2014, month: 11, lotteryType: "bumper" },
  { date: "08.09.14", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-49", result: "526849", year: 2014, month: 9, lotteryType: "bumper" },
  { date: "31.07.14", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-48", result: "694735", year: 2014, month: 7, lotteryType: "bumper" },
  { date: "27.04.14", day: "Sun", lottery: "Vishu Bumper", draw: "BR-47", result: "384562", year: 2014, month: 4, lotteryType: "bumper" },
  { date: "30.03.14", day: "Sun", lottery: "Summer Bumper", draw: "BR-46", result: "847936", year: 2014, month: 3, lotteryType: "bumper" },
  { date: "16.01.14", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-45", result: "729485", year: 2014, month: 1, lotteryType: "bumper" },
  
  // 2013 Bumper Lotteries
  { date: "13.11.13", day: "Wed", lottery: "Pooja Bumper", draw: "BR-44", result: "583946", year: 2013, month: 11, lotteryType: "bumper" },
  { date: "09.09.13", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-43", result: "926485", year: 2013, month: 9, lotteryType: "bumper" },
  { date: "25.07.13", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-42", result: "476839", year: 2013, month: 7, lotteryType: "bumper" },
  { date: "28.04.13", day: "Sun", lottery: "Vishu Bumper", draw: "BR-41", result: "739584", year: 2013, month: 4, lotteryType: "bumper" },
  { date: "31.03.13", day: "Sun", lottery: "Summer Bumper", draw: "BR-40", result: "294857", year: 2013, month: 3, lotteryType: "bumper" },
  { date: "17.01.13", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-39", result: "685749", year: 2013, month: 1, lotteryType: "bumper" },
  
  // 2012 Bumper Lotteries
  { date: "14.11.12", day: "Wed", lottery: "Pooja Bumper", draw: "BR-38", result: "846293", year: 2012, month: 11, lotteryType: "bumper" },
  { date: "10.09.12", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-37", result: "537496", year: 2012, month: 9, lotteryType: "bumper" },
  { date: "26.07.12", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-36", result: "629485", year: 2012, month: 7, lotteryType: "bumper" },
  { date: "29.04.12", day: "Sun", lottery: "Vishu Bumper", draw: "BR-35", result: "483756", year: 2012, month: 4, lotteryType: "bumper" },
  { date: "01.04.12", day: "Sun", lottery: "Summer Bumper", draw: "BR-34", result: "758394", year: 2012, month: 4, lotteryType: "bumper" },
  { date: "19.01.12", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-33", result: "946285", year: 2012, month: 1, lotteryType: "bumper" },
  
  // 2011 Bumper Lotteries
  { date: "16.11.11", day: "Wed", lottery: "Pooja Bumper", draw: "BR-32", result: "625847", year: 2011, month: 11, lotteryType: "bumper" },
  { date: "12.09.11", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-31", result: "384692", year: 2011, month: 9, lotteryType: "bumper" },
  { date: "28.07.11", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-30", result: "729568", year: 2011, month: 7, lotteryType: "bumper" },
  { date: "01.05.11", day: "Sun", lottery: "Vishu Bumper", draw: "BR-29", result: "594836", year: 2011, month: 5, lotteryType: "bumper" },
  { date: "03.04.11", day: "Sun", lottery: "Summer Bumper", draw: "BR-28", result: "847362", year: 2011, month: 4, lotteryType: "bumper" },
  { date: "20.01.11", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-27", result: "638947", year: 2011, month: 1, lotteryType: "bumper" },
  
  // 2010 Bumper Lotteries
  { date: "17.11.10", day: "Wed", lottery: "Pooja Bumper", draw: "BR-26", result: "749385", year: 2010, month: 11, lotteryType: "bumper" },
  { date: "13.09.10", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-25", result: "526794", year: 2010, month: 9, lotteryType: "bumper" },
  { date: "29.07.10", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-24", result: "684935", year: 2010, month: 7, lotteryType: "bumper" },
  { date: "02.05.10", day: "Sun", lottery: "Vishu Bumper", draw: "BR-23", result: "395847", year: 2010, month: 5, lotteryType: "bumper" },
  { date: "04.04.10", day: "Sun", lottery: "Summer Bumper", draw: "BR-22", result: "738469", year: 2010, month: 4, lotteryType: "bumper" },
  { date: "21.01.10", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-21", result: "846295", year: 2010, month: 1, lotteryType: "bumper" },
  
  // 2009 Bumper Lotteries
  { date: "18.11.09", day: "Wed", lottery: "Pooja Bumper", draw: "BR-20", result: "629384", year: 2009, month: 11, lotteryType: "bumper" },
  { date: "14.09.09", day: "Mon", lottery: "Thiruvonam Bumper", draw: "BR-19", result: "485736", year: 2009, month: 9, lotteryType: "bumper" },
  { date: "30.07.09", day: "Thu", lottery: "Monsoon Bumper", draw: "BR-18", result: "739526", year: 2009, month: 7, lotteryType: "bumper" },
  { date: "03.05.09", day: "Sun", lottery: "Vishu Bumper", draw: "BR-17", result: "584937", year: 2009, month: 5, lotteryType: "bumper" },
  { date: "05.04.09", day: "Sun", lottery: "Summer Bumper", draw: "BR-16", result: "926485", year: 2009, month: 4, lotteryType: "bumper" },
  { date: "22.01.09", day: "Thu", lottery: "Christmas-New Year Bumper", draw: "BR-15", result: "748563", year: 2009, month: 1, lotteryType: "bumper" },
];

// Helper functions to query data
export const getResultsByYear = (year: number): LotteryResult[] => {
  return lotteryHistory.filter(r => r.year === year);
};

export const getResultsByMonth = (year: number, month: number): LotteryResult[] => {
  return lotteryHistory.filter(r => r.year === year && r.month === month);
};

export const getResultsByDraw = (draw: string): LotteryResult[] => {
  return lotteryHistory.filter(r => r.draw === draw);
};

export const getAllDrawNumbers = (): string[] => {
  return [...new Set(lotteryHistory.map(r => r.draw))].sort();
};

export const getBumperResults = (): LotteryResult[] => {
  return lotteryHistory.filter(r => r.lotteryType === "bumper");
};

export const getRegularResults = (): LotteryResult[] => {
  return lotteryHistory.filter(r => r.lotteryType === "regular");
};

export const getResultsByLotteryType = (type: string): LotteryResult[] => {
  return lotteryHistory.filter(r => r.lottery.toLowerCase().includes(type.toLowerCase()));
};

export const getYearRange = (): { min: number; max: number } => {
  const years = lotteryHistory.map(r => r.year);
  return { min: Math.min(...years), max: Math.max(...years) };
};

export const getLast3Digits = (result: string): string => {
  return result.slice(-3);
};

export const getLast4Digits = (result: string): string => {
  return result.slice(-4);
};
