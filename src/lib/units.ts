import type { Unit } from "./types";

// Base units: mass -> g, volume -> ml, everything else stays as-is.
const MASS_UNITS: Unit[] = ["g", "kg"];
const VOLUME_UNITS: Unit[] = ["ml", "l", "tsp", "tbsp", "cup", "pinch"];

const TO_BASE: Partial<Record<Unit, number>> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  tsp: 5,
  tbsp: 15,
  cup: 250,
  pinch: 0.5,
};

export function unitDimension(unit: Unit): "mass" | "volume" | "count" {
  if (MASS_UNITS.includes(unit)) return "mass";
  if (VOLUME_UNITS.includes(unit)) return "volume";
  return "count";
}

export function toBaseQuantity(quantity: number, unit: Unit): number {
  return quantity * (TO_BASE[unit] ?? 1);
}

// Convert a base quantity (g or ml) back into a human friendly unit/quantity pair.
export function fromBaseQuantity(
  baseQuantity: number,
  dimension: "mass" | "volume" | "count",
  fallbackUnit: Unit
): { quantity: number; unit: Unit } {
  if (dimension === "mass") {
    if (baseQuantity >= 1000) {
      return { quantity: round(baseQuantity / 1000, 2), unit: "kg" };
    }
    return { quantity: round(baseQuantity, 0), unit: "g" };
  }
  if (dimension === "volume") {
    if (baseQuantity >= 1000) {
      return { quantity: round(baseQuantity / 1000, 2), unit: "l" };
    }
    if (baseQuantity < 45) {
      // keep small volumes in tbsp for kitchen readability
      return { quantity: round(baseQuantity / 15, 1), unit: "tbsp" };
    }
    return { quantity: round(baseQuantity, 0), unit: "ml" };
  }
  return { quantity: round(baseQuantity, 2), unit: fallbackUnit };
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
