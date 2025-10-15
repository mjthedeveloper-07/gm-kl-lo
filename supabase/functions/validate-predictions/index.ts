import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resultId } = await req.json();

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the actual result
    const { data: result, error: resultError } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (resultError) throw resultError;

    const actualDigits = result.result.split('');

    // Fetch recent predictions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: predictions, error: predError } = await supabase
      .from('prediction_history')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (predError) throw predError;

    const validationResults = [];

    // Validate each prediction
    for (const prediction of predictions || []) {
      for (const predictedNumber of prediction.predicted_numbers) {
        const predictedDigits = predictedNumber.split('');
        
        // Check exact match
        const exactMatch = predictedNumber === result.result;
        
        // Check last 4 digits match
        const last4Match = predictedDigits.slice(-4).join('') === actualDigits.slice(-4).join('');
        
        // Check last 3 digits match
        const last3Match = predictedDigits.slice(-3).join('') === actualDigits.slice(-3).join('');
        
        // Count matching digits at exact positions
        let matchingDigits = 0;
        const matchPositions: number[] = [];
        for (let i = 0; i < 6; i++) {
          if (predictedDigits[i] === actualDigits[i]) {
            matchingDigits++;
            matchPositions.push(i);
          }
        }

        // Insert validation result
        const { error: insertError } = await supabase
          .from('prediction_accuracy')
          .insert({
            prediction_id: prediction.id,
            actual_result_id: resultId,
            exact_match: exactMatch,
            last_4_match: last4Match,
            last_3_match: last3Match,
            matching_digits: matchingDigits,
            match_positions: matchPositions
          });

        if (insertError) {
          console.error('Error inserting accuracy:', insertError);
        } else {
          validationResults.push({
            method: prediction.method_name,
            predicted: predictedNumber,
            actual: result.result,
            exactMatch,
            last4Match,
            last3Match,
            matchingDigits
          });
        }
      }
    }

    // Update method performance
    const { data: performanceData } = await supabase
      .from('method_performance')
      .select('method_name');

    const existingMethods = new Set((performanceData || []).map(p => p.method_name));

    for (const prediction of predictions || []) {
      if (!existingMethods.has(prediction.method_name)) {
        await supabase
          .from('method_performance')
          .insert({
            method_name: prediction.method_name,
            total_predictions: 0,
            exact_matches: 0,
            last_4_matches: 0,
            last_3_matches: 0,
            avg_matching_digits: 0,
            confidence_score: 50
          });
      }
    }

    console.log(`Validated ${validationResults.length} predictions`);

    return new Response(
      JSON.stringify({
        success: true,
        validated: validationResults.length,
        results: validationResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in validate-predictions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
