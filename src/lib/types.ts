export type MealType = "breakfast" | "lunch" | "dinner";

export type Cuisine =
  | "sri-lankan"
  | "indian"
  | "thai"
  | "chinese"
  | "japanese"
  | "vietnamese"
  | "malaysian"
  | "korean";

export type Protein =
  | "chicken"
  | "beef"
  | "fish"
  | "prawn"
  | "egg"
  | "tofu"
  | "lentil"
  | "pork";

export type IngredientCategory =
  | "protein"
  | "vegetable"
  | "pantry"
  | "dairy"
  | "herb-spice"
  | "other";

export type Unit =
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "tsp"
  | "tbsp"
  | "cup"
  | "unit"
  | "clove"
  | "pinch";

export interface Ingredient {
  name: string;
  quantity: number;
  unit: Unit;
  category: IngredientCategory;
}

export interface Recipe {
  id: string;
  name: string;
  mealType: MealType[];
  cuisine: Cuisine;
  protein: Protein;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  activeMinutes: number;
  totalMinutes: number;
  spiceLevel: 0 | 1 | 2 | 3;
  kaiAdjustment: string;
  tags: string[];
  imageQuery: string;
  batchCookFriendly?: boolean;
}

export type DifficultyLabel = "Easy" | "Medium" | "Hard";

export interface DifficultyResult {
  activeScore: number;
  timeScore: number;
  difficulty: number;
  label: DifficultyLabel;
}

export interface PlanSlot {
  day: string;
  mealType: MealType;
  recipeId: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  swappedFrom?: string;
}

export interface WeeklyPlan {
  id: string;
  startDate: string;
  counts: { breakfast: number; lunch: number; dinner: number };
  slots: PlanSlot[];
  batchCookNote?: string;
}

export interface GroupedShoppingItem {
  name: string;
  quantity: number;
  unit: Unit;
  category: IngredientCategory;
}

export interface ShoppingList {
  toBuy: GroupedShoppingItem[];
  likelyHave: GroupedShoppingItem[];
  pantryNote: string[];
}
