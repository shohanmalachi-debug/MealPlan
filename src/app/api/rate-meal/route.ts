import { NextRequest, NextResponse } from "next/server";
import { updateSlotRating } from "@/lib/planStore";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { weekId, day, mealType, rating } = body ?? {};

  if (!weekId || !day || !mealType || !rating) {
    return NextResponse.json({ error: "weekId, day, mealType and rating are required" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
  }

  updateSlotRating(weekId, day, mealType, rating);
  return NextResponse.json({ ok: true });
}
