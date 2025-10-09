"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  subscribeToRecipes, 
  updateRecipeRating, 
  updateRecipeNotes,
  deleteRecipe 
} from "../lib/firestore";
import RecipeSearch from "./RecipeSearch";

export default function RecipeHistory({ onClose }) {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState("");

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToRecipes(user.uid, (recipes) => {
      setSavedRecipes(recipes);
      setFilteredRecipes(recipes);
    });

    return unsubscribe;
  }, [user]);

  const handleSearch = (searchFilters) => {
    const { searchTerm, minCalories, maxCalories } = searchFilters;
    
    let filtered = savedRecipes;

    // Filter by ingredient, title, or steps search term
    if (searchTerm) {
      filtered = filtered.filter(recipe => 
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.steps && recipe.steps.some(step => 
          step.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Filter by calorie range
    if (minCalories !== null) {
      filtered = filtered.filter(recipe => 
        recipe.estimated_calories >= minCalories
      );
    }

    if (maxCalories !== null) {
      filtered = filtered.filter(recipe => 
        recipe.estimated_calories <= maxCalories
      );
    }

    setFilteredRecipes(filtered);
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setFilteredRecipes(savedRecipes);
    setIsSearching(false);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!user) return;
    
    try {
      await deleteRecipe(user.uid, recipeId);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe");
    }
  };

  const handleUpdateRating = async (recipeId, newRating) => {
    if (!user) return;
    
    try {
      await updateRecipeRating(user.uid, recipeId, newRating);
    } catch (error) {
      console.error("Error updating rating:", error);
      alert("Failed to update rating");
    }
  };

  const handleEditNotes = (recipe) => {
    setEditingNotes(recipe.id);
    setNotesText(recipe.notes || "");
  };

  const handleSaveNotes = async (recipeId) => {
    if (!user) return;
    try {
      await updateRecipeNotes(user.uid, recipeId, notesText);
      setEditingNotes(null);
      setNotesText("");
    } catch (error) {
      console.error("Error updating notes:", error);
      alert("Failed to update notes");
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNotesText("");
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

  if (!user) {
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
        </div>
        <div className="p-6 text-center">
          <div className="text-4xl mb-2 text-gray-600">🔐</div>
          <p className="text-gray-400">Please sign in to view your recipe history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">Past Recipes</h2>
          <p className="text-green-100 text-sm">Your saved recipe collection</p>
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto">
        {/* Search Component */}
        <RecipeSearch onSearch={handleSearch} onClear={handleClearSearch} />
        
        {/* Results Header */}
        {isSearching && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-green-300 text-sm">
              Found {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} 
              {savedRecipes.length !== filteredRecipes.length && 
                ` (filtered from ${savedRecipes.length} total)`
              }
            </p>
          </div>
        )}

        {savedRecipes.length > 0 ? (
          <div className="space-y-4">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{recipe.title}</h3>
                    <p className="text-gray-400 text-sm">
                      Saved on {new Date(recipe.savedAt?.toDate?.() || recipe.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
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
                  <div className="max-h-24 overflow-y-auto bg-gray-800/30 rounded-lg p-2">
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients
                        .sort((a, b) => a.localeCompare(b))
                        .map((ing, i) => (
                        <span key={i} className="bg-green-900/30 text-green-300 px-2 py-1 rounded text-xs">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recipe Steps */}
                {recipe.steps && recipe.steps.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Steps:</h4>
                    <div className="max-h-48 overflow-y-auto bg-gray-800/30 rounded-lg p-3">
                      <div className="space-y-2">
                        {recipe.steps.map((step, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-300">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleUpdateRating(recipe.id, star)}
                        className={`text-lg transition-colors cursor-pointer ${
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

                {/* Notes Section */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-300">Notes:</h4>
                    {editingNotes !== recipe.id && (
                      <button
                        onClick={() => handleEditNotes(recipe)}
                        className="text-green-400 hover:text-green-300 text-sm cursor-pointer"
                      >
                        {recipe.notes ? "Edit" : "Add Notes"}
                      </button>
                    )}
                  </div>
                  
                  {editingNotes === recipe.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Add your notes about this recipe..."
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveNotes(recipe.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800/50 rounded-lg p-3 min-h-[60px] max-h-32 overflow-y-auto">
                      {recipe.notes ? (
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{recipe.notes}</p>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No notes yet. Click "Add Notes" to add your thoughts.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {isSearching ? (
              <>
                <h3 className="text-xl font-semibold text-gray-300 mb-3">No recipes found</h3>
                <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                  No recipes match your current search criteria
                </p>
                <p className="text-sm text-gray-600">Try adjusting your search terms or filters</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-300 mb-3">No saved recipes yet</h3>
                <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                  Generate recipes and save the ones you like to build your personal collection
                </p>
                <p className="text-sm text-gray-600">Your saved recipes will appear here for easy access</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
