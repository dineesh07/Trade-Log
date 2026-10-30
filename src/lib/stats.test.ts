import { describe, it, expect } from "vitest";
import { computeStrategyStats, TradeRecord } from "./stats";

describe("computeStrategyStats", () => {
  it("computes correct stats for sample trades", () => {
    const day1Trades: TradeRecord[] = [
      { id: "1", strategyId: "s1", tradeDate: "2026-10-27", tradeTime: "12:25", type: "SL", value: 20 },
      { id: "2", strategyId: "s1", tradeDate: "2026-10-27", tradeTime: "13:12", type: "TP", value: 60 },
      { id: "3", strategyId: "s1", tradeDate: "2026-10-27", tradeTime: "15:56", type: "SL", value: 68 },
      { id: "4", strategyId: "s1", tradeDate: "2026-10-27", tradeTime: "21:08", type: "TP", value: 100 },
    ];

    const stats = computeStrategyStats(day1Trades, day1Trades, day1Trades);

    expect(stats.week.net).toBe(72);
    expect(stats.week.outcome).toBe("TP");
    expect(stats.month.net).toBe(72);
    expect(stats.days.length).toBe(1);
    expect(stats.days[0].date).toBe("2026-10-27");
    expect(stats.days[0].net).toBe(72);
    expect(stats.days[0].outcome).toBe("TP");
    expect(stats.cumulative).toEqual([
      { date: "2026-10-27", daily: 72, cumulative: 72 },
    ]);
    expect(stats.counts.tp).toBe(2);
    expect(stats.counts.sl).toBe(2);
    expect(stats.counts.winRate).toBe(50);
    expect(stats.bestDay).toEqual({ date: "2026-10-27", net: 72 });
    expect(stats.worstDay).toEqual({ date: "2026-10-27", net: 72 });
  });

  it("handles multi-day trades and cumulative sum correctly", () => {
    const trades: TradeRecord[] = [
      { id: "1", strategyId: "s1", tradeDate: "2026-10-25", tradeTime: "10:00", type: "TP", value: 50 },
      { id: "2", strategyId: "s1", tradeDate: "2026-10-26", tradeTime: "11:00", type: "SL", value: 20 },
      { id: "3", strategyId: "s1", tradeDate: "2026-10-27", tradeTime: "12:00", type: "TP", value: 30 },
    ];

    const stats = computeStrategyStats(trades, trades, trades);
    expect(stats.days.length).toBe(3);
    expect(stats.cumulative).toEqual([
      { date: "2026-10-25", daily: 50, cumulative: 50 },
      { date: "2026-10-26", daily: -20, cumulative: 30 },
      { date: "2026-10-27", daily: 30, cumulative: 60 },
    ]);
    expect(stats.counts.winRate).toBe(66.7);
    expect(stats.bestDay).toEqual({ date: "2026-10-25", net: 50 });
    expect(stats.worstDay).toEqual({ date: "2026-10-26", net: -20 });
  });
});
