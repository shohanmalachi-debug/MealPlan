"use client";

import { useEffect, useState } from "react";
import type { PlanSlot, Recipe } from "@/lib/types";
import { getDifficulty } from "@/lib/difficulty";
import DifficultyBadge from "./DifficultyBadge";
import RatingStars from "./RatingStars";
import SwapMealDialog from "./SwapMealDialog";

const SPICE_LABELS = ["No spice", "Mild", "Medium spice", "Hot"];

export default function MealCard({
  slot,
  recipe,
  weekId,
  onSwapped,
}: {
  slot: PlanSlot;
  recipe: Recipe;
  weekId: string;
  onSwapped: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const difficulty = getDifficulty(recipe);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/image/${recipe.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setImageUrl(data.url ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [recipe.id]);

  async function rate(rating: number) {
    await fetch("/api/rate-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekId, day: slot.day, mealType: slot.mealType, rating }),
    });
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={recipe.name}
            className="h-40 w-full sm:h-auto sm:w-40 object-cover"
          />
        )}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              {slot.day} · {slot.mealType}
            </span>
            <DifficultyBadge label={difficulty.label} />
          </div>
          <h3 className="mt-1 text-lg font-bold">{recipe.name}</h3>
          <p className="text-sm text-stone-500">
            {recipe.activeMinutes} min active · {recipe.totalMinutes} min total ·{" "}
            {SPICE_LABELS[recipe.spiceLevel]}
          </p>
          {recipe.spiceLevel > 0 && (
            <p className="mt-2 text-sm text-brand-700 bg-brand-50 rounded-md px-2 py-1">
              For Kai: {recipe.kaiAdjustment}
            </p>
          )}
          {slot.swappedFrom && (
            <p className="mt-1 text-xs text-stone-400">Swapped from a previous suggestion</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <RatingStars initialRating={slot.rating} onRate={rate} />
            <div className="flex items-center gap-4">
              <button
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
                onClick={() => setRecipeOpen((v) => !v)}
              >
                {recipeOpen ? "Hide recipe" : "View recipe"}
              </button>
              <button
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
                onClick={() => setSwapOpen(true)}
              >
                Swap
              </button>
            </div>
          </div>

          {recipeOpen && (
            <div className="mt-4 border-t border-stone-100 pt-4">
              <h4 className="text-sm font-semibold text-stone-700">
                Ingredients (serves {recipe.servings})
              </h4>
              <ul className="mt-1 space-y-0.5 text-sm text-stone-600">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.name}>
                    {ing.quantity}
                    {ing.unit === "unit" ? "" : ` ${ing.unit}`} {ing.name}
                  </li>
                ))}
              </ul>

              <h4 className="mt-4 text-sm font-semibold text-stone-700">Steps</h4>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-stone-600">
                {recipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
      {swapOpen && (
        <SwapMealDialog
          weekId={weekId}
          slot={slot}
          onClose={() => setSwapOpen(false)}
          onSwapped={() => {
            setSwapOpen(false);
            onSwapped();
          }}
        />
      )}
    </div>
  );
}
