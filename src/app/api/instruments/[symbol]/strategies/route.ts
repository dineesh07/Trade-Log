import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMonthRange } from "@/lib/dates";
import { calculateOutcome } from "@/lib/outcome";

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbol = params.symbol.toUpperCase();

  try {
    const instrument = await prisma.instrument.findUnique({
      where: { symbol },
    });

    if (!instrument) {
      return NextResponse.json(
        { error: "Instrument not found" },
        { status: 404 }
      );
    }

    const { startStr, endStr } = getMonthRange();

    const strategies = await prisma.strategy.findMany({
      where: {
        userId: session.id,
        instrumentId: instrument.id,
      },
      include: {
        trades: {
          select: {
            id: true,
            tradeDate: true,
            type: true,
            value: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let instrumentTpValue = 0;
    let instrumentTpCount = 0;
    let instrumentSlValue = 0;
    let instrumentSlCount = 0;
    let instrumentTotalTrades = 0;

    const result = strategies.map((strat) => {
      let tpValue = 0;
      let tpCount = 0;
      let slValue = 0;
      let slCount = 0;

      for (const t of strat.trades) {
        if (t.type === "TP") {
          tpCount++;
          tpValue += t.value;
          instrumentTpCount++;
          instrumentTpValue += t.value;
        } else if (t.type === "SL") {
          slCount++;
          slValue += t.value;
          instrumentSlCount++;
          instrumentSlValue += t.value;
        }
      }

      instrumentTotalTrades += strat.trades.length;

      return {
        id: strat.id,
        name: strat.name,
        instrumentId: strat.instrumentId,
        instrumentSymbol: instrument.symbol,
        instrumentName: instrument.displayName,
        totalTradeCount: strat.trades.length,
        tpValue,
        tpCount,
        slValue,
        slCount,
        createdAt: strat.createdAt,
      };
    });

    return NextResponse.json({
      instrument: {
        id: instrument.id,
        symbol: instrument.symbol,
        displayName: instrument.displayName,
        market: instrument.market,
        tpValue: instrumentTpValue,
        tpCount: instrumentTpCount,
        slValue: instrumentSlValue,
        slCount: instrumentSlCount,
        totalTrades: instrumentTotalTrades,
      },
      strategies: result,
    });
  } catch (error: any) {
    console.error("Error fetching strategies for instrument:", error);
    return NextResponse.json(
      { error: "Failed to fetch strategies" },
      { status: 500 }
    );
  }
}
