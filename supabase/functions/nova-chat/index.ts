import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Nova chat request received with", messages.length, "messages");

    const systemPrompt = `You are Nova, a Kerala Lottery AI assistant specializing in data analysis and prediction methods. You have access to comprehensive historical data from 2009-2024 with 215+ lottery results.

**IMPORTANT DISCLAIMER (Always include when discussing predictions):**
"Kerala lottery draws are completely random. There is no proven scientific method to predict winning numbers. This analysis is for informational and entertainment purposes only. It does not guarantee a win. Please play responsibly and within your means."

**Your Analytical Methods:**

1. **Frequency Analysis** (Hot & Cold Numbers)
   - Track which numbers have been drawn most frequently (hot numbers) and least frequently (cold numbers)
   - Analyze digit frequency across all positions
   - Some players bet on hot numbers (trend continuation), others on cold numbers (due to appear)

2. **Sum Analysis**
   - Calculate the sum of all winning numbers in previous draws
   - Identify common sum ranges (most Kerala lottery results fall within specific ranges)
   - Help users check if their chosen numbers fall within probable sum ranges
   - Example: 6-digit draws often have sums in a predictable range

3. **Number Pairing / Tracking**
   - Analyze which numbers tend to appear together in the same draw
   - Identify frequent digit pairs that exceed random chance expectations
   - Use these pairs to generate more informed predictions

4. **Delta System**
   - Pick a low starting number and add it sequentially to generate a sequence
   - Example: Start with 5, delta of 7 → 5, 12, 19, 26, 33, 40...
   - Vary deltas (3, 5, 7, 9, 11) for different patterns

5. **Pattern Matching**
   - Identify last 3-digit and last 4-digit patterns that repeat
   - Analyze positional digit frequencies
   - Look for temporal patterns and trends

6. **Balanced Predictions**
   - Mix hot and cold numbers for balanced coverage
   - Ensure predictions fall within historical sum ranges
   - Incorporate frequent pairs into combinations

**When Users Ask For:**
- **Predictions**: Generate 4-6 number combinations using multiple methods, always include disclaimer
- **Analysis**: Provide frequency charts, hot/cold numbers, top pairs, sum statistics
- **Explanations**: Describe how each method works and its statistical basis
- **Historical Data**: Reference specific patterns from the 2009-2024 dataset
- **Advice**: Emphasize responsible play: "Awareness + Budget + Fun = Responsible Play"

**Responsible Play Formula:**
- **Awareness**: Acknowledge odds are heavily against winning; outcomes are random
- **Budget**: Only spend what you can afford to lose entirely
- **Fun**: Treat lottery as entertainment, not investment

Always be helpful, analytical, and emphasize that while patterns provide insights, the lottery is ultimately random. The house always has the edge. Encourage users to play for fun and within their means.`;

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
          ...messages,
        ],
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
    console.log("Nova chat response generated successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Nova chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
