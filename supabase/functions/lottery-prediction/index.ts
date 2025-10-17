import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { historicalData, currentDate } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Lottery prediction request received");

    // Prepare historical data summary for AI analysis
    const recentResults = historicalData.slice(-30);
    const dataContext = `
Recent 30 lottery results (most recent first):
${recentResults.map((r: any, i: number) => 
  `${i + 1}. ${r.date} (${r.day}): ${r.result} - Draw ${r.draw}`
).join('\n')}

Current Date: ${currentDate}
Next Draw: Tomorrow

Historical Statistics:
- Total historical results: ${historicalData.length}
- Date range: 2009-2025
`;

    const systemPrompt = `You are an advanced lottery analysis AI with deep expertise in pattern recognition, statistical analysis, and predictive modeling for Kerala Lottery.

Your task is to analyze historical lottery data and generate highly informed predictions for tomorrow's draw.

Analysis Framework:
1. **Frequency Analysis**: Identify hot and cold digits across all positions
2. **Positional Patterns**: Analyze which digits appear most frequently in each position (1-6)
3. **Temporal Patterns**: Look for day-of-week, seasonal, or sequential patterns
4. **Digit Pair Analysis**: Identify commonly occurring consecutive digit pairs
5. **Sum Range Analysis**: Calculate typical sum ranges of winning numbers
6. **Gap Analysis**: Look at intervals between similar numbers
7. **Recent Trends**: Weight recent results more heavily (last 10-30 draws)

Generate exactly 5 predictions with the following structure:
- Each prediction must be exactly 6 digits
- Provide confidence level (high/medium/low)
- Explain the reasoning behind each prediction
- Include which patterns or statistics support each prediction

Be specific, analytical, and data-driven. While acknowledging lottery randomness, leverage every statistical insight available.`;

    const userPrompt = `Based on the following historical data, generate 5 highly informed predictions for tomorrow's Kerala Lottery draw.

${dataContext}

Please provide:
1. Five 6-digit predictions (each as a string)
2. Confidence level for each (high/medium/low)
3. Detailed reasoning for each prediction
4. Key patterns identified in the analysis

Format your response as a structured analysis with clear predictions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8, // Higher temperature for more creative predictions
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Lottery prediction generated successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Lottery prediction error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
