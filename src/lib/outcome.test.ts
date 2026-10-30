import { describe, it, expect } from "vitest";
import { calculateOutcome, TradeLike } from "./outcome";

describe("calculateOutcome", () => {
  it("passes the worked example from section 4.3 (27.10.2026)", () => {
    const sampleTrades: TradeLike[] = [
      { type: "SL", value: 20 },
      { type: "TP", value: 60 },
      { type: "SL", value: 68 },
      { type: "TP", value: 100 },
    ];

    const result = calculateOutcome(sampleTrades);
    expect(result).toEqual({
      totalTP: 160,
      totalSL: 88,
      net: 72,
      outcome: "TP",
      value: 72,
      tradeCount: 4,
    });
  });

  it("handles empty list (no trades)", () => {
    const result = calculateOutcome([]);
    expect(result).toEqual({
      totalTP: 0,
      totalSL: 0,
      net: 0,
      outcome: "BE",
      value: 0,
      tradeCount: 0,
    });
  });

  it("handles a single TP trade", () => {
    const result = calculateOutcome([{ type: "TP", value: 50 }]);
    expect(result).toEqual({
      totalTP: 50,
      totalSL: 0,
      net: 50,
      outcome: "TP",
      value: 50,
      tradeCount: 1,
    });
  });

  it("handles a single SL trade", () => {
    const result = calculateOutcome([{ type: "SL", value: 30 }]);
    expect(result).toEqual({
      totalTP: 0,
      totalSL: 30,
      net: -30,
      outcome: "SL",
      value: 30,
      tradeCount: 1,
    });
  });

  it("handles all-TP day", () => {
    const trades: TradeLike[] = [
      { type: "TP", value: 40 },
      { type: "TP", value: 60 },
      { type: "TP", value: 25 },
    ];
    const result = calculateOutcome(trades);
    expect(result).toEqual({
      totalTP: 125,
      totalSL: 0,
      net: 125,
      outcome: "TP",
      value: 125,
      tradeCount: 3,
    });
  });

  it("handles all-SL day", () => {
    const trades: TradeLike[] = [
      { type: "SL", value: 15 },
      { type: "SL", value: 45 },
    ];
    const result = calculateOutcome(trades);
    expect(result).toEqual({
      totalTP: 0,
      totalSL: 60,
      net: -60,
      outcome: "SL",
      value: 60,
      tradeCount: 2,
    });
  });

  it("handles break-even (net == 0)", () => {
    const trades: TradeLike[] = [
      { type: "TP", value: 50 },
      { type: "SL", value: 50 },
    ];
    const result = calculateOutcome(trades);
    expect(result).toEqual({
      totalTP: 50,
      totalSL: 50,
      net: 0,
      outcome: "BE",
      value: 0,
      tradeCount: 2,
    });
  });
});
