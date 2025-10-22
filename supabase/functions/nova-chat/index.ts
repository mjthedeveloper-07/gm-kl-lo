import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    
    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate message count (prevent excessive context)
    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Please start a new conversation." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate individual messages
    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (msg.content.length > 1000) {
        return new Response(
          JSON.stringify({ error: "Message too long. Maximum 1000 characters." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Basic prompt injection detection
      const suspiciousPatterns = [
        /ignore\s+(previous|all)\s+(instructions?|prompts?)/i,
        /system\s*prompt/i,
        /reveal\s+(your|the)\s+(prompt|instructions?|system)/i,
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(msg.content))) {
        console.warn("Potential prompt injection attempt detected");
        return new Response(
          JSON.stringify({ error: "Invalid message content detected" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
