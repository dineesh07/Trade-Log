import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMonthRange } from "@/lib/dates";
import { calculateOutcome } from "@/lib/outcome";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const instruments = await prisma.instrument.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        strategies: {
          where: { userId: session.id },
          select: { id: true },
        },
      },
    });

    // Get this month's trades for user to calculate this month's net for each instrument
    const { startStr, endStr } = getMonthRange();
    const monthTrades = await prisma.trade.findMany({
      where: {
        userId: session.id,
        tradeDate: {
          gte: new Date(startStr + "T00:00:00Z"),
          lte: new Date(endStr + "T23:59:59Z"),
        },
      },
      select: {
        strategyId: true,
        type: true,
        value: true,
      },
    });

    // Map strategyId to instrument
    const strategyToInstrument = new Map<string, string>();
    for (const inst of instruments) {
      for (const strat of inst.strategies) {
        strategyToInstrument.set(strat.id, inst.id);
      }
    }

    const instrumentTrades = new Map<string, Array<{ type: "SL" | "TP"; value: number }>>();
    for (const trade of monthTrades) {
      const instId = strategyToInstrument.get(trade.strategyId);
      if (instId) {
        const list = instrumentTrades.get(instId) || [];
        list.push({ type: trade.type as "SL" | "TP", value: trade.value });
        instrumentTrades.set(instId, list);
      }
    }

    const result = instruments.map((inst) => {
      const trades = instrumentTrades.get(inst.id) || [];
      const monthOutcome = calculateOutcome(trades);
      return {
        id: inst.id,
        market: inst.market,
        symbol: inst.symbol,
        displayName: inst.displayName,
        sortOrder: inst.sortOrder,
        strategyCount: inst.strategies.length,
        monthOutcome,
      };
    });

    const forex = result.filter((i) => i.market === "FOREX");
    const indian = result.filter((i) => i.market === "INDIAN");

    return NextResponse.json({
      all: result,
      forex,
      indian,
    });
  } catch (error: any) {
    console.error("Error fetching instruments:", error);
    return NextResponse.json(
      { error: "Failed to fetch instruments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const market = body.market?.toUpperCase();
    const rawSymbol = body.symbol?.trim().toUpperCase();
    const displayName = body.displayName?.trim();

    if (!market || (market !== "FOREX" && market !== "INDIAN")) {
      return NextResponse.json(
        { error: "Market must be FOREX or INDIAN" },
        { status: 400 }
      );
    }

    if (!rawSymbol || rawSymbol.length < 2 || rawSymbol.length > 20) {
      return NextResponse.json(
        { error: "Symbol must be between 2 and 20 characters" },
        { status: 400 }
      );
    }

    if (!displayName || displayName.length < 2 || displayName.length > 50) {
      return NextResponse.json(
        { error: "Display name must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    // Check if symbol already exists
    const existing = await prisma.instrument.findUnique({
      where: { symbol: rawSymbol },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Instrument with symbol ${rawSymbol} already exists` },
        { status: 400 }
      );
    }

    // Get max sort order for this market
    const maxOrder = await prisma.instrument.findFirst({
      where: { market },
      orderBy: { sortOrder: "desc" },
    });
    const nextOrder = (maxOrder?.sortOrder || 0) + 1;

    const created = await prisma.instrument.create({
      data: {
        market,
        symbol: rawSymbol,
        displayName,
        sortOrder: nextOrder,
      },
    });

    return NextResponse.json({
      success: true,
      instrument: created,
    });
  } catch (err: any) {
    console.error("Error creating instrument:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create instrument" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const id = searchParams.get("id");

  if (!symbol && !id) {
    return NextResponse.json(
      { error: "Symbol or ID parameter is required" },
      { status: 400 }
    );
  }

  try {
    const instrument = await prisma.instrument.findFirst({
      where: {
        OR: [
          ...(symbol ? [{ symbol: { equals: symbol, mode: "insensitive" as const } }] : []),
          ...(id ? [{ id }] : []),
        ],
      },
      include: {
        strategies: {
          select: { id: true },
        },
      },
    });

    if (!instrument) {
      return NextResponse.json(
        { error: "Instrument not found" },
        { status: 404 }
      );
    }

    const strategyIds = instrument.strategies.map((s) => s.id);

    await prisma.$transaction(async (tx) => {
      if (strategyIds.length > 0) {
        await tx.trade.deleteMany({
          where: { strategyId: { in: strategyIds } },
        });
        await tx.strategy.deleteMany({
          where: { id: { in: strategyIds } },
        });
      }
      await tx.instrument.delete({
        where: { id: instrument.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Instrument "${instrument.symbol}" and associated records deleted.`,
    });
  } catch (err: any) {
    console.error("Error deleting instrument:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete instrument" },
      { status: 500 }
    );
  }
}


