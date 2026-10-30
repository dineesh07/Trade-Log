"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SummaryCards } from "@/components/SummaryCards";
import { TradeForm, TradeFormData, TradeEditingItem } from "@/components/TradeForm";
import { TradesTable } from "@/components/TradesTable";
import { CalendarView } from "@/components/CalendarView";
import { DayPanel } from "@/components/DayPanel";
import { CumulativeChart } from "@/components/charts/CumulativeChart";
import { DailyBarChart } from "@/components/charts/DailyBarChart";
import { TpSlChart } from "@/components/charts/TpSlChart";
import { StrategyModal } from "@/components/StrategyModal";
import { useToast } from "@/components/ToastProvider";
import { StrategyStats, TradeRecord } from "@/lib/stats";
import { format } from "date-fns";
import {
  ArrowLeft,
  MoreVertical,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  BarChart3,
  Loader2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function StrategyPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const strategyId = params?.id as string;

  const [strategy, setStrategy] = useState<{
    id: string;
    name: string;
    instrument: { symbol: string; displayName: string; market: string };
  } | null>(null);

  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [stats, setStats] = useState<StrategyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  // Filter states
  type ChartRange = "week" | "month" | "3months" | "all" | "custom";
  const [chartRange, setChartRange] = useState<ChartRange>("month");
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [tableMonth, setTableMonth] = useState<string>("ALL");
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Editing state
  const [editingTrade, setEditingTrade] = useState<TradeEditingItem | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>();

  // Day panel modal
  const [activeDayDate, setActiveDayDate] = useState<string | null>(null);

  // Strategy menu / modals
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tab between Calendar & Analytics view
  const [activeViewTab, setActiveViewTab] = useState<"calendar" | "charts">("calendar");

  const loadStrategyAndData = useCallback(async () => {
    if (!strategyId) return;

    try {
      const monthStr = format(calendarMonth, "yyyy-MM");
      let statsUrl = `/api/strategies/${strategyId}/stats?range=${chartRange}&month=${monthStr}`;
      if (chartRange === "custom") {
        statsUrl += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const [stratRes, tradesRes, statsRes, meRes] = await Promise.all([
        fetch(`/api/strategies/${strategyId}`),
        fetch(
          tableMonth !== "ALL"
            ? `/api/strategies/${strategyId}/trades?month=${tableMonth}`
            : `/api/strategies/${strategyId}/trades`
        ),
        fetch(statsUrl),
        fetch("/api/auth/me"),
      ]);

      if (stratRes.status === 401 || meRes.status === 401) {
        router.push("/login");
        return;
      }

      if (stratRes.status === 404) {
        router.push("/");
        return;
      }

      if (stratRes.ok) {
        const stratData = await stratRes.json();
        setStrategy(stratData);
      }

      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        setTrades(tradesData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        setUserEmail(meData.user?.email);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to load strategy details", "error");
    } finally {
      setLoading(false);
    }
  }, [strategyId, chartRange, tableMonth, calendarMonth, customStartDate, customEndDate, router, showToast]);

  useEffect(() => {
    loadStrategyAndData();
  }, [loadStrategyAndData]);

  // Trade operations
  const handleCreateTrade = async (data: TradeFormData) => {
    const res = await fetch(`/api/strategies/${strategyId}/trades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || "Failed to save trade");
    }

    showToast(`Trade recorded: ${data.type} ${data.value}`, "success");
    setFormDefaultDate(undefined);
    await loadStrategyAndData();
  };

  const handleUpdateTrade = async (id: string, data: TradeFormData) => {
    const res = await fetch(`/api/trades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || "Failed to update trade");
    }

    showToast(`Trade updated successfully`, "success");
    setEditingTrade(null);
    await loadStrategyAndData();
  };

  const handleDeleteTrade = async (id: string) => {
    const res = await fetch(`/api/trades/${id}`, {
      method: "DELETE",
    });

    const resData = await res.json();
    if (!res.ok) {
      showToast(resData.error || "Failed to delete trade", "error");
      return;
    }

    showToast("Trade deleted", "info");
    await loadStrategyAndData();
  };

  // Strategy operations
  const handleRenameStrategy = async (name: string) => {
    const res = await fetch(`/api/strategies/${strategyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || "Failed to rename strategy");
    }

    showToast(`Strategy renamed to "${name}"`, "success");
    setStrategy((prev) => (prev ? { ...prev, name } : null));
    await loadStrategyAndData();
  };

  const handleDeleteStrategy = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/strategies/${strategyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete strategy");
      }

      showToast(`Strategy deleted`, "info");
      router.push(`/instrument/${strategy?.instrument.symbol.toLowerCase()}`);
    } catch (err: any) {
      showToast(err.message || "Failed to delete", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  // Pre-fill form from day panel
  const handleAddTradeForDay = (date: string) => {
    setFormDefaultDate(date);
    setEditingTrade(null);
    const formElement = document.getElementById("trade-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeDayTrades = activeDayDate
    ? trades.filter((t) => {
        const d = t.tradeDate.includes("T") ? t.tradeDate.split("T")[0] : t.tradeDate;
        return d === activeDayDate;
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header userEmail={userEmail} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href={
              strategy?.instrument
                ? `/instrument/${strategy.instrument.symbol.toLowerCase()}`
                : "/"
            }
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>
              Back to {strategy?.instrument.symbol || "Instrument"} Strategies
            </span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {strategy?.instrument.displayName}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-700 font-bold">
                  {strategy?.instrument.symbol}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <span>{strategy?.name || "Strategy"}</span>
              </h1>
            </div>

            {/* Menu: Rename & Delete */}
            <div className="relative self-start sm:self-auto">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
                <span>Manage Strategy</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 animate-fade-in text-xs font-semibold">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setIsRenameOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rename Strategy</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setIsDeleteOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Strategy</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm">Loading strategy dashboard...</span>
          </div>
        ) : (
          <>
            {/* Section B: Summary Cards */}
            {stats && (
              <section>
                <SummaryCards
                  trades={trades}
                  weekOutcome={stats.week}
                  monthOutcome={stats.month}
                  bestDay={stats.bestDay}
                  worstDay={stats.worstDay}
                />
              </section>
            )}

            {/* Section C: Add Trade Form */}
            <section id="trade-form-section">
              <TradeForm
                onSubmit={handleCreateTrade}
                onUpdate={handleUpdateTrade}
                editingTrade={editingTrade}
                onCancelEdit={() => setEditingTrade(null)}
                defaultDate={formDefaultDate}
              />
            </section>

            {/* Section E & F: Interactive Calendar & Analytics Tabs */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1 sm:gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 w-full sm:w-fit">
                  <button
                    onClick={() => setActiveViewTab("calendar")}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeViewTab === "calendar"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Visual Calendar</span>
                  </button>
                  <button
                    onClick={() => setActiveViewTab("charts")}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeViewTab === "charts"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Analytics & Charts</span>
                  </button>
                </div>

                {activeViewTab === "charts" && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500 font-medium mr-1 text-[11px]">Range:</span>
                      {(["week", "month", "3months", "all", "custom"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setChartRange(r)}
                          className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-all ${
                            chartRange === r
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {r === "3months" ? "3 Mo" : r === "custom" ? "Custom" : r}
                        </button>
                      ))}
                    </div>

                    {chartRange === "custom" && (
                      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs animate-in fade-in duration-200 w-full sm:w-auto">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                          <span className="text-[10px] uppercase font-bold text-slate-500">From</span>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <span className="text-slate-400 font-bold text-xs">→</span>
                        <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                          <span className="text-[10px] uppercase font-bold text-slate-500">To</span>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {activeViewTab === "calendar" ? (
                <CalendarView
                  dayOutcomes={stats?.calendarDays || stats?.days || []}
                  onSelectDay={(dateStr) => setActiveDayDate(dateStr)}
                  selectedMonth={calendarMonth}
                  onMonthChange={(newMonth) => setCalendarMonth(newMonth)}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart 1: Cumulative P/L Line Chart */}
                  <div className="lg:col-span-2 glass-panel p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Cumulative Outcome Growth (P/L)
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Zero baseline
                      </span>
                    </div>
                    <CumulativeChart data={stats?.cumulative || []} />
                  </div>

                  {/* Chart 3: TP vs SL Donut Chart */}
                  <div className="glass-panel p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-sky-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Target vs Stop Loss Ratio
                        </h4>
                      </div>
                    </div>
                    <TpSlChart
                      tpCount={stats?.counts.tp || 0}
                      slCount={stats?.counts.sl || 0}
                    />
                  </div>

                  {/* Chart 2: Daily Net Bar Chart */}
                  <div className="lg:col-span-3 glass-panel p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-teal-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Daily Net Outcomes Breakdown
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Green (+TP) / Red (-SL)
                      </span>
                    </div>
                    <DailyBarChart data={stats?.days || []} />
                  </div>
                </div>
              )}
            </section>

            {/* Section D: Grouped Trades Table */}
            <section>
              <TradesTable
                trades={trades}
                onEditTrade={(trade) => {
                  setEditingTrade(trade);
                  const formElement = document.getElementById("trade-form-section");
                  if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
                }}
                onDeleteTrade={handleDeleteTrade}
                selectedMonth={tableMonth}
                onMonthChange={(m) => setTableMonth(m)}
              />
            </section>
          </>
        )}
      </main>

      {/* Day Detail Panel / Bottom Sheet */}
      <DayPanel
        isOpen={!!activeDayDate}
        onClose={() => setActiveDayDate(null)}
        date={activeDayDate || ""}
        trades={activeDayTrades}
        onAddTradeForDay={handleAddTradeForDay}
        onEditTrade={(trade) => {
          setEditingTrade(trade);
          const formElement = document.getElementById("trade-form-section");
          if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
        }}
        onDeleteTrade={handleDeleteTrade}
      />

      {/* Rename Strategy Modal */}
      <StrategyModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        onSubmit={handleRenameStrategy}
        initialName={strategy?.name || ""}
        title="Rename Strategy"
        submitButtonText="Save Changes"
      />

      {/* Delete Strategy Confirmation Dialog */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Delete Strategy?
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{strategy?.name}"</span>?
              All recorded trades will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStrategy}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Strategy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
