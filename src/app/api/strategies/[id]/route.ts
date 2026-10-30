import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { strategySchema } from "@/lib/validators";

export async function GET(
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
      include: {
        instrument: true,
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(strategy);
  } catch (error: any) {
    console.error("Error fetching strategy:", error);
    return NextResponse.json(
      { error: "Failed to fetch strategy" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = strategySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

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

    const newName = parsed.data.name.trim();

    // Check duplicate name for same instrument and user (excluding this strategy)
    const duplicate = await prisma.strategy.findFirst({
      where: {
        userId: session.id,
        instrumentId: strategy.instrumentId,
        id: { not: strategy.id },
        name: {
          equals: newName,
          mode: "insensitive",
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: `A strategy named "${newName}" already exists for this instrument.` },
        { status: 409 }
      );
    }

    const updated = await prisma.strategy.update({
      where: { id: strategy.id },
      data: { name: newName },
      include: { instrument: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating strategy:", error);
    return NextResponse.json(
      { error: "Failed to update strategy" },
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

    await prisma.strategy.delete({
      where: { id: strategy.id },
    });

    return NextResponse.json({ success: true, message: "Strategy deleted" });
  } catch (error: any) {
    console.error("Error deleting strategy:", error);
    return NextResponse.json(
      { error: "Failed to delete strategy" },
      { status: 500 }
    );
  }
}
