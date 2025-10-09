# Easy Recipeasy - Recipe Generation & Management App

## Overview
A Next.js web application that generates personalized recipes based on available ingredients and cooking tools, with comprehensive recipe management and history tracking.

## Tech Stack
- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **AI**: OpenAI GPT-4 for recipe generation
- **Styling**: Custom dark theme with green accents, Spectral font
- **State Management**: React Context, Firebase real-time listeners

## Core Features

### 1. Ingredient Management
- **Add/Remove Ingredients**: Add ingredients with availability toggle
- **Availability System**: Mark ingredients as Available/Unavailable (not deleted)
- **Past Ingredients**: Deleted ingredients move to "Past Ingredients" pantry log
- **Restore Functionality**: Restore ingredients from past list
- **Alphabetical Sorting**: All ingredients sorted alphabetically
- **Real-time Updates**: Firebase-powered live synchronization

### 2. Cooking Tools Management
- **Add/Remove Tools**: Manage cooking equipment
- **Same UI/UX**: Consistent with ingredients management
- **Alphabetical Sorting**: Tools sorted alphabetically
- **Real-time Updates**: Firebase synchronization

### 3. Recipe Generation
- **AI-Powered**: Uses OpenAI GPT-4 for intelligent recipe creation
- **Smart Filtering**: Only uses available ingredients for generation
- **Customizable Parameters**:
  - Cooking time (optional)
  - Target calories (optional)
  - Recipe type/description (e.g., "post-workout protein meal", "smoothie")
  - Prioritize specific ingredients
- **Multiple Recipes**: Generates 3 recipes per request
- **Overlay Display**: New recipes appear in modal overlay

### 4. Recipe Management
- **Save Recipes**: Save generated recipes to personal history
- **Recipe History**: Always visible on right side of screen
- **Search & Filter**: Search by ingredient, title, or cooking steps
- **Calorie Filtering**: Filter by calorie range
- **Rating System**: 1-5 star rating for saved recipes
- **Notes System**: Add personal notes to saved recipes
- **Delete Recipes**: Remove recipes from history

### 5. User Authentication
- **Firebase Auth**: Email/password authentication
- **User-specific Data**: All data tied to user accounts
- **Sign In/Out**: Modal-based authentication flow

## UI/UX Design

### Layout
- **Two-Column Layout**: Left (ingredients/tools) + Right (recipe history)
- **Tabbed Interface**: Ingredients, Tools, Past Ingredients, Generate
- **Equal Heights**: Both sides scrollable with same height
- **Responsive**: Mobile-friendly design

### Visual Design
- **Dark Theme**: Black/gray background with green accents
- **No Emojis**: Clean, professional appearance
- **Custom Scrollbars**: Styled scrollbars throughout
- **Card-based UI**: Modern card design for ingredients/tools/recipes
- **Hover Effects**: Subtle animations and transitions

### Typography
- **Spectral Font**: Professional serif font
- **Proper Capitalization**: All text properly capitalized
- **Consistent Sizing**: Hierarchical text sizing

## Data Structure

### Recipe Object
```javascript
{
  title: "Recipe Name",
  ingredients: ["ingredient1", "ingredient2"],
  steps: ["step1", "step2"],
  estimated_calories: 500,
  recipeType: "meal type",
  rating: 0,
  notes: "",
  savedAt: Date,
  userId: "user_id"
}
```

### Ingredient Object
```javascript
{
  name: "ingredient name",
  available: true/false,
  createdAt: Date,
  userId: "user_id"
}
```

## Key Workflows

### 1. Recipe Generation Flow
1. Add ingredients (marked as available)
2. Add cooking tools
3. Configure recipe preferences
4. Generate recipes
5. Review in overlay modal
6. Save desired recipes
7. Close overlay to return to history

### 2. Ingredient Management Flow
1. Add ingredients to current list
2. Toggle availability as needed
3. Delete ingredients (moves to Past Ingredients)
4. Restore from Past Ingredients when needed

### 3. Recipe History Flow
1. Browse saved recipes
2. Search/filter by various criteria
3. Rate recipes after cooking
4. Add personal notes
5. Delete unwanted recipes

## Current Limitations & Potential Improvements

### Missing Features
- **Recipe Categories**: No categorization system
- **Meal Planning**: No weekly/monthly planning
- **Shopping Lists**: No grocery list generation
- **Nutritional Info**: Limited to calories only
- **Recipe Scaling**: No portion size adjustment
- **Image Support**: No recipe photos
- **Social Features**: No sharing or community
- **Offline Support**: Requires internet connection
- **Recipe Import**: No external recipe import
- **Dietary Restrictions**: No allergen/diet filtering
- **Cooking Timers**: No built-in timers
- **Recipe Collections**: No custom collections/folders
- **Export/Import**: No data backup/restore
- **Advanced Search**: No complex search queries
- **Recipe Suggestions**: No "similar recipes" feature
- **Cooking Progress**: No step-by-step tracking
- **Ingredient Substitutions**: No substitution suggestions
- **Seasonal Recipes**: No seasonal/weather-based suggestions
- **Cooking Skill Levels**: No difficulty ratings
- **Prep Time**: No separate prep/cook time tracking

### Technical Debt
- **Error Handling**: Basic error handling
- **Loading States**: Limited loading indicators
- **Data Validation**: Minimal input validation
- **Performance**: No caching or optimization
- **Testing**: No test coverage
- **Documentation**: Limited code documentation

## File Structure
```
src/
├── app/
│   ├── api/recipes/route.js    # OpenAI integration
│   ├── globals.css             # Global styles + scrollbars
│   ├── layout.js               # Root layout + auth provider
│   └── page.js                 # Main page component
├── components/
│   ├── AuthModal.jsx           # Authentication modal
│   ├── IngredientListFirebase.jsx    # Ingredients management
│   ├── ToolsListFirebase.jsx         # Tools management
│   ├── PastIngredients.jsx           # Past ingredients list
│   ├── RecipeFormFirebase.jsx        # Recipe generation form
│   ├── RecipeCard.jsx                # Individual recipe display
│   ├── RecipeHistoryFirebase.jsx     # Recipe history + search
│   ├── RecipeSearch.jsx              # Search/filter component
│   └── TabbedInterface.jsx           # Main tabbed interface
├── contexts/
│   └── AuthContext.js          # Authentication context
└── lib/
    ├── firebase.js             # Firebase configuration
    ├── firestore.js            # Firestore operations
    └── auth.js                 # Authentication operations
```

## Current Status
- **Fully Functional**: All core features working
- **Production Ready**: Stable and user-friendly
- **Firebase Integrated**: Complete backend integration
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live data synchronization
- **Clean UI**: Professional, modern interface

The app successfully combines AI-powered recipe generation with comprehensive recipe management, creating a complete cooking assistant that helps users make the most of their available ingredients.
