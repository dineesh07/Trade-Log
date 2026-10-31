"use client";

import React, { useState, useMemo } from "react";
import { TradeRecord } from "@/lib/stats";
import { roundNumber } from "@/lib/outcome";
import {
  format,
  subWeeks,
  startOfWeek,
  endOfWeek,
  parseISO,
} from "date-fns";
import {
  Calendar,
  Clock,
  Layers,
  ChevronDown,
  Target,
  ShieldAlert,
} from "lucide-react";

interface SummaryCardsProps {
  trades?: TradeRecord[];
}

export function SummaryCards({ trades }: SummaryCardsProps) {
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

  // Compute selected week stats
  const weekStats = useMemo(() => {
    let tpValue = 0;
    let tpCount = 0;
    let slValue = 0;
    let slCount = 0;
    if (trades && trades.length > 0) {
      const option = weekOptions[selectedWeekIndex] || weekOptions[0];
      for (const t of trades) {
        const d = t.tradeDate.includes("T") ? t.tradeDate.split("T")[0] : t.tradeDate;
        if (d >= option.startStr && d <= option.endStr) {
          if (t.type === "TP") {
            tpCount++;
            tpValue += t.value;
          } else if (t.type === "SL") {
            slCount++;
            slValue += t.value;
          }
        }
      }
    }
    return {
      tpValue: roundNumber(tpValue),
      tpCount,
      slValue: roundNumber(slValue),
      slCount,
      totalTrades: tpCount + slCount,
    };
  }, [trades, selectedWeekIndex, weekOptions]);

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

  // Compute selected month stats
  const monthStats = useMemo(() => {
    let tpValue = 0;
    let tpCount = 0;
    let slValue = 0;
    let slCount = 0;
    if (trades && trades.length > 0) {
      for (const t of trades) {
        const d = t.tradeDate.includes("T") ? t.tradeDate.split("T")[0] : t.tradeDate;
        const matches = selectedMonthKey === "ALL" ? true : d.startsWith(selectedMonthKey);
        if (matches) {
          if (t.type === "TP") {
            tpCount++;
            tpValue += t.value;
          } else if (t.type === "SL") {
            slCount++;
            slValue += t.value;
          }
        }
      }
    }
    return {
      tpValue: roundNumber(tpValue),
      tpCount,
      slValue: roundNumber(slValue),
      slCount,
      totalTrades: tpCount + slCount,
    };
  }, [trades, selectedMonthKey]);

  // Compute all-time strategy stats
  const allTimeStats = useMemo(() => {
    let tpValue = 0;
    let tpCount = 0;
    let slValue = 0;
    let slCount = 0;
    if (trades) {
      for (const t of trades) {
        if (t.type === "TP") {
          tpCount++;
          tpValue += t.value;
        } else if (t.type === "SL") {
          slCount++;
          slValue += t.value;
        }
      }
    }
    return {
      tpValue: roundNumber(tpValue),
      tpCount,
      slValue: roundNumber(slValue),
      slCount,
      totalTrades: tpCount + slCount,
    };
  }, [trades]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Week Performance Card */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
        <div>
          {/* Card Header with selector and badge */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  Weekly Summary
                </h3>
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Week
            </span>
          </div>

          {/* Period Selector Dropdown */}
          <div className="mb-4">
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

          {/* 3-column Sub-Cards: TP, SL, Total */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {/* TP */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  TP
                </span>
                <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Target className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div
                  title={`+${weekStats.tpValue}`}
                  className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-emerald-600 tracking-tight truncate"
                >
                  +{weekStats.tpValue}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  {weekStats.tpCount} {weekStats.tpCount === 1 ? "trade" : "trades"}
                </p>
              </div>
            </div>

            {/* SL */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  SL
                </span>
                <div className="p-1 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                  <ShieldAlert className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div
                  title={`-${weekStats.slValue}`}
                  className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-rose-600 tracking-tight truncate"
                >
                  -{weekStats.slValue}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  {weekStats.slCount} {weekStats.slCount === 1 ? "trade" : "trades"}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Total
                </span>
                <div className="p-1 rounded-lg bg-slate-200/70 text-slate-600 shrink-0">
                  <Layers className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-extrabold text-slate-800 tracking-tight truncate">
                  {weekStats.totalTrades}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  Total trades
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Month Performance Card */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
        <div>
          {/* Card Header with selector and badge */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  Monthly Summary
                </h3>
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Month
            </span>
          </div>

          {/* Period Selector Dropdown */}
          <div className="mb-4">
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

          {/* 3-column Sub-Cards: TP, SL, Total */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {/* TP */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  TP
                </span>
                <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Target className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div
                  title={`+${monthStats.tpValue}`}
                  className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-emerald-600 tracking-tight truncate"
                >
                  +{monthStats.tpValue}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  {monthStats.tpCount} {monthStats.tpCount === 1 ? "trade" : "trades"}
                </p>
              </div>
            </div>

            {/* SL */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  SL
                </span>
                <div className="p-1 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                  <ShieldAlert className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div
                  title={`-${monthStats.slValue}`}
                  className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-rose-600 tracking-tight truncate"
                >
                  -{monthStats.slValue}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  {monthStats.slCount} {monthStats.slCount === 1 ? "trade" : "trades"}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Total
                </span>
                <div className="p-1 rounded-lg bg-slate-200/70 text-slate-600 shrink-0">
                  <Layers className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-extrabold text-slate-800 tracking-tight truncate">
                  {monthStats.totalTrades}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  Total trades
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. All-Time Overall Strategy Performance Card */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  All-Time Strategy Totals
                </h3>
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Overall
            </span>
          </div>

          <div className="mb-4">
            <p className="text-xs text-slate-500 font-medium py-1">
              Cumulative TP vs SL across all recorded entries
            </p>
          </div>

          {/* 3-column Sub-Cards: TP, SL, Total */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {/* TP */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  TP
                </span>
                <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Target className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div
                  title={`+${allTimeStats.tpValue}`}
                  className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-emerald-600 tracking-tight truncate"
                >
                  +{allTimeStats.tpValue}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  {allTimeStats.tpCount} {allTimeStats.tpCount === 1 ? "trade" : "trades"}
                </p>
              </div>
            </div>

            {/* SL */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  SL
                </span>
                <div className="p-1 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                  <ShieldAlert className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div
                  title={`-${allTimeStats.slValue}`}
                  className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-rose-600 tracking-tight truncate"
                >
                  -{allTimeStats.slValue}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  {allTimeStats.slCount} {allTimeStats.slCount === 1 ? "trade" : "trades"}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Total
                </span>
                <div className="p-1 rounded-lg bg-slate-200/70 text-slate-600 shrink-0">
                  <Layers className="w-3 h-3" />
                </div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-extrabold text-slate-800 tracking-tight truncate">
                  {allTimeStats.totalTrades}
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  Total trades
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
