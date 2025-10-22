import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to check if user has admin role
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  
  return !error && data !== null;
}

interface LotteryResult {
  date: string;
  month: number;
  year: number;
  result: string;
  lottery_name: string;
  draw_number: string;
  lottery_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client to verify the user
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user is admin
    const adminStatus = await isAdmin(supabase, user.id);
    if (!adminStatus) {
      console.warn(`Non-admin user ${user.id} (${user.email}) attempted to import lottery data`);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin user ${user.id} (${user.email}) importing lottery data`);

    const { results } = await req.json() as { results: LotteryResult[] };

    if (!results || !Array.isArray(results)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: results array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch size limit to prevent abuse
    if (results.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Batch size too large. Maximum 500 results per request.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${results.length} lottery results for import`);

    // Known lottery types for validation
    const validLotteryTypes = ['regular', 'bumper'];
    const minYear = 2009;
    const maxYear = new Date().getFullYear() + 1; // Allow next year for scheduling

    // Validate all results before inserting
    const validResults = results.filter(r => {
      // Basic format validation
      const hasValidFormat = /^\d{6}$/.test(r.result) && 
                             r.date && 
                             r.lottery_name && 
                             r.draw_number;
      
      if (!hasValidFormat) {
        console.warn(`Skipping invalid format:`, r);
        return false;
      }

      // Date validation
      const resultDate = new Date(r.date);
      const now = new Date();
      
      if (isNaN(resultDate.getTime())) {
        console.warn(`Skipping invalid date:`, r.date);
        return false;
      }

      // No future dates beyond 7 days
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (resultDate > sevenDaysFromNow) {
        console.warn(`Skipping future date:`, r.date);
        return false;
      }

      // No dates before 2009 (when Kerala Lottery data starts)
      if (r.year < minYear || r.year > maxYear) {
        console.warn(`Skipping year out of range:`, r.year);
        return false;
      }

      // Validate month
      if (r.month < 1 || r.month > 12) {
        console.warn(`Skipping invalid month:`, r.month);
        return false;
      }

      // Validate lottery type if present
      if (r.lottery_type && !validLotteryTypes.includes(r.lottery_type.toLowerCase())) {
        console.warn(`Skipping invalid lottery type:`, r.lottery_type);
        return false;
      }

      // Statistical validation - reject obviously invalid results
      const allSame = /^(\d)\1{5}$/.test(r.result); // All same digit
      const sequential = /^012345|123456|234567|345678|456789|567890$/.test(r.result);
      
      if (allSame || sequential) {
        console.warn(`Skipping statistically unlikely result:`, r.result);
        return false;
      }

      return true;
    });

    console.log(`${validResults.length} valid results to insert`);

    // Check for existing results to avoid duplicates
    const { data: existing, error: checkError } = await supabase
      .from('lottery_results')
      .select('date, draw_number')
      .in('date', validResults.map(r => r.date));

    if (checkError) {
      console.error('Error checking existing results:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing results', details: checkError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter out duplicates
    const existingKeys = new Set(
      (existing || []).map(e => `${e.date}-${e.draw_number}`)
    );

    const newResults = validResults.filter(r => 
      !existingKeys.has(`${r.date}-${r.draw_number}`)
    );

    console.log(`${newResults.length} new results to insert (${existingKeys.size} duplicates skipped)`);

    if (newResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No new results to import',
          total: results.length,
          valid: validResults.length,
          duplicates: existingKeys.size,
          inserted: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch insert with error handling
    const { data: inserted, error: insertError } = await supabase
      .from('lottery_results')
      .insert(newResults)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to insert results', 
          details: insertError.message,
          hint: insertError.hint,
          code: insertError.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const successCount = inserted?.length || 0;
    console.log(`Successfully inserted ${successCount} lottery results`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully imported ${successCount} lottery results`,
        total: results.length,
        valid: validResults.length,
        duplicates: existingKeys.size,
        inserted: successCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in import-lottery-data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
