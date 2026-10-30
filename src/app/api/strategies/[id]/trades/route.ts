import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { tradeSchema } from "@/lib/validators";
import { format } from "date-fns";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const month = searchParams.get("month"); // YYYY-MM

  try {
    const strategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        userId: session.id,
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    const whereClause: any = {
      strategyId: strategy.id,
      userId: session.id,
    };

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, m] = month.split("-").map(Number);
      const start = new Date(Date.UTC(year, m - 1, 1));
      const end = new Date(Date.UTC(year, m, 0, 23, 59, 59));
      whereClause.tradeDate = {
        gte: start,
        lte: end,
      };
    } else if (from && to) {
      whereClause.tradeDate = {
        gte: new Date(from + "T00:00:00Z"),
        lte: new Date(to + "T23:59:59Z"),
      };
    }

    const trades = await prisma.trade.findMany({
      where: whereClause,
      orderBy: [
        { tradeDate: "desc" },
        { tradeTime: "asc" },
      ],
    });

    const formatted = trades.map((t) => ({
      id: t.id,
      strategyId: t.strategyId,
      tradeDate: format(t.tradeDate, "yyyy-MM-dd"),
      tradeTime: t.tradeTime,
      type: t.type,
      value: t.value,
      createdAt: t.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const strategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        userId: session.id,
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = tradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid trade input" },
        { status: 400 }
      );
    }

    const { tradeDate, tradeTime, type, value } = parsed.data;

    // Use UTC date representation to avoid off-by-one timezone shifting
    const dateObj = new Date(tradeDate + "T00:00:00.000Z");

    const newTrade = await prisma.trade.create({
      data: {
        userId: session.id,
        strategyId: strategy.id,
        tradeDate: dateObj,
        tradeTime,
        type,
        value,
      },
    });

    return NextResponse.json(
      {
        id: newTrade.id,
        strategyId: newTrade.strategyId,
        tradeDate: format(newTrade.tradeDate, "yyyy-MM-dd"),
        tradeTime: newTrade.tradeTime,
        type: newTrade.type,
        value: newTrade.value,
        createdAt: newTrade.createdAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating trade:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}
