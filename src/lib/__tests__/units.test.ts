import { describe, expect, it } from "vitest";
import { fromBaseQuantity, toBaseQuantity, unitDimension } from "../units";

describe("units", () => {
  it("round-trips tbsp -> ml -> tbsp", () => {
    const base = toBaseQuantity(4, "tbsp"); // 60ml
    const { quantity, unit } = fromBaseQuantity(base, "volume", "tbsp");
    expect(unit).toBe("ml");
    expect(quantity).toBe(60);
  });

  it("round-trips g <-> kg boundary", () => {
    const base = toBaseQuantity(1500, "g");
    const { quantity, unit } = fromBaseQuantity(base, "mass", "g");
    expect(unit).toBe("kg");
    expect(quantity).toBe(1.5);
  });

  it("classifies dimensions correctly", () => {
    expect(unitDimension("g")).toBe("mass");
    expect(unitDimension("ml")).toBe("volume");
    expect(unitDimension("unit")).toBe("count");
    expect(unitDimension("clove")).toBe("count");
  });
});
