"use client";
import { useState, useEffect } from "react";

export default function RecipeHistory({ onClose }) {
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("recipesHistory");
    if (saved) {
      setSavedRecipes(JSON.parse(saved));
    }
  }, []);

  const deleteRecipe = (recipeId) => {
    const updated = savedRecipes.filter(recipe => recipe.id !== recipeId);
    setSavedRecipes(updated);
    localStorage.setItem("recipesHistory", JSON.stringify(updated));
  };

  const updateRating = (recipeId, newRating) => {
    const updated = savedRecipes.map(recipe => 
      recipe.id === recipeId ? { ...recipe, rating: newRating } : recipe
    );
    setSavedRecipes(updated);
    localStorage.setItem("recipesHistory", JSON.stringify(updated));
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-lg ${
          star <= rating ? "text-yellow-400" : "text-gray-600"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Past Recipes</h2>
          <button
            onClick={onClose}
            className="text-green-100 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <p className="text-green-100 text-sm">Your saved recipe collection</p>
      </div>
      
      <div className="p-6">
        {savedRecipes.length > 0 ? (
          <div className="space-y-4">
            {savedRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{recipe.title}</h3>
                    <p className="text-gray-400 text-sm">
                      Saved on {new Date(recipe.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteRecipe(recipe.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="mb-3">
                  <p className="text-green-300 text-sm">
                    ~{recipe.estimated_calories} calories
                  </p>
                </div>

                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Ingredients:</h4>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 5).map((ing, i) => (
                      <span key={i} className="bg-green-900/30 text-green-300 px-2 py-1 rounded text-xs">
                        {ing}
                      </span>
                    ))}
                    {recipe.ingredients.length > 5 && (
                      <span className="text-gray-400 text-xs">
                        +{recipe.ingredients.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-300">Rating:</span>
                    {renderStars(recipe.rating || 0)}
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateRating(recipe.id, star)}
                        className={`text-lg transition-colors ${
                          star <= (recipe.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-600 hover:text-yellow-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2 text-gray-600">⚡</div>
            <p>No saved recipes yet</p>
            <p className="text-sm text-gray-500 mt-1">Save some recipes to see them here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
