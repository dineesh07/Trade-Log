import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { strategySchema } from "@/lib/validators";
import { z } from "zod";

const createStrategyBodySchema = z.object({
  instrumentSymbol: z.string().min(1, "Instrument symbol is required"),
  name: strategySchema.shape.name,
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createStrategyBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { instrumentSymbol, name } = parsed.data;

    const instrument = await prisma.instrument.findUnique({
      where: { symbol: instrumentSymbol.toUpperCase() },
    });

    if (!instrument) {
      return NextResponse.json(
        { error: "Instrument not found" },
        { status: 404 }
      );
    }

    // Case-insensitive duplicate check for this user and instrument
    const existing = await prisma.strategy.findFirst({
      where: {
        userId: session.id,
        instrumentId: instrument.id,
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A strategy named "${name.trim()}" already exists for this instrument.` },
        { status: 409 }
      );
    }

    const newStrategy = await prisma.strategy.create({
      data: {
        userId: session.id,
        instrumentId: instrument.id,
        name: name.trim(),
      },
      include: {
        instrument: true,
      },
    });

    return NextResponse.json(newStrategy, { status: 201 });
  } catch (error: any) {
    console.error("Error creating strategy:", error);
    return NextResponse.json(
      { error: "Failed to create strategy" },
      { status: 500 }
    );
  }
}
