"use client";

import React, { useState, useMemo } from "react";
import { Outcome, calculateOutcome } from "@/lib/outcome";
import { TradeRecord } from "@/lib/stats";
import { formatDateDisplay } from "@/lib/dates";
import {
  format,
  subWeeks,
  startOfWeek,
  endOfWeek,
  parseISO,
} from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Award,
  Zap,
  ChevronDown,
  Clock,
  Flame,
} from "lucide-react";

interface SummaryCardsProps {
  trades?: TradeRecord[];
  weekOutcome?: Outcome;
  monthOutcome?: Outcome;
  bestDay?: { date: string; net: number } | null;
  worstDay?: { date: string; net: number } | null;
}

export function SummaryCards({
  trades,
  weekOutcome,
  monthOutcome,
  bestDay,
  worstDay,
}: SummaryCardsProps) {
  const now = new Date();

  // Generate 8 recent week options (Monday to Sunday)
  const weekOptions = useMemo(() => {
    const list = [];
    for (let i = 0; i < 8; i++) {
      const targetDate = subWeeks(now, i);
      const start = startOfWeek(targetDate, { weekStartsOn: 1 });
      const end = endOfWeek(targetDate, { weekStartsOn: 1 });
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");

      let label = "";
      if (i === 0) label = "This Week";
      else if (i === 1) label = "Last Week";
      else label = `${i} Wks Ago`;

      const rangeLabel = `${format(start, "dd MMM")} - ${format(end, "dd MMM")}`;

      list.push({
        index: i,
        label: `${label} (${rangeLabel})`,
        shortLabel: label,
        startStr,
        endStr,
      });
    }
    return list;
  }, []);

  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  // Compute selected week outcome from trades
  const currentWeekOutcome = useMemo(() => {
    if (!trades || trades.length === 0) {
      return (
        weekOutcome || {
          outcome: "BE" as const,
          value: 0,
          net: 0,
          totalTP: 0,
          totalSL: 0,
          tradeCount: 0,
        }
      );
    }
    const option = weekOptions[selectedWeekIndex] || weekOptions[0];
    const weekTrades = trades.filter((t) => {
      const d = t.tradeDate.includes("T") ? t.tradeDate.split("T")[0] : t.tradeDate;
      return d >= option.startStr && d <= option.endStr;
    });
    return calculateOutcome(weekTrades);
  }, [trades, selectedWeekIndex, weekOptions, weekOutcome]);

  // Generate distinct month options from trades + current month
  const monthOptions = useMemo(() => {
    const monthSet = new Set<string>();
    const currentMonthKey = format(now, "yyyy-MM");
    monthSet.add(currentMonthKey);

    if (trades) {
      for (const t of trades) {
        const d = t.tradeDate.includes("T") ? t.tradeDate.split("T")[0] : t.tradeDate;
        monthSet.add(d.substring(0, 7));
      }
    }

    const sorted = Array.from(monthSet).sort((a, b) => b.localeCompare(a));
    const list = sorted.map((key) => {
      const isCurrent = key === currentMonthKey;
      let label = "";
      try {
        label = format(parseISO(`${key}-01`), "MMMM yyyy");
      } catch {
        label = key;
      }
      return {
        key,
        label: isCurrent ? `${label} (Current)` : label,
      };
    });

    list.push({ key: "ALL", label: "All Recorded Months" });
    return list;
  }, [trades]);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(format(now, "yyyy-MM"));

  // Compute selected month outcome from trades
  const currentMonthOutcome = useMemo(() => {
    if (!trades || trades.length === 0) {
      return (
        monthOutcome || {
          outcome: "BE" as const,
          value: 0,
          net: 0,
          totalTP: 0,
          totalSL: 0,
          tradeCount: 0,
        }
      );
    }
    if (selectedMonthKey === "ALL") {
      return calculateOutcome(trades);
    }
    const monthTrades = trades.filter((t) => {
      const d = t.tradeDate.includes("T") ? t.tradeDate.split("T")[0] : t.tradeDate;
      return d.startsWith(selectedMonthKey);
    });
    return calculateOutcome(monthTrades);
  }, [trades, selectedMonthKey, monthOutcome]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Week Performance Card */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
        <div>
          {/* Card Header with selector and badge */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Weekly Outcome
              </span>
            </div>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              {currentWeekOutcome.tradeCount}{" "}
              {currentWeekOutcome.tradeCount === 1 ? "trade" : "trades"}
            </span>
          </div>

          {/* Period Selector Dropdown */}
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Week Period
            </label>
            <div className="relative">
              <select
                value={selectedWeekIndex}
                onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer transition-colors"
                title="Choose week to view performance"
              >
                {weekOptions.map((opt) => (
                  <option key={opt.index} value={opt.index}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Main Outcome Hero Display */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Net Result
              </span>
              <div className="text-2xl font-black tracking-tight mt-0.5">
                {currentWeekOutcome.tradeCount === 0 ? (
                  <span className="text-slate-400">0</span>
                ) : currentWeekOutcome.net > 0 ? (
                  <span className="text-emerald-600">+{currentWeekOutcome.net}</span>
                ) : currentWeekOutcome.net < 0 ? (
                  <span className="text-rose-600">{currentWeekOutcome.net}</span>
                ) : (
                  <span className="text-slate-700">0</span>
                )}
              </div>
            </div>

            {/* Outcome Tag */}
            <div>
              {currentWeekOutcome.tradeCount === 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200/60 text-slate-600">
                  <Minus className="w-3.5 h-3.5" /> Even
                </span>
              ) : currentWeekOutcome.outcome === "TP" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs">
                  <TrendingUp className="w-3.5 h-3.5" /> TP {currentWeekOutcome.value}
                </span>
              ) : currentWeekOutcome.outcome === "SL" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white shadow-xs">
                  <TrendingDown className="w-3.5 h-3.5" /> SL {currentWeekOutcome.value}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-600 text-white">
                  <Minus className="w-3.5 h-3.5" /> Break-even
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3-column stats breakdown */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              TP Points
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-600 mt-0.5 block">
              +{currentWeekOutcome.totalTP}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              SL Points
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-rose-600 mt-0.5 block">
              -{currentWeekOutcome.totalSL}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Net Status
            </span>
            <span
              className={`text-xs sm:text-sm font-extrabold mt-0.5 block ${
                currentWeekOutcome.net > 0
                  ? "text-emerald-600"
                  : currentWeekOutcome.net < 0
                  ? "text-rose-600"
                  : "text-slate-600"
              }`}
            >
              {currentWeekOutcome.net > 0 ? "Profit" : currentWeekOutcome.net < 0 ? "Loss" : "Even"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Month Performance Card */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
        <div>
          {/* Card Header with selector and badge */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Monthly Outcome
              </span>
            </div>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              {currentMonthOutcome.tradeCount}{" "}
              {currentMonthOutcome.tradeCount === 1 ? "trade" : "trades"}
            </span>
          </div>

          {/* Period Selector Dropdown */}
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Month Period
            </label>
            <div className="relative">
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 cursor-pointer transition-colors"
                title="Choose month to view performance"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Main Outcome Hero Display */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Net Result
              </span>
              <div className="text-2xl font-black tracking-tight mt-0.5">
                {currentMonthOutcome.tradeCount === 0 ? (
                  <span className="text-slate-400">0</span>
                ) : currentMonthOutcome.net > 0 ? (
                  <span className="text-emerald-600">+{currentMonthOutcome.net}</span>
                ) : currentMonthOutcome.net < 0 ? (
                  <span className="text-rose-600">{currentMonthOutcome.net}</span>
                ) : (
                  <span className="text-slate-700">0</span>
                )}
              </div>
            </div>

            {/* Outcome Tag */}
            <div>
              {currentMonthOutcome.tradeCount === 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200/60 text-slate-600">
                  <Minus className="w-3.5 h-3.5" /> Even
                </span>
              ) : currentMonthOutcome.outcome === "TP" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs">
                  <TrendingUp className="w-3.5 h-3.5" /> TP {currentMonthOutcome.value}
                </span>
              ) : currentMonthOutcome.outcome === "SL" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-600 text-white shadow-xs">
                  <TrendingDown className="w-3.5 h-3.5" /> SL {currentMonthOutcome.value}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-600 text-white">
                  <Minus className="w-3.5 h-3.5" /> Break-even
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3-column stats breakdown */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              TP Points
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-600 mt-0.5 block">
              +{currentMonthOutcome.totalTP}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              SL Points
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-rose-600 mt-0.5 block">
              -{currentMonthOutcome.totalSL}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Net Status
            </span>
            <span
              className={`text-xs sm:text-sm font-extrabold mt-0.5 block ${
                currentMonthOutcome.net > 0
                  ? "text-emerald-600"
                  : currentMonthOutcome.net < 0
                  ? "text-rose-600"
                  : "text-slate-600"
              }`}
            >
              {currentMonthOutcome.net > 0 ? "Profit" : currentMonthOutcome.net < 0 ? "Loss" : "Even"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Peak Performance Card (Best & Worst Day) */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Peak Days
              </span>
            </div>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              Extremes
            </span>
          </div>

          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Historical Records
            </span>
            <p className="text-xs text-slate-500 font-medium">
              Highest single-day profit vs biggest single-day drawdown
            </p>
          </div>

          {/* Best Day and Worst Day tiles */}
          <div className="space-y-2.5 mb-4">
            {/* Best Day */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Best Day</span>
                  <span className="text-[11px] text-slate-500">
                    {bestDay?.date ? formatDateDisplay(bestDay.date) : "No entries"}
                  </span>
                </div>
              </div>
              <span className="text-base font-black text-emerald-700">
                {bestDay ? (bestDay.net > 0 ? `+${bestDay.net}` : bestDay.net) : "-"}
              </span>
            </div>

            {/* Worst Day */}
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Worst Day</span>
                  <span className="text-[11px] text-slate-500">
                    {worstDay?.date ? formatDateDisplay(worstDay.date) : "No entries"}
                  </span>
                </div>
              </div>
              <span className="text-base font-black text-rose-700">
                {worstDay ? (worstDay.net > 0 ? `+${worstDay.net}` : worstDay.net) : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <span className="text-[11px] font-semibold text-slate-400">
            Calculated strictly from recorded entries
          </span>
        </div>
      </div>
    </div>
  );
}
