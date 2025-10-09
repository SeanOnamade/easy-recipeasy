"use client";
import { useState } from "react";
import IngredientListFirebase from "./IngredientListFirebase";
import ToolsListFirebase from "./ToolsListFirebase";
import RecipeFormFirebase from "./RecipeFormFirebase";
import AddPastRecipe from "./AddPastRecipe";

export default function TabbedInterface({ onRecipesGenerated }) {
  const [activeTab, setActiveTab] = useState("ingredients");

  const tabs = [
    { id: "ingredients", label: "Ingredients", icon: "I" },
    { id: "tools", label: "Tools", icon: "T" },
    { id: "add-past", label: "Add Past Recipe", icon: "A" },
    { id: "generate", label: "Generate", icon: "G" }
  ];

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Tab Headers - Mobile Responsive */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-600 border-b border-gray-500 flex-shrink-0 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-1 sm:px-0 sm:flex-nowrap">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 sm:px-6 py-3 sm:py-4 font-semibold text-sm transition-all duration-200 flex items-center justify-center cursor-pointer rounded-t-lg whitespace-nowrap flex-1 sm:flex-none sm:min-w-0 ${
                activeTab === tab.id
                  ? "bg-gray-800 text-white shadow-lg border-b-2 border-green-500"
                  : "text-gray-300 hover:text-white hover:bg-gray-600/50"
              }`}
              style={{
                clipPath: activeTab === tab.id 
                  ? "polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)"
                  : "polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0 100%)"
              }}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-lg sm:text-lg font-bold text-green-400">{tab.icon}</span>
                <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
                <span className="sm:hidden text-xs font-medium">{tab.label.split(' ')[0]}</span>
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-3 sm:p-6 flex-1 overflow-y-auto min-h-0">
        {activeTab === "ingredients" && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">What do you have in your kitchen?</h3>
              <p className="text-gray-400 text-sm">Add ingredients you have available</p>
            </div>
            <IngredientListFirebase />
          </div>
        )}
        {activeTab === "tools" && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">What equipment do you have?</h3>
              <p className="text-gray-400 text-sm">Add cooking tools and equipment</p>
            </div>
            <ToolsListFirebase />
          </div>
        )}
        {activeTab === "add-past" && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Add a Past Recipe</h3>
              <p className="text-gray-400 text-sm">Describe a meal you made before and we'll save it to your recipe collection</p>
            </div>
            <AddPastRecipe />
          </div>
        )}
        {activeTab === "generate" && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Let's create something amazing!</h3>
              <p className="text-gray-400 text-sm">Configure your recipe preferences</p>
            </div>
            <RecipeFormFirebase onRecipesGenerated={onRecipesGenerated} />
          </div>
        )}
      </div>
    </div>
  );
}
