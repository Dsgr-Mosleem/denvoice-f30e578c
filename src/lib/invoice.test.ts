import { describe, it, expect } from "vitest";
import { nextNumber, lineTotal, waPhone } from "./invoice";

describe("invoice rules", () => {
  it("numbers sequentially", () => {
    expect(nextNumber([])).toBe("INV-0001");
    expect(nextNumber([{ number: "INV-0001" }, { number: "INV-0002" }])).toBe("INV-0003");
  });
  it("applies discount %", () => {
    expect(lineTotal({ id: "1", name: "x", qty: 2, price: 50000, discount: 10 })).toBe(90000);
  });
  it("converts local phone to WA format", () => {
    expect(waPhone("0899-3966-234")).toBe("628993966234");
  });
});
