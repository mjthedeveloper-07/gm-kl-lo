// Historical lottery winning numbers for pattern analysis and predictions
// Extracted from lottery charts 2012-2016

export interface HistoricalNumber {
  year: number;
  month: number;
  day: number;
  number: string;
}

// Comprehensive historical numbers from charts (2012-2016, 2023)
export const historicalNumbers: HistoricalNumber[] = [
  // 2012 data
  { year: 2012, month: 1, day: 1, number: "479506" },
  { year: 2012, month: 1, day: 2, number: "113374" },
  { year: 2012, month: 1, day: 3, number: "201638" },
  { year: 2012, month: 1, day: 4, number: "524375" },
  { year: 2012, month: 1, day: 5, number: "118696" },
  { year: 2012, month: 1, day: 6, number: "339130" },
  { year: 2012, month: 1, day: 7, number: "273751" },
  { year: 2012, month: 1, day: 8, number: "122733" },
  { year: 2012, month: 1, day: 9, number: "307772" },
  { year: 2012, month: 1, day: 10, number: "205571" },
  
  // 2013 data
  { year: 2013, month: 1, day: 1, number: "516914" },
  { year: 2013, month: 1, day: 2, number: "180506" },
  { year: 2013, month: 1, day: 3, number: "281817" },
  { year: 2013, month: 1, day: 4, number: "209237" },
  { year: 2013, month: 1, day: 5, number: "471808" },
  
  // 2014 data  
  { year: 2014, month: 1, day: 1, number: "398143" },
  { year: 2014, month: 1, day: 3, number: "526233" },
  { year: 2014, month: 1, day: 4, number: "555639" },
  { year: 2014, month: 1, day: 5, number: "426009" },
  
  // 2015 data
  { year: 2015, month: 1, day: 1, number: "340274" },
  { year: 2015, month: 1, day: 2, number: "217755" },
  { year: 2015, month: 1, day: 4, number: "602052" },
  { year: 2015, month: 1, day: 5, number: "394210" },

  // 2023 Dear 1PM data - January
  { year: 2023, month: 1, day: 1, number: "76811" },
  { year: 2023, month: 1, day: 2, number: "61548" },
  { year: 2023, month: 1, day: 3, number: "41838" },
  { year: 2023, month: 1, day: 4, number: "38275" },
  { year: 2023, month: 1, day: 5, number: "86674" },
  { year: 2023, month: 1, day: 6, number: "42065" },
  { year: 2023, month: 1, day: 7, number: "83452" },
  { year: 2023, month: 1, day: 8, number: "34710" },
  { year: 2023, month: 1, day: 9, number: "11288" },
  { year: 2023, month: 1, day: 10, number: "05436" },
  { year: 2023, month: 1, day: 11, number: "21014" },
  { year: 2023, month: 1, day: 12, number: "79042" },
  { year: 2023, month: 1, day: 13, number: "99161" },
  { year: 2023, month: 1, day: 14, number: "21355" },
  { year: 2023, month: 1, day: 15, number: "10612" },
  { year: 2023, month: 1, day: 16, number: "36477" },
  { year: 2023, month: 1, day: 17, number: "63798" },
  { year: 2023, month: 1, day: 18, number: "88274" },
  { year: 2023, month: 1, day: 19, number: "35703" },
  { year: 2023, month: 1, day: 20, number: "74936" },
  { year: 2023, month: 1, day: 21, number: "64819" },
  { year: 2023, month: 1, day: 22, number: "13859" },
  { year: 2023, month: 1, day: 23, number: "42431" },
  { year: 2023, month: 1, day: 24, number: "18990" },
  { year: 2023, month: 1, day: 25, number: "21763" },
  { year: 2023, month: 1, day: 27, number: "16528" },
  { year: 2023, month: 1, day: 28, number: "37923" },
  { year: 2023, month: 1, day: 29, number: "65823" },
  { year: 2023, month: 1, day: 30, number: "03865" },
  { year: 2023, month: 1, day: 31, number: "59987" },

  // 2023 Dear 1PM data - February to December (sample entries)
  { year: 2023, month: 2, day: 1, number: "09481" },
  { year: 2023, month: 2, day: 2, number: "63378" },
  { year: 2023, month: 2, day: 3, number: "97487" },
  { year: 2023, month: 3, day: 1, number: "25999" },
  { year: 2023, month: 3, day: 2, number: "34286" },
  { year: 2023, month: 4, day: 1, number: "80727" },
  { year: 2023, month: 5, day: 1, number: "30281" },
  { year: 2023, month: 6, day: 1, number: "46025" },
  { year: 2023, month: 7, day: 1, number: "95168" },
  { year: 2023, month: 8, day: 1, number: "74237" },
  { year: 2023, month: 9, day: 1, number: "31976" },
  { year: 2023, month: 10, day: 1, number: "83529" },
  { year: 2023, month: 11, day: 1, number: "47643" },
  { year: 2023, month: 12, day: 1, number: "35435" },

  // 2023 Dear 6PM data (sample entries)
  { year: 2023, month: 1, day: 1, number: "63817" },
  { year: 2023, month: 1, day: 2, number: "15575" },
  { year: 2023, month: 1, day: 3, number: "64525" },
  { year: 2023, month: 2, day: 1, number: "17278" },
  { year: 2023, month: 3, day: 1, number: "34370" },

  // 2023 Dear 8PM data (sample entries)
  { year: 2023, month: 1, day: 1, number: "06537" },
  { year: 2023, month: 1, day: 2, number: "72457" },
  { year: 2023, month: 1, day: 5, number: "60452" },
  { year: 2023, month: 2, day: 1, number: "08309" },
  { year: 2023, month: 3, day: 1, number: "50983" },

  // 2025 data
  { year: 2025, month: 10, day: 12, number: "796935" },
];

// Helper functions
export const getNumbersByYear = (year: number): HistoricalNumber[] => {
  return historicalNumbers.filter(n => n.year === year);
};

export const getAllDigits = (): number[] => {
  return historicalNumbers.flatMap(n => n.number.split('').map(Number));
};

export const getDigitFrequency = (): Map<number, number> => {
  const frequency = new Map<number, number>();
  getAllDigits().forEach(digit => {
    frequency.set(digit, (frequency.get(digit) || 0) + 1);
  });
  return frequency;
};
