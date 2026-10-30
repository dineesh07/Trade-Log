import { PrismaClient, TradeType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

// Seed random number generator with deterministic results
let seed = 42;
function pseudoRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randomInt(min: number, max: number): number {
  return Math.floor(pseudoRandom() * (max - min + 1)) + min;
}

const sampleTimes = [
  "09:15", "09:45", "10:20", "11:05", "11:50",
  "12:30", "13:15", "14:10", "15:00", "15:45",
  "16:30", "18:15", "19:40", "20:50", "21:30"
];

async function feedData() {
  console.log("Generating 3 months of daily trading data...");

  const email = process.env.SEED_USER_EMAIL || "trader@example.com";
  const password = process.env.SEED_USER_PASSWORD || "password123";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Default Trader" },
  });

  console.log(`User: ${user.email} (${user.id})`);

  // Fetch Instruments
  const xauusd = await prisma.instrument.findUnique({ where: { symbol: "XAUUSD" } });
  const nifty = await prisma.instrument.findUnique({ where: { symbol: "NIFTY" } });
  const banknifty = await prisma.instrument.findUnique({ where: { symbol: "BANKNIFTY" } });
  const eurusd = await prisma.instrument.findUnique({ where: { symbol: "EURUSD" } });

  if (!xauusd || !nifty || !banknifty || !eurusd) {
    throw new Error("Instruments not seeded. Please run base seed first.");
  }

  // 1. Strategy: XAUUSD "5EMA 1:3"
  const stratXau = await prisma.strategy.upsert({
    where: {
      userId_instrumentId_name: {
        userId: user.id,
        instrumentId: xauusd.id,
        name: "5EMA 1:3",
      },
    },
    update: {},
    create: {
      userId: user.id,
      instrumentId: xauusd.id,
      name: "5EMA 1:3",
    },
  });

  // Clear existing trades for fresh clean seed
  await prisma.trade.deleteMany({
    where: { userId: user.id },
  });

  const tradesToInsert: Array<{
    userId: string;
    strategyId: string;
    tradeDate: Date;
    tradeTime: string;
    type: TradeType;
    value: number;
  }> = [];

  // Generate 88 days from 2026-08-01 to 2026-10-27
  const endDate = new Date("2026-10-27T00:00:00Z");
  
  for (let i = 87; i >= 0; i--) {
    const currentDate = subDays(endDate, i);
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayOfWeek = currentDate.getUTCDay(); // 0 is Sunday, 6 is Saturday

    // Skip Sundays
    if (dayOfWeek === 0) continue;
    // On Saturdays, trade 50% of the time (crypto/forex weekend wrap-up)
    if (dayOfWeek === 6 && pseudoRandom() > 0.5) continue;

    // Special case for today: 27.10.2026 -> Worked example from specification (TP 72)
    if (dateStr === "2026-10-27") {
      tradesToInsert.push(
        { userId: user.id, strategyId: stratXau.id, tradeDate: currentDate, tradeTime: "12:25", type: TradeType.SL, value: 20 },
        { userId: user.id, strategyId: stratXau.id, tradeDate: currentDate, tradeTime: "13:12", type: TradeType.TP, value: 60 },
        { userId: user.id, strategyId: stratXau.id, tradeDate: currentDate, tradeTime: "15:56", type: TradeType.SL, value: 68 },
        { userId: user.id, strategyId: stratXau.id, tradeDate: currentDate, tradeTime: "21:08", type: TradeType.TP, value: 100 }
      );
      continue;
    }

    // Number of trades for this day: 1 to 4 trades
    const tradeCount = randomInt(1, 3);
    const dayTimes = sampleTimes.slice().sort(() => pseudoRandom() - 0.5).slice(0, tradeCount).sort();

    // Bias towards ~58% win rate so chart has realistic upward trend with drawdowns
    for (let t = 0; t < tradeCount; t++) {
      const isWin = pseudoRandom() < 0.58;
      const type = isWin ? TradeType.TP : TradeType.SL;
      // Typical target is larger (e.g. 1:2 or 1:3 ratio)
      const value = isWin ? randomInt(40, 110) : randomInt(20, 65);
      const time = dayTimes[t] || "11:30";

      tradesToInsert.push({
        userId: user.id,
        strategyId: stratXau.id,
        tradeDate: currentDate,
        tradeTime: time,
        type,
        value,
      });
    }
  }

  // Batch insert all trades for XAUUSD
  console.log(`Inserting ${tradesToInsert.length} daily trades for XAUUSD "5EMA 1:3"...`);
  await prisma.trade.createMany({
    data: tradesToInsert,
  });

  // 2. Strategy: NIFTY "15-Min ORB"
  const stratNifty = await prisma.strategy.upsert({
    where: {
      userId_instrumentId_name: {
        userId: user.id,
        instrumentId: nifty.id,
        name: "15-Min ORB",
      },
    },
    update: {},
    create: {
      userId: user.id,
      instrumentId: nifty.id,
      name: "15-Min ORB",
    },
  });

  const niftyTrades = [];
  for (let i = 60; i >= 0; i--) {
    const d = subDays(endDate, i);
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue; // Indian market closed on weekends

    const isWin = pseudoRandom() < 0.55;
    niftyTrades.push({
      userId: user.id,
      strategyId: stratNifty.id,
      tradeDate: d,
      tradeTime: "09:45",
      type: isWin ? TradeType.TP : TradeType.SL,
      value: isWin ? randomInt(50, 120) : randomInt(30, 70),
    });

    if (pseudoRandom() > 0.4) {
      const isWin2 = pseudoRandom() < 0.52;
      niftyTrades.push({
        userId: user.id,
        strategyId: stratNifty.id,
        tradeDate: d,
        tradeTime: "13:30",
        type: isWin2 ? TradeType.TP : TradeType.SL,
        value: isWin2 ? randomInt(40, 95) : randomInt(25, 55),
      });
    }
  }

  console.log(`Inserting ${niftyTrades.length} daily trades for NIFTY "15-Min ORB"...`);
  await prisma.trade.createMany({
    data: niftyTrades,
  });

  // 3. Strategy: BANKNIFTY "CPR Pullback"
  const stratBank = await prisma.strategy.upsert({
    where: {
      userId_instrumentId_name: {
        userId: user.id,
        instrumentId: banknifty.id,
        name: "CPR Pullback",
      },
    },
    update: {},
    create: {
      userId: user.id,
      instrumentId: banknifty.id,
      name: "CPR Pullback",
    },
  });

  const bankTrades = [];
  for (let i = 45; i >= 0; i--) {
    const d = subDays(endDate, i);
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue;

    const isWin = pseudoRandom() < 0.60;
    bankTrades.push({
      userId: user.id,
      strategyId: stratBank.id,
      tradeDate: d,
      tradeTime: "10:15",
      type: isWin ? TradeType.TP : TradeType.SL,
      value: isWin ? randomInt(80, 160) : randomInt(40, 80),
    });
  }

  console.log(`Inserting ${bankTrades.length} daily trades for BANKNIFTY "CPR Pullback"...`);
  await prisma.trade.createMany({
    data: bankTrades,
  });

  console.log("3 months of daily trading data seeded successfully into Neon!");
}

feedData()
  .catch((e) => {
    console.error("Error seeding 3 months data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
