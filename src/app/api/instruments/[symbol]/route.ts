import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { symbol: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawSymbol = params?.symbol;
  if (!rawSymbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    // Find the instrument (case-insensitive lookup)
    const instrument = await prisma.instrument.findFirst({
      where: {
        symbol: {
          equals: rawSymbol,
          mode: "insensitive",
        },
      },
      include: {
        strategies: {
          select: { id: true },
        },
      },
    });

    if (!instrument) {
      return NextResponse.json(
        { error: `Instrument "${rawSymbol}" not found` },
        { status: 404 }
      );
    }

    const strategyIds = instrument.strategies.map((s) => s.id);

    // Delete all related trades, strategies, and the instrument atomically
    await prisma.$transaction(async (tx) => {
      if (strategyIds.length > 0) {
        // 1. Delete all trades belonging to this instrument's strategies
        await tx.trade.deleteMany({
          where: {
            strategyId: { in: strategyIds },
          },
        });

        // 2. Delete all strategies belonging to this instrument
        await tx.strategy.deleteMany({
          where: {
            id: { in: strategyIds },
          },
        });
      }

      // 3. Delete the instrument itself
      await tx.instrument.delete({
        where: {
          id: instrument.id,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Instrument "${instrument.symbol}" and all associated records were deleted.`,
    });
  } catch (error: any) {
    console.error("Error deleting instrument:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete instrument" },
      { status: 500 }
    );
  }
}
