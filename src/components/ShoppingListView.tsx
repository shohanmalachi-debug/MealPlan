import type { ShoppingList } from "@/lib/types";

function formatQty(quantity: number, unit: string) {
  return `${quantity}${unit === "unit" ? "" : ` ${unit}`}`;
}

export default function ShoppingListView({ list }: { list: ShoppingList }) {
  const grouped = list.toBuy.reduce<Record<string, typeof list.toBuy>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold">Shopping list</h3>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mt-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            {category}
          </h4>
          <ul className="mt-1 divide-y divide-stone-100">
            {items.map((item) => (
              <li key={item.name} className="flex justify-between py-1.5 text-sm">
                <span className="capitalize">{item.name}</span>
                <span className="text-stone-500">{formatQty(item.quantity, item.unit)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {list.likelyHave.length > 0 && (
        <div className="mt-5 rounded-lg bg-stone-50 p-3">
          <h4 className="text-sm font-semibold text-stone-600">Likely already have</h4>
          <p className="text-xs text-stone-400">Small amounts needed — check before buying.</p>
          <ul className="mt-1 space-y-1">
            {list.likelyHave.map((item) => (
              <li key={item.name} className="flex justify-between text-sm">
                <span className="capitalize">{item.name}</span>
                <span className="text-stone-500">{formatQty(item.quantity, item.unit)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {list.pantryNote.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Pantry check:</strong> this week's recipes use{" "}
          {list.pantryNote.join(", ")} — make sure you're stocked up.
        </div>
      )}
    </div>
  );
}
