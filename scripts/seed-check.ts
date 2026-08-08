import { loadAllRecipes } from "../src/lib/recipes";

const recipes = loadAllRecipes();

const ids = new Set<string>();
let errors = 0;

for (const r of recipes) {
  if (ids.has(r.id)) {
    console.error(`Duplicate recipe id: ${r.id}`);
    errors++;
  }
  ids.add(r.id);

  if (r.activeMinutes > r.totalMinutes) {
    console.error(`${r.id}: activeMinutes (${r.activeMinutes}) exceeds totalMinutes (${r.totalMinutes})`);
    errors++;
  }
  if (r.mealType.includes("dinner") && (r.totalMinutes < 20 || r.totalMinutes > 45)) {
    console.error(`${r.id}: totalMinutes ${r.totalMinutes} is outside the 20-45 min range for a dinner`);
    errors++;
  }
  if (r.spiceLevel > 0 && !r.kaiAdjustment) {
    console.error(`${r.id}: spicy recipe missing kaiAdjustment note`);
    errors++;
  }
}

const counts = { breakfast: 0, lunch: 0, dinner: 0 };
for (const r of recipes) {
  for (const mt of r.mealType) counts[mt]++;
}

console.log(`Validated ${recipes.length} recipes.`);
console.log(`By meal type: breakfast=${counts.breakfast} lunch=${counts.lunch} dinner=${counts.dinner}`);

if (errors > 0) {
  console.error(`${errors} validation error(s) found.`);
  process.exit(1);
}
console.log("All recipes valid.");
