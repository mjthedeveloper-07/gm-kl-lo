// Historical lottery winning numbers for pattern analysis and predictions
// Extracted from lottery charts 2012-2016

export interface HistoricalNumber {
  year: number;
  month: number;
  day: number;
  number: string;
}

// Comprehensive historical numbers from charts
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
