import { describe, expect, it, vi } from "vitest";
import type { Recipe, WeeklyPlan } from "../types";

const mockRecipes: Record<string, Recipe> = {
  "recipe-a": {
    id: "recipe-a",
    name: "Recipe A",
    mealType: ["dinner"],
    cuisine: "thai",
    protein: "chicken",
    servings: 3,
    ingredients: [
      { name: "chicken thigh, boneless", quantity: 400, unit: "g", category: "protein" },
      { name: "soy sauce", quantity: 1, unit: "tbsp", category: "pantry" },
      { name: "salt", quantity: 1, unit: "pinch", category: "pantry" },
    ],
    steps: ["step"],
    activeMinutes: 20,
    totalMinutes: 25,
    spiceLevel: 0,
    kaiAdjustment: "",
    tags: [],
    imageQuery: "test",
  },
  "recipe-b": {
    id: "recipe-b",
    name: "Recipe B",
    mealType: ["dinner"],
    cuisine: "chinese",
    protein: "beef",
    servings: 3,
    ingredients: [
      { name: "chicken thigh, boneless", quantity: 200, unit: "g", category: "protein" },
      { name: "soy sauce", quantity: 2, unit: "tbsp", category: "pantry" },
      { name: "curry powder", quantity: 1, unit: "tsp", category: "pantry" },
    ],
    steps: ["step"],
    activeMinutes: 20,
    totalMinutes: 25,
    spiceLevel: 0,
    kaiAdjustment: "",
    tags: [],
    imageQuery: "test",
  },
};

vi.mock("../recipes", () => ({
  getRecipeById: (id: string) => mockRecipes[id],
}));

const { buildShoppingList } = await import("../shoppingList");

describe("buildShoppingList", () => {
  const plan: WeeklyPlan = {
    id: "week-test",
    startDate: "2026-08-08",
    counts: { breakfast: 0, lunch: 0, dinner: 2 },
    slots: [
      { day: "Mon", mealType: "dinner", recipeId: "recipe-a" },
      { day: "Tue", mealType: "dinner", recipeId: "recipe-b" },
    ],
  };

  it("aggregates matching ingredient quantities across recipes", () => {
    const list = buildShoppingList(plan);
    const chicken = list.toBuy.find((i) => i.name === "chicken thigh, boneless");
    expect(chicken).toBeDefined();
    expect(chicken!.quantity).toBe(600);
    expect(chicken!.unit).toBe("g");
  });

  it("excludes pantry staples from the buy list and notes them", () => {
    const list = buildShoppingList(plan);
    expect(list.toBuy.some((i) => i.name === "salt")).toBe(false);
    expect(list.toBuy.some((i) => i.name === "curry powder")).toBe(false);
    expect(list.pantryNote).toContain("salt");
    expect(list.pantryNote).toContain("curry powder");
  });

  it("flags small aggregated quantities of condiments as likely-already-have", () => {
    const list = buildShoppingList(plan);
    // 1 tbsp + 2 tbsp = 3 tbsp = 45ml, under the 60ml soy sauce threshold
    const soy = list.likelyHave.find((i) => i.name === "soy sauce");
    expect(soy).toBeDefined();
    expect(list.toBuy.some((i) => i.name === "soy sauce")).toBe(false);
  });
});
