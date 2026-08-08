import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MealPlan — Family Weekly Meal Planner",
  description: "Weekly meal plans and shopping lists for the family.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-stone-800">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-brand-600">
              MealPlan
            </a>
            <a
              href="/plan/new"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Plan a new week
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
