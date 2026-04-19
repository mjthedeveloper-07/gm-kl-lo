import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation
function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }
  if (messages.length === 0 || messages.length > 50) {
    return { valid: false, error: "Messages must contain 1-50 entries" };
  }
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) {
      return { valid: false, error: "Each message must be an object" };
    }
    const { role, content } = msg as Record<string, unknown>;
    if (typeof role !== "string" || !["user", "assistant"].includes(role)) {
      return { valid: false, error: "Invalid message role" };
    }
    if (typeof content !== "string" || content.length === 0 || content.length > 10000) {
      return { valid: false, error: "Message content must be a string between 1-10000 characters" };
    }
  }
  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { messages } = body;

    // Validate input
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Nova chat request received with", messages.length, "messages");

    const systemPrompt = `You are Nova, an AI assistant specialized in Kerala Lottery analysis. You have access to comprehensive historical data from 2009-2024 with 215+ lottery results.

Your knowledge includes:
- Historical winning numbers from 2009-2024
- Pattern analysis across regular and bumper draws
- Statistical insights including hot/cold numbers, digit patterns
- Prediction algorithms based on 16 years of data
- Lottery types: Regular weekly draws (6 digits) and Bumper special draws (6-8 digits)

When users ask about:
- Predictions: Explain the statistical basis from historical patterns
- Hot/Cold numbers: Reference frequency analysis across the dataset
- Patterns: Discuss digit patterns, even/odd distribution, sum ranges
- Historical data: Provide specific insights from the 2009-2024 dataset
- Bumper vs Regular: Explain differences and unique patterns
- Success rates: Be honest about lottery randomness while highlighting pattern analysis

Always be helpful, clear, and emphasize that lottery outcomes are ultimately random, but patterns can provide insights for informed number selection.`;

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
      
      return new Response(
        JSON.stringify({ error: "Failed to generate response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Nova chat response generated successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Nova chat error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
