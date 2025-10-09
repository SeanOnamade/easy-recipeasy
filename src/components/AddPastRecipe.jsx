"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/AppContext";
import { subscribeToIngredients, addIngredient, saveRecipe } from "../lib/firestore";

export default function AddPastRecipe() {
  const { user } = useAuth();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");
  const [estimatedCalories, setEstimatedCalories] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [recipeType, setRecipeType] = useState("");

  // Subscribe to available ingredients
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToIngredients(user.uid, (ingredients) => {
      setAvailableIngredients(ingredients.filter(ing => ing.available !== false));
    });

    return () => unsubscribe();
  }, [user]);

  // Filter available ingredients based on search
  const filteredIngredients = availableIngredients
    .filter(ing => !selectedIngredients.find(selected => selected.id === ing.id))
    .filter(ing => ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleAddExistingIngredient = (ingredient) => {
    if (!selectedIngredients.find(item => item.id === ingredient.id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
      setIngredientSearch(""); // Clear search field
    }
  };

  const handleAddNewIngredient = async () => {
    if (!newIngredient.trim()) return;

    try {
      setLoading(true);
      const newIngredientDoc = await addIngredient(user.uid, newIngredient.trim());
      const newIngredientObj = {
        id: newIngredientDoc.id,
        name: newIngredient.trim(),
        available: true
      };
      setSelectedIngredients([...selectedIngredients, newIngredientObj]);
      setNewIngredient("");
      showToast("Ingredient added to recipe", "success");
    } catch (error) {
      console.error("Error adding ingredient:", error);
      showToast("Failed to add ingredient", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter(item => item.id !== ingredientId));
  };

  const handleSaveRecipe = async () => {
    if (!recipeTitle.trim() || !recipeDescription.trim() || selectedIngredients.length === 0) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (!user) {
      showToast("Please sign in to save recipes", "error");
      return;
    }

    try {
      setLoading(true);
      
      // Generate steps from description using AI
      const steps = await generateStepsFromDescription(recipeDescription);
      
      // Estimate calories if not provided
      let finalCalories = estimatedCalories ? parseInt(estimatedCalories) : 0;
      if (!estimatedCalories) {
        try {
          const caloriesResponse = await fetch("/api/estimate-calories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: recipeTitle.trim(),
              ingredients: selectedIngredients.map(ing => ing.name),
              description: recipeDescription.trim()
            })
          });
          
          if (caloriesResponse.ok) {
            const caloriesData = await caloriesResponse.json();
            finalCalories = caloriesData.estimated_calories || 0;
          }
        } catch (caloriesError) {
          console.error("Error estimating calories:", caloriesError);
          // Continue with 0 calories if estimation fails
        }
      }
      
      const recipe = {
        title: recipeTitle.trim(),
        ingredients: selectedIngredients.map(ing => ing.name),
        steps: steps,
        estimated_calories: finalCalories,
        recipeType: recipeType.trim() || "Manual Entry",
        cookingTime: cookingTime.trim() || "Not specified",
        description: recipeDescription.trim(),
        isManualEntry: true
      };

      await saveRecipe(user.uid, recipe);
      showToast("Recipe saved successfully!", "success");
      
      // Reset form
      setRecipeTitle("");
      setRecipeDescription("");
      setEstimatedCalories("");
      setCookingTime("");
      setRecipeType("");
      setSelectedIngredients([]);
      
    } catch (error) {
      console.error("Error saving recipe:", error);
      showToast("Failed to save recipe", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateStepsFromDescription = async (description) => {
    try {
      const response = await fetch("/api/generate-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error("Failed to generate steps");
      }

      const data = await response.json();
      return data.steps || ["1. Follow the description provided"];
    } catch (error) {
      console.error("Error generating steps:", error);
      return ["1. Follow the description provided"];
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Sign in required</h3>
        <p className="text-sm text-gray-500">Please sign in to add past recipes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recipe Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Recipe Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g., Grandma's Chicken Soup"
          value={recipeTitle}
          onChange={(e) => setRecipeTitle(e.target.value)}
          className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
        />
      </div>

      {/* Recipe Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Recipe Description <span className="text-red-400">*</span>
        </label>
        <textarea
          placeholder="Describe how you made this dish. Include cooking methods, techniques, and any special steps..."
          value={recipeDescription}
          onChange={(e) => setRecipeDescription(e.target.value)}
          rows={4}
          className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          We'll automatically generate cooking steps from your description
        </p>
      </div>

      {/* Ingredients Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Ingredients Used <span className="text-red-400">*</span>
        </label>
        
        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center space-x-2"
                >
                  <span>{ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1).toLowerCase()}</span>
                  <button
                    onClick={() => handleRemoveIngredient(ingredient.id)}
                    className="text-green-200 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Ingredient */}
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Add new ingredient..."
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddNewIngredient()}
            className="flex-1 border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
          />
          <button
            onClick={handleAddNewIngredient}
            disabled={loading || !newIngredient.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        {/* Available Ingredients */}
        {availableIngredients.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Or select from your pantry:</p>
            
            {/* Search Bar */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search ingredients..."
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
              />
            </div>

            {/* Ingredients Grid */}
            <div className="max-h-28 sm:max-h-32 overflow-y-auto pr-2">
              {filteredIngredients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredIngredients.map((ingredient) => (
                    <button
                      key={ingredient.id}
                      onClick={() => handleAddExistingIngredient(ingredient)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 sm:p-2 rounded-lg text-sm transition-colors text-left cursor-pointer hover:shadow-md"
                    >
                      {ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {ingredientSearch ? "No ingredients found matching your search" : "No available ingredients"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Estimated Calories
          </label>
          <input
            type="number"
            placeholder="e.g., 350"
            value={estimatedCalories}
            onChange={(e) => setEstimatedCalories(e.target.value)}
            min="0"
            className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to auto-estimate based on ingredients</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Cooking Time
          </label>
          <input
            type="text"
            placeholder="e.g., 30 minutes"
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Recipe Type
          </label>
          <input
            type="text"
            placeholder="e.g., Comfort Food"
            value={recipeType}
            onChange={(e) => setRecipeType(e.target.value)}
            className="w-full border-2 border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveRecipe}
        disabled={loading || !recipeTitle.trim() || !recipeDescription.trim() || selectedIngredients.length === 0}
        className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 transform ${
          loading || !recipeTitle.trim() || !recipeDescription.trim() || selectedIngredients.length === 0
            ? "bg-gray-600 cursor-not-allowed" 
            : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-1 cursor-pointer"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Saving Recipe...
          </span>
        ) : (
          "Save Past Recipe"
        )}
      </button>
    </div>
  );
}
