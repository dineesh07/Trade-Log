export type TradeType = "SL" | "TP";
export type OutcomeType = "TP" | "SL" | "BE";

export interface TradeLike {
  type: TradeType;
  value: number;
}

export interface Outcome {
  totalTP: number;
  totalSL: number;
  net: number; // signed: positive = profit, negative = loss
  outcome: OutcomeType; // "TP" | "SL" | "BE"
  value: number; // absolute value of net
  tradeCount: number;
}

export function roundNumber(val: number, decimals: number = 4): number {
  return Number(Math.round(Number(val + "e" + decimals)) + "e-" + decimals);
}

export function calculateOutcome(trades: TradeLike[]): Outcome {
  let totalTP = 0;
  let totalSL = 0;
  for (const t of trades) {
    if (t.type === "TP") totalTP += t.value;
    else totalSL += t.value;
  }
  totalTP = roundNumber(totalTP);
  totalSL = roundNumber(totalSL);
  const net = roundNumber(totalTP - totalSL);
  return {
    totalTP,
    totalSL,
    net,
    outcome: net > 0 ? "TP" : net < 0 ? "SL" : "BE",
    value: roundNumber(Math.abs(net)),
    tradeCount: trades.length,
  };
}
