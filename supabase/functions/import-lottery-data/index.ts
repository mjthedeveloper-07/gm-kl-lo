import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { results } = await req.json() as { results: LotteryResult[] };

    if (!results || !Array.isArray(results)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: results array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${results.length} lottery results for import`);

    // Validate all results before inserting
    const validResults = results.filter(r => {
      const isValid = /^\d{6}$/.test(r.result) && 
                     r.date && 
                     r.lottery_name && 
                     r.draw_number;
      if (!isValid) {
        console.warn(`Skipping invalid result:`, r);
      }
      return isValid;
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
