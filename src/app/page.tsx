import { getLatestPlanId } from "@/lib/planStore";
import Link from "next/link";

export default function DashboardPage() {
  const latestPlanId = getLatestPlanId();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-500">
          Family meal plans with Asian and Sri Lankan flavours, tailored for Sho, Shani and Kai.
        </p>

        {latestPlanId ? (
          <Link
            href={`/plan/${latestPlanId}`}
            className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            View this week's plan
          </Link>
        ) : (
          <Link
            href="/plan/new"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Plan your first week
          </Link>
        )}
      </div>
    </div>
  );
}
