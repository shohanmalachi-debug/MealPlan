"use client";

import { useCallback, useEffect, useState } from "react";
import type { Recipe, ShoppingList, WeeklyPlan } from "@/lib/types";
import MealCard from "@/components/MealCard";
import ShoppingListView from "@/components/ShoppingListView";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PlanView({ weekId }: { weekId: string }) {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);

  const load = useCallback(async () => {
    const planRes = await fetch(`/api/plan/${weekId}`).then((r) => r.json());
    setPlan(planRes.plan);
    setRecipes(planRes.recipes);

    const listRes = await fetch(`/api/shopping-list?weekId=${weekId}`).then((r) => r.json());
    setShoppingList(listRes);
  }, [weekId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!plan) return <p className="text-stone-400">Loading week…</p>;

  const sortedSlots = [...plan.slots].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Week of {plan.startDate}</h1>
        <p className="text-sm text-stone-500">
          {plan.counts.breakfast} breakfasts · {plan.counts.lunch} lunches · {plan.counts.dinner}{" "}
          dinners
        </p>
        {plan.batchCookNote && (
          <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            {plan.batchCookNote}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {sortedSlots.map((slot) => {
          const recipe = recipes[slot.recipeId];
          if (!recipe) return null;
          return (
            <MealCard
              key={`${slot.day}-${slot.mealType}`}
              slot={slot}
              recipe={recipe}
              weekId={weekId}
              onSwapped={load}
            />
          );
        })}
      </div>

      {shoppingList && <ShoppingListView list={shoppingList} />}
    </div>
  );
}
