import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { GroupedShoppingItem, ShoppingList, WeeklyPlan } from "./types";
import { getRecipeById } from "./recipes";
import { fromBaseQuantity, toBaseQuantity, unitDimension } from "./units";

const pantryStaples: string[] = JSON.parse(
  readFileSync(join(process.cwd(), "data", "pantry-staples.json"), "utf-8")
).map((s: string) => s.toLowerCase());

const smallQuantityItems: Record<string, { maxMl: number }> = JSON.parse(
  readFileSync(join(process.cwd(), "data", "small-quantity-items.json"), "utf-8")
);

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function buildShoppingList(plan: WeeklyPlan): ShoppingList {
  const totals = new Map<
    string,
    { baseQuantity: number; dimension: "mass" | "volume" | "count"; unit: any; category: any }
  >();

  for (const slot of plan.slots) {
    const recipe = getRecipeById(slot.recipeId);
    if (!recipe) continue;
    for (const ingredient of recipe.ingredients) {
      const key = normalizeName(ingredient.name);
      const dimension = unitDimension(ingredient.unit);
      const base = toBaseQuantity(ingredient.quantity, ingredient.unit);
      const existing = totals.get(key);
      if (existing) {
        existing.baseQuantity += base;
      } else {
        totals.set(key, {
          baseQuantity: base,
          dimension,
          unit: ingredient.unit,
          category: ingredient.category,
        });
      }
    }
  }

  const toBuy: GroupedShoppingItem[] = [];
  const likelyHave: GroupedShoppingItem[] = [];
  const pantryNote = new Set<string>();

  for (const [name, data] of totals.entries()) {
    if (pantryStaples.includes(name)) {
      pantryNote.add(name);
      continue;
    }

    const { quantity, unit } = fromBaseQuantity(data.baseQuantity, data.dimension, data.unit);
    const item: GroupedShoppingItem = { name, quantity, unit, category: data.category };

    const smallQty = smallQuantityItems[name];
    if (smallQty && data.dimension === "volume" && data.baseQuantity <= smallQty.maxMl) {
      likelyHave.push(item);
    } else {
      toBuy.push(item);
    }
  }

  toBuy.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  likelyHave.sort((a, b) => a.name.localeCompare(b.name));

  return {
    toBuy,
    likelyHave,
    pantryNote: Array.from(pantryNote).sort(),
  };
}
