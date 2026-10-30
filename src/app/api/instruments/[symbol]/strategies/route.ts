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

    const monthStartDate = new Date(startStr + "T00:00:00Z");
    const monthEndDate = new Date(endStr + "T23:59:59Z");

    const result = strategies.map((strat) => {
      const monthTrades = strat.trades.filter((t) => {
        const d = new Date(t.tradeDate);
        return d >= monthStartDate && d <= monthEndDate;
      });

      const monthOutcome = calculateOutcome(
        monthTrades.map((t) => ({ type: t.type as "SL" | "TP", value: t.value }))
      );

      return {
        id: strat.id,
        name: strat.name,
        instrumentId: strat.instrumentId,
        instrumentSymbol: instrument.symbol,
        instrumentName: instrument.displayName,
        totalTradeCount: strat.trades.length,
        monthOutcome,
        createdAt: strat.createdAt,
      };
    });

    return NextResponse.json({
      instrument: {
        id: instrument.id,
        symbol: instrument.symbol,
        displayName: instrument.displayName,
        market: instrument.market,
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
