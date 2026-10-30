import { PrismaClient, Market } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const instruments = [
  {
    market: Market.FOREX,
    symbol: "XAUUSD",
    displayName: "XAU/USD (Gold)",
    sortOrder: 1,
  },
  {
    market: Market.FOREX,
    symbol: "EURUSD",
    displayName: "EUR/USD",
    sortOrder: 2,
  },
  {
    market: Market.FOREX,
    symbol: "BTCUSD",
    displayName: "BTC/USD",
    sortOrder: 3,
  },
  {
    market: Market.INDIAN,
    symbol: "NIFTY",
    displayName: "NIFTY",
    sortOrder: 1,
  },
  {
    market: Market.INDIAN,
    symbol: "SENSEX",
    displayName: "SENSEX",
    sortOrder: 2,
  },
  {
    market: Market.INDIAN,
    symbol: "BANKNIFTY",
    displayName: "BANK NIFTY",
    sortOrder: 3,
  },
];

async function main() {
  console.log("Seeding instruments...");
  for (const inst of instruments) {
    await prisma.instrument.upsert({
      where: { symbol: inst.symbol },
      update: {
        market: inst.market,
        displayName: inst.displayName,
        sortOrder: inst.sortOrder,
      },
      create: {
        market: inst.market,
        symbol: inst.symbol,
        displayName: inst.displayName,
        sortOrder: inst.sortOrder,
      },
    });
  }

  const email = process.env.SEED_USER_EMAIL || "trader@example.com";
  const password = process.env.SEED_USER_PASSWORD || "password123";
  const passwordHash = await bcrypt.hash(password, 10);

  console.log(`Seeding user: ${email}`);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      name: "Default Trader",
    },
    create: {
      email,
      passwordHash,
      name: "Default Trader",
    },
  });

  console.log("Seed completed successfully for user:", user.email);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
