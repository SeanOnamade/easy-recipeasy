"use client";
import { useState } from "react";

export default function RecipeForm({ onRecipesGenerated }) {
  const [time, setTime] = useState("");
  const [calories, setCalories] = useState("");
  const [prioritize, setPrioritize] = useState("");
  const [recipeType, setRecipeType] = useState("");
  const [loading, setLoading] = useState(false);

  const generateRecipes = async () => {
    setLoading(true);

    // Pull ingredients and tools from localStorage
    const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    const tools = JSON.parse(localStorage.getItem("tools")) || [];

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          tools,
          time,
          calories,
          prioritize,
          recipeType,
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);
      
      // Handle the response format - recipes might be nested under 'recipes' property
      const recipes = data.recipes || data;
      console.log("Extracted recipes:", recipes);
      onRecipesGenerated(recipes);
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating recipes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 transform ${
              loading 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-1"
            }`}
          >
            {loading ? (
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
