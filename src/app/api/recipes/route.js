import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { ingredients, tools, time, calories, prioritize, recipeType } = await req.json();
    console.log("API received:", { ingredients, tools, time, calories, prioritize, recipeType });

    // Validate input
    if (!ingredients || ingredients.length === 0) {
      return new Response(JSON.stringify({ 
        error: "No ingredients provided.",
        code: "NO_INGREDIENTS" 
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
You are a friendly cooking assistant. Suggest 3 creative, realistic recipes
based only on the user's available ingredients and tools.

User's ingredients: ${ingredients.join(", ") || "none"}
User's tools: ${tools.join(", ") || "none"}
Time limit: ${time || "unspecified"} minutes
Target calories: ${calories || "any"}
Prioritize ingredients: ${prioritize || "none"}
Recipe type/description: ${recipeType || "any type of recipe"}

IMPORTANT: Consider the recipe type/description when creating recipes. If the user wants a "post-workout protein meal", focus on high-protein options. If they want a "smoothie", create drinkable recipes. If they want "comfort food", make hearty, satisfying dishes. If they want "light lunch", create lighter, fresher options.

Return your answer as **strict JSON only** in this exact format (array of recipes):

[
  {
    "title": "Recipe name",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "steps": ["step 1", "step 2"],
    "estimated_calories": 500
  },
  {
    "title": "Another Recipe name",
    "ingredients": ["ingredient 3", "ingredient 4"],
    "steps": ["step 1", "step 2"],
    "estimated_calories": 300
  },
  {
    "title": "Third Recipe name",
    "ingredients": ["ingredient 5", "ingredient 6"],
    "steps": ["step 1", "step 2"],
    "estimated_calories": 400
  }
]
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = completion.choices[0].message.content;
    console.log("Raw LLM response:", raw);

    // Parse and validate the response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(raw);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(JSON.stringify({ 
        error: "Failed to parse recipe response from AI.",
        code: "PARSE_ERROR" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic validation - ensure we have an array of recipes
    if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
      return new Response(JSON.stringify({ 
        error: "Invalid recipe format received from AI.",
        code: "INVALID_FORMAT" 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate each recipe has required fields
    const validatedRecipes = parsedResponse.map(recipe => ({
      title: recipe.title || "Untitled Recipe",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      steps: Array.isArray(recipe.steps) ? recipe.steps : [],
      estimated_calories: typeof recipe.estimated_calories === 'number' ? recipe.estimated_calories : 0
    }));

    console.log("Validated recipes:", validatedRecipes);

    return new Response(JSON.stringify(validatedRecipes), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Error generating recipes:", err);
    
    // Handle specific error types
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
      error: "Failed to generate recipes. Please try again.",
      code: "GENERATION_ERROR" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}