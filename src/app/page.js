"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast, useLoading } from "../contexts/AppContext";
import TabbedInterface from "../components/TabbedInterface";
import RecipeCard from "../components/RecipeCard";
import RecipeHistoryFirebase from "../components/RecipeHistoryFirebase";
import NavBar from "../components/NavBar";

export default function Home() {
  const { user, loading } = useAuth();
  const showToast = useToast();
  const { isLoading, setLoading } = useLoading();
  const [recipes, setRecipes] = useState([]);
  const [showNewRecipes, setShowNewRecipes] = useState(false);
  
  // Handle escape key to close overlay
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showNewRecipes) {
        setShowNewRecipes(false);
      }
    };

    if (showNewRecipes) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showNewRecipes]);
  
  const handleRecipesGenerated = (newRecipes) => {
    console.log("Recipes received:", newRecipes);
    setRecipes(newRecipes);
    setShowNewRecipes(true);
    showToast("Recipes generated successfully!", "success");
  };

  const handleSaveRecipe = async (recipe) => {
    if (!user) {
      showToast("Please sign in to save recipes", "error");
      // Auth modal is now handled in NavBar
      return;
    }

    try {
      setLoading(true);
      const { saveRecipe } = await import("../lib/firestore");
      await saveRecipe(user.uid, recipe);
      showToast("Recipe saved successfully!", "success");
    } catch (error) {
      console.error("Error saving recipe:", error);
      showToast("Failed to save recipe", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRateRecipe = async (recipeId, rating) => {
    if (!user) return;
    
    try {
      const { updateRecipeRating } = await import("../lib/firestore");
      await updateRecipeRating(user.uid, recipeId, rating);
      showToast("Rating updated!", "success");
    } catch (error) {
      console.error("Error updating rating:", error);
      showToast("Failed to update rating", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Navigation Bar */}
      <NavBar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 h-full">
          {/* Left Column - Tabbed Interface */}
          <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)]">
            <TabbedInterface onRecipesGenerated={handleRecipesGenerated} />
          </div>

          {/* Right Column - Recipe History */}
          <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)]">
            <RecipeHistoryFirebase onClose={() => {}} />
          </div>
        </div>
      </div>

      {/* New Recipes Overlay */}
      {showNewRecipes && recipes.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNewRecipes(false);
            }
          }}
        >
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Overlay Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-2xl font-bold text-white">New Recipes Generated!</h2>
              <button
                onClick={() => setShowNewRecipes(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Recipes Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              {recipes.map((r, i) => (
                <RecipeCard
                  key={`${r.title}-${i}`}
                  recipe={r}
                  onSave={handleSaveRecipe}
                  onRate={handleRateRecipe}
                />
              ))}
            </div>
            
            {/* Overlay Footer */}
            <div className="p-6 border-t border-gray-700 bg-gray-700/30">
              <div className="flex justify-between items-center">
                <p className="text-gray-300 text-sm">
                  Save recipes you like to add them to your history
                </p>
                <button
                  onClick={() => setShowNewRecipes(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}



// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       {/* Tailwind Test - This should be a bright red box if Tailwind is working */}
//       <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
//         🎉 Tailwind CSS is working! This box should be red.
//       </div>
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               src/app/page.js
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
