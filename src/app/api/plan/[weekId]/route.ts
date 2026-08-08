import { NextRequest, NextResponse } from "next/server";
import { loadPlan } from "@/lib/planStore";
import { getRecipeById } from "@/lib/recipes";
import type { Recipe } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { weekId: string } }
) {
  const plan = loadPlan(params.weekId);
  if (!plan) {
    return NextResponse.json({ error: "plan not found" }, { status: 404 });
  }

  const recipes: Record<string, Recipe> = {};
  for (const slot of plan.slots) {
    const recipe = getRecipeById(slot.recipeId);
    if (recipe) recipes[recipe.id] = recipe;
  }

  return NextResponse.json({ plan, recipes });
}
