import db from "./db";
import type { PlanSlot, WeeklyPlan } from "./types";

export function savePlan(plan: WeeklyPlan) {
  const insertPlan = db.prepare(`
    INSERT INTO plans (id, startDate, breakfastCount, lunchCount, dinnerCount, batchCookNote)
    VALUES (@id, @startDate, @breakfastCount, @lunchCount, @dinnerCount, @batchCookNote)
    ON CONFLICT(id) DO UPDATE SET
      startDate = excluded.startDate,
      breakfastCount = excluded.breakfastCount,
      lunchCount = excluded.lunchCount,
      dinnerCount = excluded.dinnerCount,
      batchCookNote = excluded.batchCookNote
  `);
  insertPlan.run({
    id: plan.id,
    startDate: plan.startDate,
    breakfastCount: plan.counts.breakfast,
    lunchCount: plan.counts.lunch,
    dinnerCount: plan.counts.dinner,
    batchCookNote: plan.batchCookNote ?? null,
  });

  const deleteSlots = db.prepare(`DELETE FROM plan_slots WHERE planId = ?`);
  deleteSlots.run(plan.id);

  const insertSlot = db.prepare(`
    INSERT INTO plan_slots (planId, day, mealType, recipeId, rating, swappedFrom)
    VALUES (@planId, @day, @mealType, @recipeId, @rating, @swappedFrom)
  `);
  const insertMany = db.transaction((slots: PlanSlot[]) => {
    for (const slot of slots) {
      insertSlot.run({
        planId: plan.id,
        day: slot.day,
        mealType: slot.mealType,
        recipeId: slot.recipeId,
        rating: slot.rating ?? null,
        swappedFrom: slot.swappedFrom ?? null,
      });
    }
  });
  insertMany(plan.slots);
}

export function loadPlan(weekId: string): WeeklyPlan | null {
  const planRow = db.prepare(`SELECT * FROM plans WHERE id = ?`).get(weekId) as
    | {
        id: string;
        startDate: string;
        breakfastCount: number;
        lunchCount: number;
        dinnerCount: number;
        batchCookNote: string | null;
      }
    | undefined;
  if (!planRow) return null;

  const slotRows = db
    .prepare(`SELECT day, mealType, recipeId, rating, swappedFrom FROM plan_slots WHERE planId = ?`)
    .all(weekId) as Array<{
    day: string;
    mealType: PlanSlot["mealType"];
    recipeId: string;
    rating: number | null;
    swappedFrom: string | null;
  }>;

  return {
    id: planRow.id,
    startDate: planRow.startDate,
    counts: {
      breakfast: planRow.breakfastCount,
      lunch: planRow.lunchCount,
      dinner: planRow.dinnerCount,
    },
    batchCookNote: planRow.batchCookNote ?? undefined,
    slots: slotRows.map((s) => ({
      day: s.day,
      mealType: s.mealType,
      recipeId: s.recipeId,
      rating: (s.rating ?? undefined) as PlanSlot["rating"],
      swappedFrom: s.swappedFrom ?? undefined,
    })),
  };
}

export function updateSlotRating(
  weekId: string,
  day: string,
  mealType: string,
  rating: number
) {
  db.prepare(
    `UPDATE plan_slots SET rating = ? WHERE planId = ? AND day = ? AND mealType = ?`
  ).run(rating, weekId, day, mealType);
}

export function swapSlot(
  weekId: string,
  day: string,
  mealType: string,
  newRecipeId: string,
  swappedFrom: string
) {
  db.prepare(
    `UPDATE plan_slots SET recipeId = ?, swappedFrom = ? WHERE planId = ? AND day = ? AND mealType = ?`
  ).run(newRecipeId, swappedFrom, weekId, day, mealType);
}

export function getLatestPlanId(): string | null {
  const row = db.prepare(`SELECT id FROM plans ORDER BY rowid DESC LIMIT 1`).get() as
    | { id: string }
    | undefined;
  return row?.id ?? null;
}
