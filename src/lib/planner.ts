import type { MealType, PlanSlot, Recipe, WeeklyPlan } from "./types";
import { getDifficulty } from "./difficulty";
import { getRecipeById, getRecipesByMealType } from "./recipes";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKEND_DAYS = ["Fri", "Sat", "Sun"];
const MAX_PER_CUISINE = 2;
const MAX_HARD_DINNERS = 2;
const QUICK_ACTIVE_THRESHOLD = 30;

export interface GeneratePlanInput {
  weekId: string;
  startDate: string;
  counts: { breakfast: number; lunch: number; dinner: number };
}

function keyIngredients(recipe: Recipe): Set<string> {
  const nonStaple = recipe.ingredients.filter((i) => i.category !== "pantry" && i.category !== "herb-spice");
  const names = [recipe.protein as string, ...nonStaple.slice(0, 3).map((i) => i.name)];
  return new Set(names.map((n) => n.toLowerCase()));
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  let score = 0;
  for (const item of a) if (b.has(item)) score++;
  return score;
}

function isQuick(recipe: Recipe): boolean {
  return recipe.totalMinutes <= QUICK_ACTIVE_THRESHOLD;
}

function selectMealsForType(
  mealType: MealType,
  count: number,
  rng: () => number,
  globalUsedIds: Set<string>
): Recipe[] {
  const pool = shuffle(
    getRecipesByMealType(mealType).filter((r) => !globalUsedIds.has(r.id)),
    rng
  );
  if (count === 0 || pool.length === 0) return [];

  const selected: Recipe[] = [];
  const usedIngredientSets: Set<string>[] = [];
  const cuisineCounts: Record<string, number> = {};

  const attempt = (): Recipe[] | null => {
    const localSelected: Recipe[] = [];
    const localSets: Set<string>[] = [];
    const localCuisineCounts: Record<string, number> = {};
    const remaining = [...pool];

    // seed with a random first pick
    const first = remaining.splice(Math.floor(rng() * remaining.length), 1)[0];
    localSelected.push(first);
    localSets.push(keyIngredients(first));
    localCuisineCounts[first.cuisine] = 1;

    while (localSelected.length < count && remaining.length > 0) {
      const candidates = remaining.filter(
        (r) =>
          (localCuisineCounts[r.cuisine] ?? 0) < MAX_PER_CUISINE &&
          !localSelected.some((s) => s.id === r.id)
      );
      const pickFrom = candidates.length > 0 ? candidates : remaining;

      pickFrom.sort((a, b) => {
        const scoreA = Math.max(...localSets.map((s) => overlapScore(s, keyIngredients(a))));
        const scoreB = Math.max(...localSets.map((s) => overlapScore(s, keyIngredients(b))));
        return scoreB - scoreA;
      });

      const topN = pickFrom.slice(0, Math.min(3, pickFrom.length));
      const chosen = topN[Math.floor(rng() * topN.length)];

      localSelected.push(chosen);
      localSets.push(keyIngredients(chosen));
      localCuisineCounts[chosen.cuisine] = (localCuisineCounts[chosen.cuisine] ?? 0) + 1;
      const idx = remaining.findIndex((r) => r.id === chosen.id);
      if (idx >= 0) remaining.splice(idx, 1);
    }

    if (localSelected.length < count) return null;

    if (mealType === "dinner" && localSelected.length >= 3) {
      const quickCount = localSelected.filter(isQuick).length;
      const fullerCount = localSelected.length - quickCount;
      const hardCount = localSelected.filter((r) => getDifficulty(r).label === "Hard").length;
      if (quickCount < 2 || fullerCount < 1 || hardCount > MAX_HARD_DINNERS) return null;
    }

    return localSelected;
  };

  for (let i = 0; i < 25; i++) {
    const result = attempt();
    if (result) {
      selected.push(...result);
      break;
    }
  }

  if (selected.length === 0) {
    // fallback: just take first `count` distinct recipes, ignore soft constraints
    selected.push(...pool.slice(0, count));
  }

  return selected;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function assignDays(mealType: MealType, recipes: Recipe[]): PlanSlot[] {
  const dayPool = [...DAYS];
  const sorted = [...recipes].sort((a, b) => {
    const diffA = getDifficulty(a).difficulty;
    const diffB = getDifficulty(b).difficulty;
    return diffB - diffA; // harder meals first, biased to weekend
  });

  const weekendAvailable = [...WEEKEND_DAYS];
  const weekdayAvailable = dayPool.filter((d) => !WEEKEND_DAYS.includes(d));

  const slots: PlanSlot[] = [];
  for (const recipe of sorted) {
    const difficulty = getDifficulty(recipe);
    let day: string | undefined;
    if (difficulty.label !== "Easy" && weekendAvailable.length > 0) {
      day = weekendAvailable.shift();
    } else if (weekdayAvailable.length > 0) {
      day = weekdayAvailable.shift();
    } else if (weekendAvailable.length > 0) {
      day = weekendAvailable.shift();
    }
    if (!day) continue;
    slots.push({ day, mealType, recipeId: recipe.id });
  }

  // stable sort by day-of-week order
  slots.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day));
  return slots;
}

