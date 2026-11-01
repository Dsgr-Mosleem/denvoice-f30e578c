import { describe, it, expect } from "vitest";
import { nextNumber, lineTotal, waPhone, waMessage } from "./invoice";

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
  it("includes payment accounts and holder name in WA summary", () => {
    const msg = waMessage({
      id: "1", number: "INV-0001", clientName: "Rina", clientPhone: "08123", clientAddress: "",
      date: "2026-11-01", dueDate: "", items: [{ id: "a", name: "Poster", qty: 1, price: 50000, discount: 0 }],
      notes: "", status: "belum",
    });
    expect(msg).toContain("BANK BSI: 7349037054");
    expect(msg).toContain("DANA: +62 851-5076-9286");
    expect(msg).toContain("a.n. ILYAS ARRIBATH");
  });
});
