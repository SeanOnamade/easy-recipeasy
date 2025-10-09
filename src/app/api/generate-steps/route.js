import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { description } = await req.json();

    if (!description || description.trim().length === 0) {
      return new Response(JSON.stringify({ 
        error: "Description is required.",
        code: "NO_DESCRIPTION" 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ 
        error: "OpenAI API key not configured.",
        code: "API_KEY_MISSING" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const prompt = `
Convert the following recipe description into clear, numbered cooking steps. 
Make the steps practical and easy to follow for someone who wants to recreate this dish.

Recipe Description: "${description}"

Return your answer as a JSON array of strings, where each string is a cooking step:

["Step 1: ...", "Step 2: ...", "Step 3: ..."]

Make sure the steps are:
- Numbered and clear
- In logical cooking order
- Practical and actionable
- Include cooking times and temperatures where appropriate
- Include any important techniques or tips mentioned
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content;
    console.log("Raw steps response:", raw);

    // Parse the response - handle markdown code blocks
    let steps;
    try {
      // Remove markdown code block markers if present
      let cleanedResponse = raw;
      if (cleanedResponse.includes('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      steps = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Fallback: split by lines and clean up
      steps = raw.split('\n')
        .filter(line => line.trim().length > 0)
        .map((line, index) => {
          const cleaned = line.replace(/^\d+\.?\s*/, '').trim();
          return cleaned ? `Step ${index + 1}: ${cleaned}` : null;
        })
        .filter(Boolean);
    }

    // Ensure we have an array of strings
    if (!Array.isArray(steps) || steps.length === 0) {
      steps = ["1. Follow the description provided"];
    }

    return new Response(JSON.stringify({ steps }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Error generating steps:", err);
    
    if (err.message?.includes('API key')) {
      return new Response(JSON.stringify({ 
        error: "OpenAI API key is invalid or missing.",
        code: "INVALID_API_KEY" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (err.message?.includes('rate limit')) {
      return new Response(JSON.stringify({ 
        error: "Rate limit exceeded. Please try again later.",
        code: "RATE_LIMIT" 
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      error: "Failed to generate steps. Please try again.",
      code: "GENERATION_ERROR" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
