"use client";

import React from "react";
import { formatDateDisplay, formatTimeDisplay, formatDateWithMonthName } from "@/lib/dates";
import { calculateOutcome } from "@/lib/outcome";
import { TradeRecord } from "@/lib/stats";
import { TradeEditingItem } from "./TradeForm";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Layers,
} from "lucide-react";

interface DayPanelProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // "YYYY-MM-DD"
  trades: TradeRecord[];
  onAddTradeForDay: (date: string) => void;
  onEditTrade: (trade: TradeEditingItem) => void;
  onDeleteTrade: (id: string) => Promise<void>;
}

export function DayPanel({
  isOpen,
  onClose,
  date,
  trades,
  onAddTradeForDay,
  onEditTrade,
  onDeleteTrade,
}: DayPanelProps) {
  if (!isOpen) return null;

  const sortedTrades = trades
    .slice()
    .sort((a, b) => a.tradeTime.localeCompare(b.tradeTime));

  const outcome = calculateOutcome(sortedTrades);
  const isTp = outcome.outcome === "TP";
  const isSl = outcome.outcome === "SL";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {formatDateWithMonthName(date)}
                </h3>
                <p className="text-xs text-slate-500">
                  {date}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Outcome Summary for this day */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Day Outcome
              </span>
              {trades.length > 0 ? (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                    isTp
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : isSl
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {isTp && <TrendingUp className="w-3.5 h-3.5" />}
                  {isSl && <TrendingDown className="w-3.5 h-3.5" />}
                  {outcome.outcome === "BE" && <Minus className="w-3.5 h-3.5" />}
                  <span>
                    {outcome.outcome} {outcome.value}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No trades</span>
              )}
            </div>

            {trades.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Total TP</div>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">
                    {outcome.totalTP}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Total SL</div>
                  <div className="font-bold text-rose-700 text-sm mt-0.5">
                    {outcome.totalSL}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Net P/L</div>
                  <div
                    className={`font-bold text-sm mt-0.5 ${
                      outcome.net > 0
                        ? "text-emerald-700"
                        : outcome.net < 0
                        ? "text-rose-700"
                        : "text-slate-600"
                    }`}
                  >
                    {outcome.net > 0 ? `+${outcome.net}` : outcome.net}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trades list for this day */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Trades ({sortedTrades.length})
              </span>
            </div>

            {sortedTrades.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs">No trades logged for this date.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTrades.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          t.type === "TP"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {t.type}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {t.value}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatTimeDisplay(t.tradeTime)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onEditTrade({
                            id: t.id,
                            tradeDate: t.tradeDate,
                            tradeTime: t.tradeTime,
                            type: t.type,
                            value: t.value,
                          });
                          onClose();
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="Edit trade"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          await onDeleteTrade(t.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        title="Delete trade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer: Add trade for this day button */}
          <div className="p-5 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                onAddTradeForDay(date);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Trade for {formatDateDisplay(date)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
