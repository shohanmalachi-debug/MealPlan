"use client";

import { useEffect, useState } from "react";
import type { PlanSlot, Recipe } from "@/lib/types";

export default function SwapMealDialog({
  weekId,
  slot,
  onClose,
  onSwapped,
}: {
  weekId: string;
  slot: PlanSlot;
  onClose: () => void;
  onSwapped: () => void;
}) {
  const [candidates, setCandidates] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/swap-meal?weekId=${weekId}&day=${slot.day}&mealType=${slot.mealType}`)
      .then((r) => r.json())
      .then((data) => setCandidates(data.candidates ?? []));
  }, [weekId, slot.day, slot.mealType]);

  async function chooseCandidate(recipeId: string) {
    setLoading(true);
    await fetch("/api/swap-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekId, day: slot.day, mealType: slot.mealType, newRecipeId: recipeId }),
    });
    setLoading(false);
    onSwapped();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold">Swap this {slot.mealType}</h4>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-stone-500">Pick an alternative for {slot.day}:</p>
        <div className="mt-3 space-y-2">
          {candidates === null && <p className="text-sm text-stone-400">Loading options…</p>}
          {candidates?.length === 0 && (
            <p className="text-sm text-stone-400">No alternatives available.</p>
          )}
          {candidates?.map((c) => (
            <button
              key={c.id}
              disabled={loading}
              onClick={() => chooseCandidate(c.id)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-left hover:border-brand-500 hover:bg-brand-50 disabled:opacity-50"
            >
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-stone-500">
                {c.activeMinutes} min active · {c.totalMinutes} min total · {c.cuisine}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
