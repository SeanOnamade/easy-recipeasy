"use client";
import { useState } from "react";
import IngredientListFirebase from "./IngredientListFirebase";
import ToolsListFirebase from "./ToolsListFirebase";
import RecipeFormFirebase from "./RecipeFormFirebase";
import AddPastRecipe from "./AddPastRecipe";
import RecipeHistoryFirebase from "./RecipeHistoryFirebase";

export default function MobileTabbedInterface({ onRecipesGenerated }) {
  const [activeTab, setActiveTab] = useState("ingredients");

  const tabs = [
    { id: "ingredients", label: "Ingredients", icon: "I" },
    { id: "tools", label: "Tools", icon: "T" },
    { id: "generate", label: "Generate", icon: "G" },
    { id: "add-past", label: "Add Past", icon: "A" },
    { id: "history", label: "History", icon: "H" }
  ];

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden h-[calc(100vh-7rem)] flex flex-col">
      {/* Tab Headers - Mobile Optimized */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-600 border-b border-gray-500 flex-shrink-0">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-1 py-2 font-semibold text-xs transition-all duration-200 flex items-center justify-center cursor-pointer rounded-t-lg whitespace-nowrap flex-1 min-w-0 ${
                activeTab === tab.id
                  ? "bg-gray-800 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-600/50"
              }`}
            >
              <div className="flex flex-col items-center space-y-0.5">
                <span className="text-sm font-bold text-green-400">{tab.icon}</span>
                <span className="text-xs font-medium leading-tight">{tab.label}</span>
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-3 flex-1 overflow-y-auto min-h-0">
        {activeTab === "ingredients" && (
          <div>
            <IngredientListFirebase />
          </div>
        )}

        {activeTab === "tools" && (
          <div>
            <ToolsListFirebase />
          </div>
        )}

        {activeTab === "generate" && (
          <div>
            <RecipeFormFirebase onRecipesGenerated={onRecipesGenerated} />
          </div>
        )}

        {activeTab === "add-past" && (
          <div>
            <AddPastRecipe />
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <RecipeHistoryFirebase onClose={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}
