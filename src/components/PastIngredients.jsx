"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  subscribeToPastIngredients, 
  restoreIngredient, 
  deletePastIngredient 
} from "../lib/firestore";

export default function PastIngredients() {
  const { user } = useAuth();
  const [pastIngredients, setPastIngredients] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToPastIngredients(user.uid, (ingredients) => {
      setPastIngredients(ingredients);
    });

    return unsubscribe;
  }, [user]);

  const handleRestoreIngredient = async (pastIngredientId, ingredientName) => {
    if (!user) return;
    
    try {
      await restoreIngredient(user.uid, pastIngredientId, ingredientName);
    } catch (error) {
      console.error("Error restoring ingredient:", error);
    }
  };

  const handleDeletePastIngredient = async (pastIngredientId) => {
    if (!user) return;
    
    try {
      await deletePastIngredient(user.uid, pastIngredientId);
    } catch (error) {
      console.error("Error deleting past ingredient:", error);
    }
  };

  const formatDate = (date) => {
    return new Date(date.seconds * 1000).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p>Please sign in to view past ingredients</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Past Ingredients</h2>
        <p className="text-gray-300 text-sm">Your pantry log - ingredients you've used before</p>
      </div>

      {pastIngredients.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {pastIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-center justify-between bg-gray-800/50 border border-gray-600 rounded-lg p-4 group hover:bg-gray-800/70 transition-all duration-200"
            >
              <div className="flex-1">
                <span className="text-gray-300 font-medium">
                  {ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1).toLowerCase()}
                </span>
                <p className="text-gray-500 text-xs mt-1">
                  Removed on {formatDate(ingredient.removedAt)}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRestoreIngredient(ingredient.id, ingredient.name)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm cursor-pointer transition-colors"
                  title="Add back to current ingredients"
                >
                  Restore
                </button>
                <button
                  onClick={() => handleDeletePastIngredient(ingredient.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm cursor-pointer transition-colors"
                  title="Permanently delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 text-gray-600">📦</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No past ingredients yet</h3>
          <p className="text-gray-500 text-sm">
            Remove ingredients from your current list to see them here
          </p>
        </div>
      )}
    </div>
  );
}
