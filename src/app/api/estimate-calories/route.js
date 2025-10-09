import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { title, ingredients, description } = await req.json();

    if (!title || !ingredients || ingredients.length === 0) {
      return new Response(JSON.stringify({ 
        error: "Title and ingredients are required.",
        code: "MISSING_DATA" 
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
Estimate the total calories for this recipe based on the ingredients and description.

Recipe Title: "${title}"
Ingredients: ${ingredients.join(", ")}
Description: "${description || 'No description provided'}"

Please provide a reasonable calorie estimate for a typical serving of this dish. Consider:
- The main ingredients and their typical calorie content
- Cooking methods (fried vs baked vs steamed)
- Portion sizes (assume 1 serving unless specified otherwise)
- Common preparation methods

Return your answer as a JSON object with this exact format:
{"estimated_calories": 350}

Make the estimate realistic and based on typical food values. If you cannot make a reasonable estimate, return 0.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
    });

    const raw = completion.choices[0].message.content;
    console.log("Raw calories response:", raw);

    // Parse the response
    let result;
    try {
      // Remove markdown code block markers if present
      let cleanedResponse = raw;
      if (cleanedResponse.includes('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      result = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Fallback: try to extract number from text
      const numberMatch = raw.match(/(\d+)/);
      result = { estimated_calories: numberMatch ? parseInt(numberMatch[1]) : 0 };
    }

    // Ensure we have a valid number
    const calories = parseInt(result.estimated_calories) || 0;
    
    return new Response(JSON.stringify({ estimated_calories: calories }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Error estimating calories:", err);
    
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
      error: "Failed to estimate calories. Please try again.",
      code: "ESTIMATION_ERROR" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
