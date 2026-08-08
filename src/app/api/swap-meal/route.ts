import { NextRequest, NextResponse } from "next/server";
import { loadPlan, swapSlot } from "@/lib/planStore";
import { findSwapCandidates } from "@/lib/planner";
import type { MealType } from "@/lib/types";

export async function GET(req: NextRequest) {
  const weekId = req.nextUrl.searchParams.get("weekId");
  const day = req.nextUrl.searchParams.get("day");
  const mealType = req.nextUrl.searchParams.get("mealType") as MealType | null;

  if (!weekId || !day || !mealType) {
    return NextResponse.json({ error: "weekId, day and mealType are required" }, { status: 400 });
  }

  const plan = loadPlan(weekId);
  if (!plan) return NextResponse.json({ error: "plan not found" }, { status: 404 });

  const currentSlot = plan.slots.find((s) => s.day === day && s.mealType === mealType);
  if (!currentSlot) return NextResponse.json({ error: "slot not found" }, { status: 404 });

  const usedIds = plan.slots.map((s) => s.recipeId);
  const restOfWeekIds = plan.slots
    .filter((s) => !(s.day === day && s.mealType === mealType))
    .map((s) => s.recipeId);

  const candidates = findSwapCandidates(mealType, usedIds, restOfWeekIds);
  return NextResponse.json({ candidates });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { weekId, day, mealType, newRecipeId } = body ?? {};

  if (!weekId || !day || !mealType || !newRecipeId) {
    return NextResponse.json(
      { error: "weekId, day, mealType and newRecipeId are required" },
      { status: 400 }
    );
  }

  const plan = loadPlan(weekId);
  if (!plan) return NextResponse.json({ error: "plan not found" }, { status: 404 });

  const currentSlot = plan.slots.find((s) => s.day === day && s.mealType === mealType);
  if (!currentSlot) return NextResponse.json({ error: "slot not found" }, { status: 404 });

  swapSlot(weekId, day, mealType, newRecipeId, currentSlot.recipeId);
  return NextResponse.json({ ok: true });
}
