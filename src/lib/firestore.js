import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

// User's ingredients collection
export const getIngredients = async (userId) => {
  const ingredientsRef = collection(db, 'users', userId, 'ingredients');
  const snapshot = await getDocs(ingredientsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addIngredient = async (userId, ingredientName) => {
  const ingredientsRef = collection(db, 'users', userId, 'ingredients');
  return await addDoc(ingredientsRef, {
    name: ingredientName,
    createdAt: new Date(),
    available: true
  });
};

export const toggleIngredientAvailability = async (userId, ingredientId, available) => {
  const ingredientRef = doc(db, 'users', userId, 'ingredients', ingredientId);
  return await updateDoc(ingredientRef, {
    available: available,
    updatedAt: new Date()
  });
};

export const removeIngredient = async (userId, ingredientId, ingredientName) => {
  // First, save to past ingredients
  if (ingredientName) {
    await addDoc(collection(db, 'users', userId, 'pastIngredients'), {
      name: ingredientName,
      removedAt: new Date(),
      createdAt: new Date()
    });
  }
  
  // Then remove from current ingredients
  const ingredientRef = doc(db, 'users', userId, 'ingredients', ingredientId);
  return await deleteDoc(ingredientRef);
};

// User's tools collection
export const getTools = async (userId) => {
  const toolsRef = collection(db, 'users', userId, 'tools');
  const snapshot = await getDocs(toolsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addTool = async (userId, tool) => {
  const toolsRef = collection(db, 'users', userId, 'tools');
  return await addDoc(toolsRef, {
    name: tool,
    createdAt: new Date()
  });
};

export const removeTool = async (userId, toolId) => {
  const toolRef = doc(db, 'users', userId, 'tools', toolId);
  return await deleteDoc(toolRef);
};

// User's past ingredients collection
export const getPastIngredients = async (userId) => {
  const pastIngredientsRef = collection(db, 'users', userId, 'pastIngredients');
  const q = query(pastIngredientsRef, orderBy('removedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const restoreIngredient = async (userId, ingredient) => {
  // Validate ingredient data
  if (!ingredient || !ingredient.name || !ingredient.id) {
    throw new Error('Invalid ingredient data for restoration');
  }
  
  // Add back to current ingredients
  await addIngredient(userId, ingredient.name);
  
  // Remove from past ingredients
  const pastIngredientRef = doc(db, 'users', userId, 'pastIngredients', ingredient.id);
  return await deleteDoc(pastIngredientRef);
};

export const deletePastIngredient = async (userId, pastIngredientId) => {
  const pastIngredientRef = doc(db, 'users', userId, 'pastIngredients', pastIngredientId);
  return await deleteDoc(pastIngredientRef);
};

// User's recipes collection
export const getRecipes = async (userId) => {
  const recipesRef = collection(db, 'users', userId, 'recipes');
  const q = query(recipesRef, orderBy('savedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveRecipe = async (userId, recipe) => {
  const recipesRef = collection(db, 'users', userId, 'recipes');
  return await addDoc(recipesRef, {
    ...recipe,
    savedAt: new Date(),
    createdAt: new Date(),
    rating: 0,
    notes: ''
  });
};

export const updateRecipeRating = async (userId, recipeId, rating) => {
  const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
  return await updateDoc(recipeRef, {
    rating: rating,
    updatedAt: new Date()
  });
};

export const updateRecipeNotes = async (userId, recipeId, notes) => {
  const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
  return await updateDoc(recipeRef, {
    notes: notes,
    updatedAt: new Date()
  });
};

export const deleteRecipe = async (userId, recipeId) => {
  const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
  return await deleteDoc(recipeRef);
};

// Real-time listeners
export const subscribeToIngredients = (userId, callback) => {
  const ingredientsRef = collection(db, 'users', userId, 'ingredients');
  return onSnapshot(ingredientsRef, (snapshot) => {
    const ingredients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(ingredients);
  });
};

export const subscribeToTools = (userId, callback) => {
  const toolsRef = collection(db, 'users', userId, 'tools');
  return onSnapshot(toolsRef, (snapshot) => {
    const tools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tools);
  });
};

export const subscribeToRecipes = (userId, callback) => {
  const recipesRef = collection(db, 'users', userId, 'recipes');
  const q = query(recipesRef, orderBy('savedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(recipes);
  });
};

export const subscribeToPastIngredients = (userId, callback) => {
  const pastIngredientsRef = collection(db, 'users', userId, 'pastIngredients');
  const q = query(pastIngredientsRef, orderBy('removedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const pastIngredients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(pastIngredients);
  });
};
