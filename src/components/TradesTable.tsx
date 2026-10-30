"use client";

import React, { useState, useMemo } from "react";
import {
  formatDateDisplay,
  formatTimeDisplay,
  formatDateWithMonthName,
  formatMonthDisplay,
} from "@/lib/dates";
import { calculateOutcome } from "@/lib/outcome";
import { TradeRecord } from "@/lib/stats";
import { TradeEditingItem } from "./TradeForm";
import {
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  Inbox,
  Filter,
  ArrowRightLeft,
} from "lucide-react";

interface TradesTableProps {
  trades: TradeRecord[];
  onEditTrade: (trade: TradeEditingItem) => void;
  onDeleteTrade: (id: string) => Promise<void>;
  selectedMonth: string; // "YYYY-MM" or "ALL"
  onMonthChange: (month: string) => void;
}

export function TradesTable({
  trades,
  onEditTrade,
  onDeleteTrade,
  selectedMonth,
  onMonthChange,
}: TradesTableProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(30);

  // Group trades by date (newest date first; within day, time ascending)
  const groupedDays = useMemo(() => {
    const map = new Map<string, TradeRecord[]>();
    for (const t of trades) {
      const d = t.tradeDate.includes("T") ? t.tradeDate.split("T")[0] : t.tradeDate;
      const list = map.get(d) || [];
      list.push(t);
      map.set(d, list);
    }

    // Sort dates descending (newest date first)
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));

    return sortedDates.map((date) => {
      // Sort within the day by tradeTime ascending
      const dayTrades = (map.get(date) || []).slice().sort((a, b) =>
        a.tradeTime.localeCompare(b.tradeTime)
      );
      const outcome = calculateOutcome(dayTrades);
      return {
        date,
        trades: dayTrades,
        outcome,
      };
    });
  }, [trades]);

  // Extract distinct available months for filter dropdown
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    for (const t of trades) {
      const d = t.tradeDate.includes("T") ? t.tradeDate.split("T")[0] : t.tradeDate;
      monthSet.add(d.substring(0, 7)); // "YYYY-MM"
    }
    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [trades]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await onDeleteTrade(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const visibleDays = groupedDays.slice(0, displayLimit);

  return (
    <div className="glass-panel rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Recorded Trades Table
          </h3>
          <span className="text-xs text-slate-500 font-medium ml-1">
            ({trades.length} {trades.length === 1 ? "trade" : "trades"})
          </span>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2 justify-between sm:justify-start w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Month:</span>
          </div>
          <select
            id="month-filter-select"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="ALL">All Recorded Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthDisplay(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      {groupedDays.length === 0 ? (
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            No trades recorded yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Use the form above to record your first trade for this strategy.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Horizontal Scroll Indicator Banner */}
          <div className="md:hidden flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Scroll horizontally for all columns</span>
            </span>
            <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
              Swipe →
            </span>
          </div>

          <div className="table-scroll-container pb-2">
            <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3 sm:px-4 w-36 sm:w-44">DATE</th>
                  <th className="py-3 px-2.5 sm:px-4 w-20 sm:w-28">TIME</th>
                  <th className="py-3 px-2.5 sm:px-4 w-16 sm:w-24 text-rose-700">SL</th>
                  <th className="py-3 px-2.5 sm:px-4 w-16 sm:w-24 text-emerald-700">TP</th>
                  <th className="py-3 px-2.5 sm:px-4 w-28 sm:w-36 text-center">OUTCOME</th>
                  <th className="py-3 px-2 sm:px-4 w-16 sm:w-20 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {visibleDays.map((group) => {
                  const rowCount = group.trades.length;
                  const isTp = group.outcome.outcome === "TP";
                  const isSl = group.outcome.outcome === "SL";

                  return group.trades.map((trade, index) => {
                    const isFirstRow = index === 0;

                    return (
                      <tr
                        key={trade.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Merged DATE cell */}
                        {isFirstRow && (
                          <td
                            rowSpan={rowCount}
                            className="py-3 px-3 sm:px-4 align-top font-bold text-slate-900 border-r border-slate-200 bg-slate-50/70 whitespace-nowrap"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs sm:text-sm font-bold">{formatDateWithMonthName(group.date)}</span>
                              <span className="text-[10px] sm:text-[11px] text-slate-500 font-normal mt-0.5">
                                {rowCount} {rowCount === 1 ? "entry" : "entries"}
                              </span>
                            </div>
                          </td>
                        )}

                        {/* TIME cell (12h format AM/PM) */}
                        <td className="py-2.5 sm:py-3 px-2.5 sm:px-4 text-slate-700 font-medium whitespace-nowrap text-xs">
                          {formatTimeDisplay(trade.tradeTime)}
                        </td>

                        {/* SL column */}
                        <td className="py-2.5 sm:py-3 px-2.5 sm:px-4 font-bold text-rose-600 text-xs sm:text-sm">
                          {trade.type === "SL" ? trade.value : "-"}
                        </td>

                        {/* TP column */}
                        <td className="py-2.5 sm:py-3 px-2.5 sm:px-4 font-bold text-emerald-600 text-xs sm:text-sm">
                          {trade.type === "TP" ? trade.value : "-"}
                        </td>

                        {/* Merged OUTCOME cell for that day */}
                        {isFirstRow && (
                          <td
                            rowSpan={rowCount}
                            className={`py-3 px-2.5 sm:px-4 align-middle text-center border-l border-r border-slate-200 font-extrabold ${
                              isTp
                                ? "bg-emerald-50/50 text-emerald-800"
                                : isSl
                                ? "bg-rose-50/50 text-rose-800"
                                : "bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div
                              className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-bold ${
                                isTp
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : isSl
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              <span>{group.outcome.outcome}</span>
                              <span className="text-xs sm:text-sm">{group.outcome.value}</span>
                            </div>
                          </td>
                        )}

                        {/* Row actions (Edit / Delete) */}
                        <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                            <button
                              onClick={() =>
                                onEditTrade({
                                  id: trade.id,
                                  tradeDate: trade.tradeDate,
                                  tradeTime: trade.tradeTime,
                                  type: trade.type,
                                  value: trade.value,
                                })
                              }
                              title="Edit trade"
                              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(trade.id)}
                              title="Delete trade"
                              className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-slate-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination / Load More */}
      {groupedDays.length > displayLimit && (
        <div className="p-4 border-t border-slate-200 text-center">
          <button
            onClick={() => setDisplayLimit((prev) => prev + 30)}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Load More Days ({groupedDays.length - displayLimit} remaining)
          </button>
        </div>
      )}

      {/* Delete Trade Confirmation Dialog */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 rounded-xl bg-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Delete Trade?
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Are you sure you want to delete this trade? Day, week, and month outcomes will automatically recompute.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Trade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
