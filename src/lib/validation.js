import { z } from 'zod';

// Recipe schema for validation
export const RecipeSchema = z.object({
  title: z.string().min(1, "Recipe title is required"),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  steps: z.array(z.string()).min(1, "At least one step is required"),
  estimated_calories: z.number().min(0).optional(),
});

// Array of recipes schema
export const RecipesArraySchema = z.array(RecipeSchema).min(1, "At least one recipe is required");

// Validate and parse LLM response
export const validateRecipesResponse = (data) => {
  try {
    // First try to parse as array directly
    let recipes = data;
    if (typeof data === 'string') {
      recipes = JSON.parse(data);
    }
    
    // If it's wrapped in an object, extract the recipes
    if (recipes && typeof recipes === 'object' && !Array.isArray(recipes)) {
      if (recipes.recipes && Array.isArray(recipes.recipes)) {
        recipes = recipes.recipes;
      } else if (recipes.data && Array.isArray(recipes.data)) {
        recipes = recipes.data;
      }
    }
    
    // Validate the recipes array
    const validatedRecipes = RecipesArraySchema.parse(recipes);
    
    // Add default values for missing fields
    return validatedRecipes.map(recipe => ({
      ...recipe,
      estimated_calories: recipe.estimated_calories || 0,
    }));
    
  } catch (error) {
    console.error('Recipe validation error:', error);
    
    // Fallback: try to extract recipes from malformed response
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
    }
    
    throw new Error(`Invalid recipe format: ${error.message}`);
  }
};

// Validate single recipe
export const validateSingleRecipe = (recipe) => {
  try {
    return RecipeSchema.parse(recipe);
  } catch (error) {
    console.error('Single recipe validation error:', error);
    throw new Error(`Invalid recipe: ${error.message}`);
  }
};
