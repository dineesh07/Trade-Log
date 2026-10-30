import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { getWeekRange, getMonthRange, getLast3MonthsRange } from "@/lib/dates";
import { computeStrategyStats, TradeRecord } from "@/lib/stats";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "month"; // week | month | 3months | all
  const monthParam = searchParams.get("month"); // YYYY-MM for calendar or month filter

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

    // Always fetch current week and current month ranges for the fixed summary cards
    const currentWeekRange = getWeekRange();
    const currentMonthRange = getMonthRange();

    const [weekTradesRaw, monthTradesRaw] = await Promise.all([
      prisma.trade.findMany({
        where: {
          strategyId: strategy.id,
          userId: session.id,
          tradeDate: {
            gte: new Date(currentWeekRange.startStr + "T00:00:00Z"),
            lte: new Date(currentWeekRange.endStr + "T23:59:59Z"),
          },
        },
      }),
      prisma.trade.findMany({
        where: {
          strategyId: strategy.id,
          userId: session.id,
          tradeDate: {
            gte: new Date(currentMonthRange.startStr + "T00:00:00Z"),
            lte: new Date(currentMonthRange.endStr + "T23:59:59Z"),
          },
        },
      }),
    ]);

    // Format week and month trades
    const weekTrades: TradeRecord[] = weekTradesRaw.map((t) => ({
      id: t.id,
      strategyId: t.strategyId,
      tradeDate: format(t.tradeDate, "yyyy-MM-dd"),
      tradeTime: t.tradeTime,
      type: t.type,
      value: t.value,
    }));

    const monthTrades: TradeRecord[] = monthTradesRaw.map((t) => ({
      id: t.id,
      strategyId: t.strategyId,
      tradeDate: format(t.tradeDate, "yyyy-MM-dd"),
      tradeTime: t.tradeTime,
      type: t.type,
      value: t.value,
    }));

    // Determine range filter for charts & days
    const rangeWhere: any = {
      strategyId: strategy.id,
      userId: session.id,
    };

    if (range === "week") {
      rangeWhere.tradeDate = {
        gte: new Date(currentWeekRange.startStr + "T00:00:00Z"),
        lte: new Date(currentWeekRange.endStr + "T23:59:59Z"),
      };
    } else if (range === "month") {
      if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
        const [y, m] = monthParam.split("-").map(Number);
        const start = new Date(Date.UTC(y, m - 1, 1));
        const end = new Date(Date.UTC(y, m, 0, 23, 59, 59));
        rangeWhere.tradeDate = { gte: start, lte: end };
      } else {
        rangeWhere.tradeDate = {
          gte: new Date(currentMonthRange.startStr + "T00:00:00Z"),
          lte: new Date(currentMonthRange.endStr + "T23:59:59Z"),
        };
      }
    } else if (range === "3months") {
      const threeMonths = getLast3MonthsRange();
      rangeWhere.tradeDate = {
        gte: new Date(threeMonths.startStr + "T00:00:00Z"),
        lte: new Date(threeMonths.endStr + "T23:59:59Z"),
      };
    } else if (range === "custom") {
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      if (startDate && endDate) {
        rangeWhere.tradeDate = {
          gte: new Date(startDate + "T00:00:00Z"),
          lte: new Date(endDate + "T23:59:59Z"),
        };
      } else if (startDate) {
        rangeWhere.tradeDate = {
          gte: new Date(startDate + "T00:00:00Z"),
        };
      } else if (endDate) {
        rangeWhere.tradeDate = {
          lte: new Date(endDate + "T23:59:59Z"),
        };
      }
    }
    // "all" doesn't filter tradeDate

    const rangeTradesRaw = await prisma.trade.findMany({
      where: rangeWhere,
      orderBy: [
        { tradeDate: "asc" },
        { tradeTime: "asc" },
      ],
    });

    const rangeTrades: TradeRecord[] = rangeTradesRaw.map((t) => ({
      id: t.id,
      strategyId: t.strategyId,
      tradeDate: format(t.tradeDate, "yyyy-MM-dd"),
      tradeTime: t.tradeTime,
      type: t.type,
      value: t.value,
    }));

    // If monthParam is provided and differs from rangeTrades, we also fetch calendar month trades
    let calendarMonthTrades = rangeTrades;
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam) && range !== "month") {
      const [y, m] = monthParam.split("-").map(Number);
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end = new Date(Date.UTC(y, m, 0, 23, 59, 59));
      const calTradesRaw = await prisma.trade.findMany({
        where: {
          strategyId: strategy.id,
          userId: session.id,
          tradeDate: { gte: start, lte: end },
        },
        orderBy: [{ tradeDate: "asc" }, { tradeTime: "asc" }],
      });
      calendarMonthTrades = calTradesRaw.map((t) => ({
        id: t.id,
        strategyId: t.strategyId,
        tradeDate: format(t.tradeDate, "yyyy-MM-dd"),
        tradeTime: t.tradeTime,
        type: t.type,
        value: t.value,
      }));
    }

    const stats = computeStrategyStats(rangeTrades, weekTrades, monthTrades);

    // Compute calendarDays for the active calendar month
    const calStats = computeStrategyStats(calendarMonthTrades, weekTrades, monthTrades);

    return NextResponse.json({
      ...stats,
      calendarDays: calStats.days,
    });
  } catch (error: any) {
    console.error("Error computing strategy stats:", error);
    return NextResponse.json(
      { error: "Failed to compute stats" },
      { status: 500 }
    );
  }
}
