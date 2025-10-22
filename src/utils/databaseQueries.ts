import { supabase } from "@/integrations/supabase/client";

export interface DatabaseLotteryResult {
  id: string;
  date: string;
  lottery_name: string;
  draw_number: string;
  result: string;
  year: number;
  month: number;
  lottery_type: string | null;
  created_at: string;
}

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

// Cache for lottery results
let cachedResults: LotteryResult[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Convert database format to app format
const convertToAppFormat = (dbResult: DatabaseLotteryResult): LotteryResult => {
  const date = new Date(dbResult.date);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return {
    date: dbResult.date.split('-').reverse().join('.').slice(2), // Convert YYYY-MM-DD to DD.MM.YY
    day: days[date.getDay()],
    lottery: dbResult.lottery_name,
    draw: dbResult.draw_number,
    result: dbResult.result,
    year: dbResult.year,
    month: dbResult.month,
    lotteryType: (dbResult.lottery_type as "bumper" | "regular") || undefined
  };
};

// Fetch all lottery results from database
export const fetchAllLotteryResults = async (): Promise<LotteryResult[]> => {
  // Check cache first
  const now = Date.now();
  if (cachedResults && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedResults;
  }

  try {
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching lottery results:', error);
      throw error;
    }

    const results = (data || []).map(convertToAppFormat);
    
    // Update cache
    cachedResults = results;
    cacheTimestamp = now;
    
    return results;
  } catch (error) {
    console.error('Failed to fetch lottery results:', error);
    return [];
  }
};

// Fetch results by year
export const fetchResultsByYear = async (year: number): Promise<LotteryResult[]> => {
  try {
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('year', year)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertToAppFormat);
  } catch (error) {
    console.error(`Failed to fetch results for year ${year}:`, error);
    return [];
  }
};

// Fetch results by year and month
export const fetchResultsByMonth = async (year: number, month: number): Promise<LotteryResult[]> => {
  try {
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .order('date', { ascending: false});

    if (error) throw error;
    return (data || []).map(convertToAppFormat);
  } catch (error) {
    console.error(`Failed to fetch results for ${year}-${month}:`, error);
    return [];
  }
};

// Fetch results by lottery type
export const fetchResultsByType = async (lotteryType: 'bumper' | 'regular'): Promise<LotteryResult[]> => {
  try {
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('lottery_type', lotteryType)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertToAppFormat);
  } catch (error) {
    console.error(`Failed to fetch ${lotteryType} results:`, error);
    return [];
  }
};

// Fetch most recent N results
export const fetchRecentResults = async (limit: number = 50): Promise<LotteryResult[]> => {
  try {
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(convertToAppFormat);
  } catch (error) {
    console.error(`Failed to fetch recent results:`, error);
    return [];
  }
};

// Get year range from database
export const fetchYearRange = async (): Promise<{ min: number; max: number }> => {
  try {
    const { data, error } = await supabase
      .from('lottery_results')
      .select('year')
      .order('year', { ascending: true })
      .limit(1);

    const { data: maxData, error: maxError } = await supabase
      .from('lottery_results')
      .select('year')
      .order('year', { ascending: false })
      .limit(1);

    if (error || maxError) throw error || maxError;

    return {
      min: data?.[0]?.year || 2009,
      max: maxData?.[0]?.year || new Date().getFullYear()
    };
  } catch (error) {
    console.error('Failed to fetch year range:', error);
    return { min: 2009, max: new Date().getFullYear() };
  }
};

// Clear cache (useful when new data is imported)
export const clearResultsCache = () => {
  cachedResults = null;
  cacheTimestamp = 0;
};

// Get database statistics
export const fetchDatabaseStats = async () => {
  try {
    const { count, error } = await supabase
      .from('lottery_results')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    const yearRange = await fetchYearRange();
    
    return {
      totalResults: count || 0,
      yearRange,
      cacheStatus: cachedResults ? 'cached' : 'not-cached',
      lastCacheUpdate: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null
    };
  } catch (error) {
    console.error('Failed to fetch database stats:', error);
    return {
      totalResults: 0,
      yearRange: { min: 2009, max: new Date().getFullYear() },
      cacheStatus: 'error',
      lastCacheUpdate: null
    };
  }
};

// Helper functions for digit extraction
export const getLast3Digits = (result: string): string => {
  return result.slice(-3);
};

export const getLast4Digits = (result: string): string => {
  return result.slice(-4);
};
