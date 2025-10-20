// ============================================================
// 2025 Kerala Lottery Chart Data - Complete Actual Results
// Updated through October 19, 2025
// ============================================================
// Confirmed Holidays (no draw - marked as ******):
//   - January 26: Republic Day
//   - May 1: May Day / Labour Day
//   - August 15: Independence Day
//   - September 5: Onam Holiday
//   - September 27: Holiday
//   - October 2: Gandhi Jayanti
// ============================================================

export interface LotteryEntry {
  date: string;
  result: string;
  month: number;
  year: number;
  lottery_name: string;
  draw_number: string;
  lottery_type: string;
}

// Month mapping
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Raw chart data extracted from 2025 Chart - organized by date (row) and month (column)
// Empty strings represent no draw that day (******) or future dates
const CHART_DATA: Record<number, Record<string, string>> = {
  1: { JAN: '379675', FEB: '344245', MAR: '242127', APR: '460124', MAY: '', JUN: '301061', JUL: '257441', AUG: '514226', SEP: '357510', OCT: '784922', NOV: '', DEC: '' }, // May 1: Labour Day holiday
  2: { JAN: '171048', FEB: '706478', MAR: '304976', APR: '513715', MAY: '726828', JUN: '860290', JUL: '350667', AUG: '354014', SEP: '502763', OCT: '', NOV: '', DEC: '' }, // Oct 2: Gandhi Jayanti holiday
  3: { JAN: '827858', FEB: '213366', MAR: '155804', APR: '345148', MAY: '179430', JUN: '145650', JUL: '324114', AUG: '677584', SEP: '209551', OCT: '823274', NOV: '', DEC: '' },
  4: { JAN: '258521', FEB: '726092', MAR: '279979', APR: '216211', MAY: '829012', JUN: '103715', JUL: '236657', AUG: '418177', SEP: '336829', OCT: '252617', NOV: '', DEC: '' },
  5: { JAN: '840995', FEB: '387132', MAR: '796564', APR: '928155', MAY: '500505', JUN: '387017', JUL: '195227', AUG: '299702', SEP: '', OCT: '275170', NOV: '', DEC: '' }, // Sep 5: Onam holiday
  6: { JAN: '918188', FEB: '706299', MAR: '639432', APR: '465907', MAY: '560215', JUN: '133796', JUL: '501046', AUG: '248735', SEP: '264265', OCT: '736437', NOV: '', DEC: '' },
  7: { JAN: '193404', FEB: '402137', MAR: '789821', APR: '808430', MAY: '819735', JUN: '164909', JUL: '745119', AUG: '612922', SEP: '339851', OCT: '313693', NOV: '', DEC: '' },
  8: { JAN: '303156', FEB: '876484', MAR: '264145', APR: '298420', MAY: '782442', JUN: '187348', JUL: '179140', AUG: '748405', SEP: '904272', OCT: '289424', NOV: '', DEC: '' },
  9: { JAN: '370854', FEB: '323600', MAR: '864255', APR: '237122', MAY: '339320', JUN: '420044', JUL: '106124', AUG: '842294', SEP: '296745', OCT: '511475', NOV: '', DEC: '' },
  10: { JAN: '525727', FEB: '740168', MAR: '209581', APR: '265809', MAY: '173629', JUN: '178246', JUL: '344766', AUG: '835995', SEP: '781756', OCT: '265228', NOV: '', DEC: '' },
  11: { JAN: '495793', FEB: '838612', MAR: '602245', APR: '210935', MAY: '368535', JUN: '182932', JUL: '258561', AUG: '631988', SEP: '313650', OCT: '705767', NOV: '', DEC: '' },
  12: { JAN: '846639', FEB: '456282', MAR: '375864', APR: '871330', MAY: '870939', JUN: '782804', JUL: '378007', AUG: '351367', SEP: '429773', OCT: '796935', NOV: '', DEC: '' },
  13: { JAN: '602998', FEB: '678480', MAR: '824501', APR: '659096', MAY: '502746', JUN: '493021', JUL: '395492', AUG: '807900', SEP: '939961', OCT: '219935', NOV: '', DEC: '' },
  14: { JAN: '641769', FEB: '475398', MAR: '379448', APR: '368974', MAY: '503860', JUN: '510311', JUL: '220046', AUG: '583002', SEP: '926709', OCT: '649740', NOV: '', DEC: '' },
  15: { JAN: '753116', FEB: '694997', MAR: '438123', APR: '216120', MAY: '527523', JUN: '442727', JUL: '697278', AUG: '', SEP: '325688', OCT: '867468', NOV: '', DEC: '' }, // Aug 15: Independence Day holiday
  16: { JAN: '586929', FEB: '401876', MAR: '498089', APR: '579460', MAY: '528610', JUN: '109153', JUL: '385280', AUG: '445643', SEP: '128727', OCT: '504987', NOV: '', DEC: '' },
  17: { JAN: '873570', FEB: '472768', MAR: '659533', APR: '351400', MAY: '693615', JUN: '496927', JUL: '440696', AUG: '819960', SEP: '195753', OCT: '749913', NOV: '', DEC: '' },
  18: { JAN: '584474', FEB: '678890', MAR: '237071', APR: '329752', MAY: '400420', JUN: '222080', JUL: '634706', AUG: '219851', SEP: '735716', OCT: '708982', NOV: '', DEC: '' },
  19: { JAN: '278750', FEB: '249155', MAR: '748920', APR: '394770', MAY: '586755', JUN: '705814', JUL: '224817', AUG: '470148', SEP: '870677', OCT: '718692', NOV: '', DEC: '' },
  20: { JAN: '123416', FEB: '665237', MAR: '379356', APR: '888919', MAY: '788753', JUN: '181790', JUL: '184440', AUG: '613976', SEP: '887616', OCT: '176282', NOV: '', DEC: '' },
  21: { JAN: '278750', FEB: '286610', MAR: '388649', APR: '720120', MAY: '193208', JUN: '135197', JUL: '538337', AUG: '763057', SEP: '235028', OCT: '', NOV: '', DEC: '' },
  22: { JAN: '761270', FEB: '945869', MAR: '906545', APR: '964505', MAY: '307617', JUN: '856706', JUL: '238887', AUG: '209957', SEP: '423775', OCT: '', NOV: '', DEC: '' },
  23: { JAN: '236460', FEB: '300562', MAR: '707158', APR: '383226', MAY: '171439', JUN: '709241', JUL: '678572', AUG: '261432', SEP: '840144', OCT: '', NOV: '', DEC: '' },
  24: { JAN: '603275', FEB: '224496', MAR: '458016', APR: '240522', MAY: '671411', JUN: '883464', JUL: '409455', AUG: '708923', SEP: '389960', OCT: '', NOV: '', DEC: '' },
  25: { JAN: '162254', FEB: '479575', MAR: '273137', APR: '854962', MAY: '245048', JUN: '770015', JUL: '433789', AUG: '377084', SEP: '430879', OCT: '', NOV: '', DEC: '' },
  26: { JAN: '', FEB: '400431', MAR: '471230', APR: '327499', MAY: '480956', JUN: '409920', JUL: '954960', AUG: '345939', SEP: '648907', OCT: '', NOV: '', DEC: '' }, // Jan 26: Republic Day holiday
  27: { JAN: '933705', FEB: '332063', MAR: '997621', APR: '602570', MAY: '423134', JUN: '357932', JUL: '803045', AUG: '636184', SEP: '', OCT: '', NOV: '', DEC: '' }, // Sep 27: Holiday
  28: { JAN: '610554', FEB: '627991', MAR: '191941', APR: '889640', MAY: '204266', JUN: '577518', JUL: '469412', AUG: '214059', SEP: '507167', OCT: '', NOV: '', DEC: '' },
  29: { JAN: '378982', FEB: '', MAR: '420046', APR: '520423', MAY: '318249', JUN: '145666', JUL: '379998', AUG: '302032', SEP: '669175', OCT: '', NOV: '', DEC: '' },
  30: { JAN: '108857', FEB: '', MAR: '422035', APR: '620900', MAY: '325948', JUN: '138974', JUL: '277376', AUG: '541229', SEP: '500622', OCT: '', NOV: '', DEC: '' },
  31: { JAN: '318374', FEB: '', MAR: '', APR: '', MAY: '514615', JUN: '', JUL: '941597', AUG: '122462', SEP: '', OCT: '', NOV: '', DEC: '' },
};

