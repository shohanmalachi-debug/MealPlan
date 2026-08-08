"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WeekSetupForm() {
  const router = useRouter();
  const [breakfast, setBreakfast] = useState(0);
  const [lunch, setLunch] = useState(0);
  const [dinner, setDinner] = useState(5);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const startDate = new Date().toISOString().slice(0, 10);
    const res = await fetch("/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, counts: { breakfast, lunch, dinner } }),
    });
    const plan = await res.json();
    setLoading(false);
    router.push(`/plan/${plan.id}`);
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Plan the upcoming week</h2>
      <p className="mt-1 text-sm text-stone-500">
        Choose how many meals to plan for. Default is 5 dinners.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <CountField label="Breakfasts" value={breakfast} onChange={setBreakfast} />
        <CountField label="Lunches" value={lunch} onChange={setLunch} />
        <CountField label="Dinners" value={dinner} onChange={setDinner} />
      </div>

      <button
        onClick={generate}
        disabled={loading || breakfast + lunch + dinner === 0}
        className="mt-6 w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate this week's plan"}
      </button>
    </div>
  );
}

function CountField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col items-center gap-1">
      <span className="text-sm font-medium text-stone-600">{label}</span>
      <input
        type="number"
        min={0}
        max={7}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(7, Number(e.target.value))))}
        className="w-20 rounded-lg border border-stone-300 px-3 py-2 text-center"
      />
    </label>
  );
}
