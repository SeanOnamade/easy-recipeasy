"use client";
import { useState } from "react";

export default function RecipeSearch({ onSearch, onClear }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");

  const handleSearch = () => {
    onSearch({
      searchTerm: searchTerm.trim(),
      minCalories: minCalories ? parseInt(minCalories) : null,
      maxCalories: maxCalories ? parseInt(maxCalories) : null
    });
  };

  const handleClear = () => {
    setSearchTerm("");
    setMinCalories("");
    setMaxCalories("");
    onClear();
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 mr-3 bg-gray-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Search Past Recipes</h3>
      </div>
      
      <div className="space-y-4">
        {/* Search by ingredient, title, or steps */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Search recipes
          </label>
          <input
            type="text"
            placeholder="e.g., chicken, tomatoes, garlic, 'stir fry', 'bake'..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-gray-600 bg-gray-800 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
          />
        </div>

        {/* Calorie range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Min Calories
            </label>
            <input
              type="number"
              placeholder="e.g., 200"
              value={minCalories}
              onChange={(e) => setMinCalories(e.target.value)}
              className="w-full border-2 border-gray-600 bg-gray-800 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Max Calories
            </label>
            <input
              type="number"
              placeholder="e.g., 800"
              value={maxCalories}
              onChange={(e) => setMaxCalories(e.target.value)}
              className="w-full border-2 border-gray-600 bg-gray-800 text-white rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-400"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5 cursor-pointer"
          >
            Search Recipes
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
