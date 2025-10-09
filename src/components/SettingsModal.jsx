"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToPastIngredients, restoreIngredient, deletePastIngredient } from "../lib/firestore";
import { useToast } from "../contexts/AppContext";

export default function SettingsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const showToast = useToast();
  const [pastIngredients, setPastIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;

    const unsubscribe = subscribeToPastIngredients(user.uid, (ingredients) => {
      console.log("Past ingredients received:", ingredients);
      setPastIngredients(ingredients);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  const handleRestore = async (ingredient) => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log("Restoring ingredient:", ingredient);
      await restoreIngredient(user.uid, ingredient);
      showToast("Ingredient restored to your pantry", "success");
    } catch (error) {
      console.error("Error restoring ingredient:", error);
      showToast(`Failed to restore ingredient: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ingredientId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await deletePastIngredient(user.uid, ingredientId);
      showToast("Ingredient permanently deleted", "success");
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      showToast("Failed to delete ingredient", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Past Ingredients Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Past Ingredients
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Manage ingredients you've removed from your pantry. You can restore them or permanently delete them.
            </p>

            {pastIngredients.length > 0 ? (
              <div className="space-y-3">
                {pastIngredients
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h4 className="text-white font-medium">
                          {ingredient.name.charAt(0).toUpperCase() + ingredient.name.slice(1).toLowerCase()}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Removed {new Date(ingredient.removedAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRestore(ingredient)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient.id)}
                          disabled={loading}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">No past ingredients</h4>
                <p className="text-sm text-gray-500">
                  Ingredients you remove will appear here for management
                </p>
              </div>
            )}
          </div>

          {/* App Info Section */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About Easy Recipeasy
            </h3>
            <div className="text-gray-400 text-sm space-y-2">
              <p>Version 1.0.0</p>
              <p>AI-powered recipe generation from your available ingredients</p>
              <p>Built with Next.js, Firebase, and OpenAI</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-700/30">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
