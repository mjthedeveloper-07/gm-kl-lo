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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch recent lottery results
    const { data: recentResults, error: fetchError } = await supabase
      .from('lottery_results')
      .select('date, result, lottery_name')
      .order('date', { ascending: false })
      .limit(50);

    if (fetchError) throw fetchError;

    // Prepare context for AI
    const resultsContext = recentResults?.map(r => 
      `${r.date}: ${r.result} (${r.lottery_name})`
    ).join('\n') || '';

    const prompt = `Analyze the following Kerala lottery results and generate 5 intelligent predictions for tomorrow's draw.

Recent Results:
${resultsContext}

Based on patterns, frequencies, trends, and statistical analysis:
1. Identify hot and cold digits
2. Detect recurring patterns or sequences
3. Consider positional tendencies
4. Apply probability distributions

Generate 5 unique 6-digit predictions with brief explanations. Format as JSON array:
[
  {"prediction": "123456", "explanation": "Brief reason", "confidence": "high|medium|low"},
  ...
]`;

    console.log('Calling Lovable AI for ML predictions...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert lottery analyst. Provide data-driven predictions based on statistical patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';

    console.log('AI Response:', aiContent);

    // Parse AI response
    let predictions;
    try {
      // Extract JSON from response
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        predictions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback predictions
      predictions = [
        { prediction: "123456", explanation: "AI analysis unavailable", confidence: "low" },
        { prediction: "234567", explanation: "AI analysis unavailable", confidence: "low" },
        { prediction: "345678", explanation: "AI analysis unavailable", confidence: "low" },
        { prediction: "456789", explanation: "AI analysis unavailable", confidence: "low" },
        { prediction: "567890", explanation: "AI analysis unavailable", confidence: "low" }
      ];
    }

    // Save to database
    const { error: insertError } = await supabase
      .from('prediction_history')
      .insert({
        method_name: 'AI Deep Learning',
        predicted_numbers: predictions.map((p: any) => p.prediction),
        confidence_level: 'high',
        metadata: {
          description: 'AI-powered predictions using Gemini 2.5 Flash',
          explanations: predictions.map((p: any) => ({
            number: p.prediction,
            reason: p.explanation,
            confidence: p.confidence
          }))
        }
      });

    if (insertError) {
      console.error('Error saving predictions:', insertError);
    }

    return new Response(
      JSON.stringify({
        method: 'AI Deep Learning',
        description: 'AI-powered predictions using advanced pattern recognition',
        numbers: predictions.map((p: any) => p.prediction),
        confidence: 'high',
        explanations: predictions.map((p: any) => ({
          number: p.prediction,
          reason: p.explanation,
          confidence: p.confidence
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-ml-predictions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
