"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  subscribeToIngredients, 
  addIngredient, 
  removeIngredient,
  toggleIngredientAvailability
} from "../lib/firestore";

export default function IngredientList() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToIngredients(user.uid, (ingredients) => {
      setIngredients(ingredients);
    });

    return unsubscribe;
  }, [user]);

  const handleAddIngredient = async () => {
    if (!input.trim() || !user) return;
    
    try {
      await addIngredient(user.uid, input.trim());
      setInput("");
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  const handleToggleAvailability = async (ingredientId, currentAvailability) => {
    if (!user) return;
    
    try {
      await toggleIngredientAvailability(user.uid, ingredientId, !currentAvailability);
    } catch (error) {
      console.error("Error toggling ingredient availability:", error);
    }
  };

  const handleRemoveIngredient = async (ingredientId, ingredientName) => {
    if (!user) return;
    
    try {
      await removeIngredient(user.uid, ingredientId, ingredientName);
    } catch (error) {
      console.error("Error removing ingredient:", error);
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
        <p>Please sign in to manage ingredients</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add an ingredient..."
              className="w-full border-2 border-gray-600 bg-gray-700/50 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-all duration-200 placeholder-gray-400 focus:bg-gray-700"
              onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleAddIngredient}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Add
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Press Enter or click Add to add ingredients to your kitchen
        </p>
      </div>
      {ingredients.length > 0 ? (
        <div>
          {/* Ingredient count header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-green-300 text-sm font-medium">
                {ingredients.filter(ing => ing.available !== false).length} of {ingredients.length} available
              </span>
            </div>
            <div className="text-gray-500 text-xs">
              Click "Available" button to toggle, × to move to Past Ingredients
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 sm:max-h-96 overflow-y-auto pr-2">
            {ingredients
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((ingredient) => (
            <div
              key={ingredient.id}
              className={`group relative rounded-xl p-4 transition-all duration-300 ${
                ingredient.available !== false
                  ? "bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-600/50 hover:from-green-900/40 hover:to-green-800/30 hover:border-green-500/70 hover:shadow-lg hover:shadow-green-500/10"
                  : "bg-gradient-to-br from-gray-800/30 to-gray-700/20 border border-gray-600/50 hover:from-gray-800/40 hover:to-gray-700/30 hover:border-gray-500/70 hover:shadow-lg hover:shadow-gray-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span className={`font-medium text-sm block truncate ${
                    ingredient.available !== false ? "text-green-100" : "text-gray-400"
                  }`}>
                    {ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1).toLowerCase()}
                  </span>
                  <div className="flex items-center mt-1">
                    <button
                      onClick={() => handleToggleAvailability(ingredient.id, ingredient.available)}
                      className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity bg-gray-700/30 hover:bg-gray-600/30 rounded-lg px-2 py-1"
                      title="Click to toggle availability"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        ingredient.available !== false ? "bg-green-400" : "bg-gray-500"
                      }`}></div>
                      <span className={`text-xs ${
                        ingredient.available !== false ? "text-green-400" : "text-gray-500"
                      }`}>
                        {ingredient.available !== false ? "Available" : "Unavailable"}
                      </span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveIngredient(ingredient.id, ingredient.name)}
                  className="ml-3 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-full p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110 cursor-pointer"
                  title="Remove ingredient"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Subtle animation line */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                ingredient.available !== false
                  ? "bg-gradient-to-r from-green-500 to-green-400"
                  : "bg-gradient-to-r from-gray-500 to-gray-400"
              }`}></div>
            </div>
          ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-3">No ingredients yet</h3>
          <p className="text-gray-500 mb-4 max-w-sm mx-auto">
            Start building your pantry by adding ingredients you have on hand
          </p>
          <div className="text-xs text-gray-600">
            Tip: You can mark ingredients as unavailable to keep them in your pantry log
          </div>
        </div>
      )}
    </div>
  );
}