// Lottery names for each draw (rotating series by day of week)
const LOTTERY_SERIES = [
  'Win-Win',        // Sunday (0)
  'Sthree Sakthi',  // Monday (1)
  'Akshaya',        // Tuesday (2)
  'Karunya Plus',   // Wednesday (3)
  'Karunya',        // Thursday (4)
  'Nirmal',         // Friday (5)
  'Pournami'        // Saturday (6)
];

// Generate lottery name based on actual day of week
function getLotteryName(dateStr: string): string {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  return LOTTERY_SERIES[dayOfWeek];
}

// Generate draw number based on date and month
function getDrawNumber(date: number, month: number, year: number): string {
  const monthAbbrev = MONTHS[month - 1];
  return `W-${year}-${monthAbbrev}-${date}`;
}

// Convert chart data to structured lottery entries
export function generate2025LotteryData(): LotteryEntry[] {
  const entries: LotteryEntry[] = [];
  
  for (let date = 1; date <= 31; date++) {
    const dateData = CHART_DATA[date];
    if (!dateData) continue;
    
    MONTHS.forEach((monthName, monthIndex) => {
      const result = dateData[monthName];
      
      // Skip empty results (marked with empty string, ******, or missing data)
      if (!result || result.length !== 6) return;
      
      const month = monthIndex + 1;
      const year = 2025;
      
      // Create proper date string
      const dateStr = `2025-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
      
      // Validate date exists (e.g., Feb 30 doesn't exist)
      const dateObj = new Date(dateStr);
      if (dateObj.getMonth() + 1 !== month || dateObj.getDate() !== date) {
        return; // Skip invalid dates
      }
      
      entries.push({
        date: dateStr,
        result,
        month,
        year,
        lottery_name: getLotteryName(dateStr),
        draw_number: getDrawNumber(date, month, year),
        lottery_type: 'regular',
      });
    });
  }
  
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

// Get summary statistics
export function get2025DataStats() {
  const entries = generate2025LotteryData();
  const byMonth: Record<string, number> = {};
  
  entries.forEach(entry => {
    const monthName = MONTHS[entry.month - 1];
    byMonth[monthName] = (byMonth[monthName] || 0) + 1;
  });
  
  return {
    total: entries.length,
    byMonth,
    dateRange: {
      start: entries[0]?.date || '2025-01-01',
      end: entries[entries.length - 1]?.date || '2025-10-19',
    },
  };
}
