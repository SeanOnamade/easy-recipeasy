"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  subscribeToTools, 
  addTool, 
  removeTool 
} from "../lib/firestore";

export default function ToolsList() {
  const { user } = useAuth();
  const [tools, setTools] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToTools(user.uid, (tools) => {
      setTools(tools);
    });

    return unsubscribe;
  }, [user]);

  const handleAddTool = async () => {
    if (!input.trim() || !user) return;
    
    try {
      await addTool(user.uid, input.trim());
      setInput("");
    } catch (error) {
      console.error("Error adding tool:", error);
    }
  };

  const handleRemoveTool = async (toolId) => {
    if (!user) return;
    
    try {
      await removeTool(user.uid, toolId);
    } catch (error) {
      console.error("Error removing tool:", error);
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
        <p>Please sign in to manage tools</p>
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
              placeholder="Add a tool..."
              className="w-full border-2 border-gray-600 bg-gray-700/50 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-all duration-200 placeholder-gray-400 focus:bg-gray-700"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTool()}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleAddTool}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Add
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Press Enter or click Add to add tools to your kitchen
        </p>
      </div>
      {tools.length > 0 ? (
        <div>
          {/* Tool count header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300 text-sm font-medium">
                {tools.length} tool{tools.length !== 1 ? 's' : ''} available
              </span>
            </div>
            <div className="text-gray-500 text-xs">
              Click × to remove tool
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 sm:max-h-96 overflow-y-auto pr-2">
            {tools
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((tool) => (
            <div
              key={tool.id}
              className="group relative bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-600/50 rounded-xl p-4 hover:from-blue-900/40 hover:to-blue-800/30 hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span className="text-blue-100 font-medium text-sm block truncate">
                    {tool.name.charAt(0).toUpperCase() + tool.name.slice(1).toLowerCase()}
                  </span>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <span className="text-blue-400 text-xs">Available</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveTool(tool.id)}
                  className="ml-3 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-full p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110 cursor-pointer"
                  title="Remove tool"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Subtle animation line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-700 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-3">No tools yet</h3>
          <p className="text-gray-500 mb-4 max-w-sm mx-auto">
            Add cooking equipment to get more specific recipe suggestions
          </p>
          <div className="text-xs text-gray-600">
            Tip: Add tools like "Oven", "Stovetop", "Blender", "Knife"
          </div>
        </div>
      )}
    </div>
  );
}
