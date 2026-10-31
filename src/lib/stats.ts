import { calculateOutcome, Outcome, TradeLike, roundNumber } from "./outcome";
import { getWeekRange, getMonthRange } from "./dates";

export interface TradeRecord extends TradeLike {
  id: string;
  strategyId: string;
  tradeDate: string; // "YYYY-MM-DD"
  tradeTime: string; // "HH:mm"
  createdAt?: Date | string;
}

export interface DayOutcome extends Outcome {
  date: string; // "YYYY-MM-DD"
}

export interface CumulativePoint {
  date: string;
  daily: number;
  cumulative: number;
}

export interface StrategyStats {
  week: Outcome;
  month: Outcome;
  days: DayOutcome[];
  calendarDays?: DayOutcome[];
  cumulative: CumulativePoint[];
  counts: {
    tp: number;
    sl: number;
    total: number;
    winRate: number;
  };
  bestDay: { date: string; net: number } | null;
  worstDay: { date: string; net: number } | null;
  tradingDaysCount: number;
}

/**
 * Groups trades by their tradeDate (YYYY-MM-DD)
 */
export function groupTradesByDate(trades: TradeRecord[]): Map<string, TradeRecord[]> {
  const map = new Map<string, TradeRecord[]>();
  for (const trade of trades) {
    const dateKey = trade.tradeDate.includes("T")
      ? trade.tradeDate.split("T")[0]
      : trade.tradeDate;
    const existing = map.get(dateKey) || [];
    existing.push(trade);
    map.set(dateKey, existing);
  }
  return map;
}

/**
 * Computes full stats for a list of trades within a given range
 * Also takes allTradesForUserStrategy or computes week/month specifically
 */
export function computeStrategyStats(
  rangeTrades: TradeRecord[],
  allTradesForCurrentWeek: TradeRecord[],
  allTradesForCurrentMonth: TradeRecord[]
): StrategyStats {
  // 1. Current Week Outcome (Monday to Sunday)
  const weekOutcome = calculateOutcome(allTradesForCurrentWeek);

  // 2. Current Month Outcome
  const monthOutcome = calculateOutcome(allTradesForCurrentMonth);

  // 3. Group rangeTrades by day
  const daysMap = groupTradesByDate(rangeTrades);
  
  // Sorted dates ascending for cumulative calculation
  const sortedDatesAsc = Array.from(daysMap.keys()).sort((a, b) => a.localeCompare(b));
  
  let running = 0;
  const cumulative: CumulativePoint[] = [];
  const days: DayOutcome[] = [];

  let bestDay: { date: string; net: number } | null = null;
  let worstDay: { date: string; net: number } | null = null;

  for (const date of sortedDatesAsc) {
    const dayTrades = daysMap.get(date) || [];
    const outcome = calculateOutcome(dayTrades);
    running = roundNumber(running + outcome.net);
    
    cumulative.push({
      date,
      daily: outcome.net,
      cumulative: running,
    });

    const dayObj: DayOutcome = {
      date,
      ...outcome,
    };
    days.push(dayObj);

    if (bestDay === null || outcome.net > bestDay.net) {
      bestDay = { date, net: outcome.net };
    }
    if (worstDay === null || outcome.net < worstDay.net) {
      worstDay = { date, net: outcome.net };
    }
  }

  // Count TP vs SL in range
  let tpCount = 0;
  let slCount = 0;
  for (const t of rangeTrades) {
    if (t.type === "TP") tpCount++;
    else if (t.type === "SL") slCount++;
  }
  const totalCount = tpCount + slCount;
  const winRate = totalCount > 0 ? Number(((tpCount / totalCount) * 100).toFixed(1)) : 0;

  return {
    week: weekOutcome,
    month: monthOutcome,
    days,
    cumulative,
    counts: {
      tp: tpCount,
      sl: slCount,
      total: totalCount,
      winRate,
    },
    bestDay,
    worstDay,
    tradingDaysCount: days.length,
  };
}
