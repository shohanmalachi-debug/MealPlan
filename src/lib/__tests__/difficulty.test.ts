import { describe, expect, it } from "vitest";
import { getDifficulty } from "../difficulty";
import type { Recipe } from "../types";

function makeRecipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: "test",
    name: "Test",
    mealType: ["dinner"],
    cuisine: "thai",
    protein: "chicken",
    servings: 3,
    ingredients: [],
    steps: ["step"],
    activeMinutes: 20,
    totalMinutes: 20,
    spiceLevel: 0,
    kaiAdjustment: "",
    tags: [],
    imageQuery: "test",
    ...overrides,
  };
}

describe("getDifficulty", () => {
  it("rates a low-active, mostly-passive oven bake easier than a high-active quick stir-fry", () => {
    const ovenBake = makeRecipe({
      activeMinutes: 10,
      totalMinutes: 45,
      tags: [],
    });
    const stirFry = makeRecipe({
      activeMinutes: 28,
      totalMinutes: 30,
      tags: ["constant-stir"],
    });

    const ovenResult = getDifficulty(ovenBake);
    const stirFryResult = getDifficulty(stirFry);

    expect(ovenResult.difficulty).toBeLessThan(stirFryResult.difficulty);
  });

  it("buckets scores into Easy/Medium/Hard labels", () => {
    expect(getDifficulty(makeRecipe({ activeMinutes: 5, totalMinutes: 15 })).label).toBe("Easy");
    expect(
      getDifficulty(makeRecipe({ activeMinutes: 45, totalMinutes: 45, tags: ["constant-stir", "deep-fry"] }))
        .label
    ).toBe("Hard");
  });
});
