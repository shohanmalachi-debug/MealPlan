import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyPlan } from "@/lib/planner";
import { savePlan } from "@/lib/planStore";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const breakfast = Number(body?.counts?.breakfast ?? 0);
  const lunch = Number(body?.counts?.lunch ?? 0);
  const dinner = Number(body?.counts?.dinner ?? 5);

  const startDate = body?.startDate ?? new Date().toISOString().slice(0, 10);
  const weekId = `week-${startDate}`;

  const plan = generateWeeklyPlan({
    weekId,
    startDate,
    counts: { breakfast, lunch, dinner },
  });

  savePlan(plan);

  return NextResponse.json(plan);
}
