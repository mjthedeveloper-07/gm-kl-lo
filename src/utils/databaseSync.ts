import { supabase } from "@/integrations/supabase/client";
import { lotteryHistory, LotteryResult } from "@/data/lotteryHistory";

export async function syncLotteryDataToDatabase() {
  try {
    console.log("Starting lottery data sync to database...");
    
    // Transform the data to match database schema
    const dbRecords = lotteryHistory.map(record => ({
      date: convertToISODate(record.date),
      lottery_name: record.lottery,
      draw_number: record.draw,
      result: record.result,
      year: record.year,
      month: record.month,
      lottery_type: record.lotteryType
    }));

    // Insert in batches to avoid timeout
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < dbRecords.length; i += batchSize) {
      const batch = dbRecords.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('lottery_results')
        .upsert(batch, { 
          onConflict: 'date,draw_number',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error(`Error syncing batch ${i / batchSize + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`Synced batch ${i / batchSize + 1} (${successCount} records)`);
      }
    }

    console.log(`Sync complete: ${successCount} succeeded, ${errorCount} failed`);
    return { success: true, successCount, errorCount };
  } catch (error) {
    console.error("Database sync failed:", error);
    return { success: false, error };
  }
}

export async function fetchLotteryDataFromDatabase(): Promise<LotteryResult[]> {
  try {
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // Transform database records back to LotteryResult format
    return data.map(record => ({
      date: formatDateFromISO(record.date),
      day: getDayOfWeek(record.date),
      lottery: record.lottery_name,
      draw: record.draw_number,
      result: record.result,
      year: record.year,
      month: record.month,
      lotteryType: record.lottery_type as "bumper" | "regular"
    }));
  } catch (error) {
    console.error("Error fetching lottery data from database:", error);
    return [];
  }
}

// Helper function to convert date format "DD.MM.YY" to ISO "YYYY-MM-DD"
function convertToISODate(dateStr: string): string {
  const [day, month, year] = dateStr.split('.');
  const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Helper function to convert ISO date back to "DD.MM.YY" format
function formatDateFromISO(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  const shortYear = year.slice(2);
  return `${day}.${month}.${shortYear}`;
}

// Helper function to get day of week
function getDayOfWeek(isoDate: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(isoDate);
  return days[date.getDay()];
}