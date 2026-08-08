import { NextRequest, NextResponse } from "next/server";
import { loadPlan } from "@/lib/planStore";
import { buildShoppingList } from "@/lib/shoppingList";

export async function GET(req: NextRequest) {
  const weekId = req.nextUrl.searchParams.get("weekId");
  if (!weekId) {
    return NextResponse.json({ error: "weekId is required" }, { status: 400 });
  }

  const plan = loadPlan(weekId);
  if (!plan) {
    return NextResponse.json({ error: "plan not found" }, { status: 404 });
  }

  const shoppingList = buildShoppingList(plan);
  return NextResponse.json(shoppingList);
}
