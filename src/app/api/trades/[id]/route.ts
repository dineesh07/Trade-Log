import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { tradeUpdateSchema } from "@/lib/validators";
import { format } from "date-fns";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const trade = await prisma.trade.findFirst({
      where: {
        id: params.id,
        userId: session.id,
      },
    });

    if (!trade) {
      return NextResponse.json(
        { error: "Trade not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = tradeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (parsed.data.tradeDate) {
      updateData.tradeDate = new Date(parsed.data.tradeDate + "T00:00:00.000Z");
    }
    if (parsed.data.tradeTime) {
      updateData.tradeTime = parsed.data.tradeTime;
    }
    if (parsed.data.type) {
      updateData.type = parsed.data.type;
    }
    if (parsed.data.value !== undefined) {
      updateData.value = parsed.data.value;
    }

    const updated = await prisma.trade.update({
      where: { id: trade.id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      strategyId: updated.strategyId,
      tradeDate: format(updated.tradeDate, "yyyy-MM-dd"),
      tradeTime: updated.tradeTime,
      type: updated.type,
      value: updated.value,
      createdAt: updated.createdAt,
    });
  } catch (error: any) {
    console.error("Error updating trade:", error);
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const trade = await prisma.trade.findFirst({
      where: {
        id: params.id,
        userId: session.id,
      },
    });

    if (!trade) {
      return NextResponse.json(
        { error: "Trade not found" },
        { status: 404 }
      );
    }

    await prisma.trade.delete({
      where: { id: trade.id },
    });

    return NextResponse.json({ success: true, message: "Trade deleted" });
  } catch (error: any) {
    console.error("Error deleting trade:", error);
    return NextResponse.json(
      { error: "Failed to delete trade" },
      { status: 500 }
    );
  }
}
