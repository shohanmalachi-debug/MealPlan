import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { Recipe } from "./types";

const RECIPES_DIR = join(process.cwd(), "data", "recipes");

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.enum(["g", "kg", "ml", "l", "tsp", "tbsp", "cup", "unit", "clove", "pinch"]),
  category: z.enum(["protein", "vegetable", "pantry", "dairy", "herb-spice", "other"]),
});

export const recipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  mealType: z.array(z.enum(["breakfast", "lunch", "dinner"])).min(1),
  cuisine: z.enum([
    "sri-lankan",
    "indian",
    "thai",
    "chinese",
    "japanese",
    "vietnamese",
    "malaysian",
    "korean",
  ]),
  protein: z.enum(["chicken", "beef", "fish", "prawn", "egg", "tofu", "lentil", "pork"]),
  servings: z.number(),
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(z.string()).min(1),
  activeMinutes: z.number(),
  totalMinutes: z.number(),
  spiceLevel: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  kaiAdjustment: z.string(),
  tags: z.array(z.string()),
  imageQuery: z.string(),
  batchCookFriendly: z.boolean().optional(),
});

let cache: Recipe[] | null = null;

export function loadAllRecipes(): Recipe[] {
  if (cache) return cache;
  const files = readdirSync(RECIPES_DIR).filter((f) => f.endsWith(".json"));
  const recipes = files.map((file) => {
    const raw = JSON.parse(readFileSync(join(RECIPES_DIR, file), "utf-8"));
    return recipeSchema.parse(raw) as Recipe;
  });
  cache = recipes;
  return recipes;
}

export function getRecipeById(id: string): Recipe | undefined {
  return loadAllRecipes().find((r) => r.id === id);
}

export function getRecipesByMealType(mealType: Recipe["mealType"][number]): Recipe[] {
  return loadAllRecipes().filter((r) => r.mealType.includes(mealType));
}
