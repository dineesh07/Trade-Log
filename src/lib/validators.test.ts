import { describe, it, expect } from "vitest";
import { tradeSchema } from "./validators";

describe("tradeSchema validation", () => {
  it("accepts valid integer value", () => {
    const result = tradeSchema.safeParse({
      tradeDate: "2026-10-31",
      tradeTime: "14:30",
      type: "TP",
      value: 60,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(60);
    }
  });

  it("accepts valid float / decimal value", () => {
    const result = tradeSchema.safeParse({
      tradeDate: "2026-10-31",
      tradeTime: "14:30",
      type: "TP",
      value: 1.5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(1.5);
    }
  });

  it("coerces string float to number", () => {
    const result = tradeSchema.safeParse({
      tradeDate: "2026-10-31",
      tradeTime: "14:30",
      type: "SL",
      value: "2.75",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(2.75);
    }
  });

  it("rejects 0 or negative numbers", () => {
    const zeroResult = tradeSchema.safeParse({
      tradeDate: "2026-10-31",
      tradeTime: "14:30",
      type: "TP",
      value: 0,
    });
    expect(zeroResult.success).toBe(false);

    const negativeResult = tradeSchema.safeParse({
      tradeDate: "2026-10-31",
      tradeTime: "14:30",
      type: "TP",
      value: -1.5,
    });
    expect(negativeResult.success).toBe(false);
  });
});

