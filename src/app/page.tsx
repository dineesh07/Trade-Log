import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { InstrumentCard } from "@/components/InstrumentCard";
import { DashboardOverview } from "@/components/DashboardOverview";
import { prisma } from "@/lib/db";
import { getMonthRange } from "@/lib/dates";
import { calculateOutcome, roundNumber } from "@/lib/outcome";
import { Globe, Landmark } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();

  const { startStr, endStr } = getMonthRange();

  // Fetch instruments, month trades, and all trades concurrently in parallel
  const [instruments, monthTrades, allUserTrades] = await Promise.all([
    prisma.instrument.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        strategies: {
          where: { userId: session?.id },
          select: { id: true },
        },
      },
    }),
    session?.id
      ? prisma.trade.findMany({
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
        })
      : Promise.resolve([]),
    session?.id
      ? prisma.trade.findMany({
          where: { userId: session.id },
          select: { strategyId: true, type: true, value: true },
        })
      : Promise.resolve([]),
  ]);

  // Map strategyId to instrumentId and market
  const strategyToInstrument = new Map<string, string>();
  const strategyToMarket = new Map<string, "FOREX" | "INDIAN">();

  for (const inst of instruments) {
    for (const strat of inst.strategies) {
      strategyToInstrument.set(strat.id, inst.id);
      strategyToMarket.set(strat.id, inst.market as "FOREX" | "INDIAN");
    }
  }

  let forexTpCount = 0;
  let forexTpValue = 0;
  let forexSlCount = 0;
  let forexSlValue = 0;

  let indianTpCount = 0;
  let indianTpValue = 0;
  let indianSlCount = 0;
  let indianSlValue = 0;

  for (const t of allUserTrades) {
    const market = strategyToMarket.get(t.strategyId);
    if (market === "FOREX") {
      if (t.type === "TP") {
        forexTpCount++;
        forexTpValue += t.value;
      } else if (t.type === "SL") {
        forexSlCount++;
        forexSlValue += t.value;
      }
    } else if (market === "INDIAN") {
      if (t.type === "TP") {
        indianTpCount++;
        indianTpValue += t.value;
      } else if (t.type === "SL") {
        indianSlCount++;
        indianSlValue += t.value;
      }
    }
  }

  forexTpValue = roundNumber(forexTpValue);
  forexSlValue = roundNumber(forexSlValue);
  indianTpValue = roundNumber(indianTpValue);
  indianSlValue = roundNumber(indianSlValue);

  const forexTotalTrades = forexTpCount + forexSlCount;
  const indianTotalTrades = indianTpCount + indianSlCount;

  // Compute per-instrument TP, SL, and total stats
  const instrumentStats = new Map<
    string,
    { tpValue: number; tpCount: number; slValue: number; slCount: number; totalTrades: number }
  >();

  for (const inst of instruments) {
    instrumentStats.set(inst.id, {
      tpValue: 0,
      tpCount: 0,
      slValue: 0,
      slCount: 0,
      totalTrades: 0,
    });
  }

  for (const t of allUserTrades) {
    const instId = strategyToInstrument.get(t.strategyId);
    if (instId) {
      const stats = instrumentStats.get(instId);
      if (stats) {
        stats.totalTrades++;
        if (t.type === "TP") {
          stats.tpCount++;
          stats.tpValue += t.value;
        } else if (t.type === "SL") {
          stats.slCount++;
          stats.slValue += t.value;
        }
      }
    }
  }

  instrumentStats.forEach((stats) => {
    stats.tpValue = roundNumber(stats.tpValue);
    stats.slValue = roundNumber(stats.slValue);
  });

  const forexInstruments = instruments.filter((i) => i.market === "FOREX");
  const indianInstruments = instruments.filter((i) => i.market === "INDIAN");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header userEmail={session?.email} userName={session?.name ?? undefined} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Market Overview showing TP, SL, Total in Forex and Indian Market (no winrate, no net income) */}
        <DashboardOverview
          forexTpValue={forexTpValue}
          forexTpCount={forexTpCount}
          forexSlValue={forexSlValue}
          forexSlCount={forexSlCount}
          forexTotalTrades={forexTotalTrades}
          indianTpValue={indianTpValue}
          indianTpCount={indianTpCount}
          indianSlValue={indianSlValue}
          indianSlCount={indianSlCount}
          indianTotalTrades={indianTotalTrades}
        />

        {/* Section 1: Forex */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Forex & Global Markets
              </h2>
              <p className="text-xs text-slate-500">
                Gold, major currency pairs, commodities, and crypto assets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {forexInstruments.map((inst) => {
              const stats = instrumentStats.get(inst.id) || {
                tpValue: 0,
                tpCount: 0,
                slValue: 0,
                slCount: 0,
                totalTrades: 0,
              };
              return (
                <InstrumentCard
                  key={inst.id}
                  symbol={inst.symbol}
                  displayName={inst.displayName}
                  market="FOREX"
                  strategyCount={inst.strategies.length}
                  tpValue={stats.tpValue}
                  tpCount={stats.tpCount}
                  slValue={stats.slValue}
                  slCount={stats.slCount}
                  totalTrades={stats.totalTrades}
                />
              );
            })}
          </div>
        </section>

        {/* Section 2: Indian Market */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Indian Market
              </h2>
              <p className="text-xs text-slate-500">
                Major Indian indices & derivative benchmarks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {indianInstruments.map((inst) => {
              const stats = instrumentStats.get(inst.id) || {
                tpValue: 0,
                tpCount: 0,
                slValue: 0,
                slCount: 0,
                totalTrades: 0,
              };
              return (
                <InstrumentCard
                  key={inst.id}
                  symbol={inst.symbol}
                  displayName={inst.displayName}
                  market="INDIAN"
                  strategyCount={inst.strategies.length}
                  tpValue={stats.tpValue}
                  tpCount={stats.tpCount}
                  slValue={stats.slValue}
                  slCount={stats.slCount}
                  totalTrades={stats.totalTrades}
                />
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
