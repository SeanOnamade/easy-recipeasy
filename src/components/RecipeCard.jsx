"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { saveRecipe, updateRecipeRating } from "../lib/firestore";

export default function RecipeCard({ recipe, onSave, onRate, isSaved = false, rating = 0 }) {
  const { user } = useAuth();
  const [currentRating, setCurrentRating] = useState(rating);
  const [isRecipeSaved, setIsRecipeSaved] = useState(false); // Always start as not saved for new recipes

  const handleSave = async () => {
    if (!user) {
      alert("Please sign in to save recipes");
      return;
    }

    try {
      const recipeWithMetadata = {
        ...recipe,
        rating: currentRating
      };
      
      await saveRecipe(user.uid, recipeWithMetadata);
      setIsRecipeSaved(true);
      console.log("Recipe saved to Firebase");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe");
    }
  };

  const handleRating = async (newRating) => {
    setCurrentRating(newRating);
    
    if (user && recipe.id) {
      try {
        await updateRecipeRating(user.uid, recipe.id, newRating);
      } catch (error) {
        console.error("Error updating rating:", error);
      }
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => handleRating(star)}
        className={`text-2xl transition-colors ${
          star <= currentRating 
            ? "text-yellow-400" 
            : "text-gray-600 hover:text-yellow-300"
        }`}
      >
        ★
      </button>
    ));
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl hover:shadow-green-500/20 transition-all duration-300 border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-4">
        <h3 className="text-xl font-bold text-white">{recipe.title}</h3>
        <p className="text-green-100 text-sm">
          ~{recipe.estimated_calories} calories
        </p>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-300 mb-2">
            Ingredients
          </h4>
          <div className="max-h-32 overflow-y-auto bg-gray-800/30 rounded-lg p-2">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, j) => (
                <li key={j} className="bg-green-900/30 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-700">
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mb-6">
          <h4 className="font-semibold text-gray-300 mb-2">
            Instructions
          </h4>
          <div className="max-h-48 overflow-y-auto bg-gray-800/30 rounded-lg p-3">
            <ol className="space-y-2">
              {recipe.steps.map((step, j) => (
                <li key={j} className="flex items-start">
                  <span className="bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    {j + 1}
                  </span>
                  <span className="text-gray-300 text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        {/* Rating System */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-300 mb-2">Rate this recipe:</h4>
          <div className="flex items-center space-x-1">
            {renderStars()}
            {currentRating > 0 && (
              <span className="text-gray-400 text-sm ml-2">
                {currentRating}/5 stars
              </span>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isRecipeSaved}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
            isRecipeSaved
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5 cursor-pointer"
          }`}
        >
          {isRecipeSaved ? "Recipe Saved" : "Save Recipe"}
        </button>
      </div>
    </div>
  );
}