function buildBatchCookNote(dinnerSlots: PlanSlot[]): string | undefined {
  const dinnerRecipes = dinnerSlots
    .map((s) => ({ slot: s, recipe: getRecipesByMealType("dinner").find((r) => r.id === s.recipeId) }))
    .filter((x) => x.recipe?.batchCookFriendly);

  if (dinnerRecipes.length < 2) return undefined;

  const [first, second] = dinnerRecipes;
  const suggestedDay =
    dinnerSlots.find((s) => WEEKEND_DAYS.includes(s.day))?.day ?? dinnerSlots[0]?.day ?? "Sat";

  return `Tip: cook "${first.recipe!.name}" and "${second.recipe!.name}" together on ${suggestedDay} — both keep well and reheat easily, saving you a night later in the week.`;
}

export function generateWeeklyPlan(input: GeneratePlanInput): WeeklyPlan {
  const rng = mulberry32(hashSeed(input.weekId + Date.now()));

  const globalUsedIds = new Set<string>();

  const dinners = selectMealsForType("dinner", input.counts.dinner, rng, globalUsedIds);
  dinners.forEach((r) => globalUsedIds.add(r.id));

  const lunches = selectMealsForType("lunch", input.counts.lunch, rng, globalUsedIds);
  lunches.forEach((r) => globalUsedIds.add(r.id));

  const breakfasts = selectMealsForType("breakfast", input.counts.breakfast, rng, globalUsedIds);
  breakfasts.forEach((r) => globalUsedIds.add(r.id));

  const breakfastSlots = assignDays("breakfast", breakfasts);
  const lunchSlots = assignDays("lunch", lunches);
  const dinnerSlots = assignDays("dinner", dinners);

  const batchCookNote = buildBatchCookNote(dinnerSlots);

  return {
    id: input.weekId,
    startDate: input.startDate,
    counts: input.counts,
    slots: [...breakfastSlots, ...lunchSlots, ...dinnerSlots],
    batchCookNote,
  };
}

export function findSwapCandidates(
  mealType: MealType,
  excludeRecipeIds: string[],
  restOfWeekRecipeIds: string[],
  limit = 3
): Recipe[] {
  const pool = getRecipesByMealType(mealType).filter((r) => !excludeRecipeIds.includes(r.id));
  const restSets = restOfWeekRecipeIds
    .map((id) => getRecipeById(id))
    .filter((r): r is Recipe => Boolean(r))
    .map(keyIngredients);

  const scored = pool.map((r) => {
    const set = keyIngredients(r);
    const score = restSets.length > 0 ? Math.max(...restSets.map((s) => overlapScore(s, set))) : 0;
    return { recipe: r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.recipe);
}
