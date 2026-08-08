import { describe, expect, it } from "vitest";
import { generateWeeklyPlan } from "../planner";
import { getDifficulty } from "../difficulty";
import { getRecipeById } from "../recipes";

describe("generateWeeklyPlan", () => {
  it("generates plans with no duplicate recipes and a sensible quick/fuller/difficulty mix, 20 runs", () => {
    for (let i = 0; i < 20; i++) {
      const plan = generateWeeklyPlan({
        weekId: `week-test-${i}`,
        startDate: "2026-08-08",
        counts: { breakfast: 3, lunch: 3, dinner: 5 },
      });

      const dinnerSlots = plan.slots.filter((s) => s.mealType === "dinner");
      expect(dinnerSlots.length).toBe(5);

      const recipeIds = plan.slots.map((s) => s.recipeId);
      expect(new Set(recipeIds).size).toBe(recipeIds.length);

      const dinnerRecipes = dinnerSlots.map((s) => getRecipeById(s.recipeId)!);
      const quickCount = dinnerRecipes.filter((r) => r.totalMinutes <= 30).length;
      const fullerCount = dinnerRecipes.length - quickCount;
      expect(quickCount).toBeGreaterThanOrEqual(2);
      expect(fullerCount).toBeGreaterThanOrEqual(1);

      const hardCount = dinnerRecipes.filter((r) => getDifficulty(r).label === "Hard").length;
      expect(hardCount).toBeLessThanOrEqual(2);
    }
  });

  it("respects requested meal counts per type", () => {
    const plan = generateWeeklyPlan({
      weekId: "week-counts",
      startDate: "2026-08-08",
      counts: { breakfast: 2, lunch: 1, dinner: 4 },
    });
    expect(plan.slots.filter((s) => s.mealType === "breakfast").length).toBe(2);
    expect(plan.slots.filter((s) => s.mealType === "lunch").length).toBe(1);
    expect(plan.slots.filter((s) => s.mealType === "dinner").length).toBe(4);
  });
});
