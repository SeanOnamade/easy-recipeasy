"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast, useLoading } from "../contexts/AppContext";
import { saveRecipe, subscribeToIngredients, subscribeToTools } from "../lib/firestore";

export default function RecipeForm({ onRecipesGenerated }) {
  const { user } = useAuth();
  const showToast = useToast();
  const { setLoading } = useLoading();
  const [time, setTime] = useState("");
  const [calories, setCalories] = useState("");
  const [prioritize, setPrioritize] = useState("");
  const [recipeType, setRecipeType] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [tools, setTools] = useState([]);

  // Subscribe to Firebase data
  useEffect(() => {
    if (!user) return;

    const unsubscribeIngredients = subscribeToIngredients(user.uid, (ingredients) => {
      setAllIngredients(ingredients);
      // Only use available ingredients for recipe generation
      setIngredients(ingredients.filter(ing => ing.available !== false).map(ing => ing.name));
    });

    const unsubscribeTools = subscribeToTools(user.uid, (tools) => {
      setTools(tools.map(tool => tool.name));
    });

    return () => {
      unsubscribeIngredients();
      unsubscribeTools();
    };
  }, [user]);

  const generateRecipes = async () => {
    if (ingredients.length === 0) {
      showToast("Please add some ingredients first!", "error");
      return;
    }

    setLoading(true);
    setLocalLoading(true);

    // Use Firebase data instead of localStorage
    const ingredientsList = ingredients;
    const toolsList = tools;

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredientsList,
          tools: toolsList,
          time,
          calories,
          prioritize,
          recipeType,
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Handle the response format - recipes might be nested under 'recipes' property
      const recipes = data.recipes || data;
      console.log("Extracted recipes:", recipes);
      
      if (!Array.isArray(recipes) || recipes.length === 0) {
        throw new Error("No recipes were generated");
      }
      
      onRecipesGenerated(recipes);
    } catch (err) {
      console.error("Recipe generation error:", err);
      showToast(`Failed to generate recipes: ${err.message}`, "error");
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe) => {
    if (!user) {
      alert("Please sign in to save recipes");
      return;
    }

    try {
      await saveRecipe(user.uid, recipe);
      console.log("Recipe saved to Firebase");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p>Please sign in to generate recipes</p>
      </div>
    );
  }

  return (
    <div>
      {/* Show current ingredients and tools count */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <div className="flex justify-between text-sm text-gray-300">
          <span>Ingredients: {ingredients.length} of {allIngredients.length} available</span>
          <span>Tools: {tools.length}</span>
        </div>
        {ingredients.length === 0 && (
          <p className="text-yellow-400 text-xs mt-1">
            {allIngredients.length > 0 ? "Mark ingredients as available to generate recipes" : "Add ingredients to generate recipes"}
          </p>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Cooking Time (minutes) <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="number"
            placeholder="e.g., 30 (leave blank for any time)"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Target Calories (optional)
          </label>
          <input
            type="number"
            placeholder="e.g., 500"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Prioritize Ingredients (comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g., chicken, tomatoes, garlic"
            value={prioritize}
            onChange={(e) => setPrioritize(e.target.value)}
            className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Recipe Type/Description <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g., post-workout protein meal, healthy smoothie, comfort food, light lunch, etc."
            value={recipeType}
            onChange={(e) => setRecipeType(e.target.value)}
            className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
          />
        </div>

        <button
          onClick={generateRecipes}
          disabled={localLoading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 transform ${
            localLoading 
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-1"
          }`}
        >
          {localLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Cooking up ideas...
            </span>
          ) : (
            "Generate Recipes"
          )}
        </button>
      </div>
    </div>
  );
}
