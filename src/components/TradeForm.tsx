"use client";

import React, { useState, useEffect } from "react";
import { getCurrentDateIST, getCurrentTimeIST } from "@/lib/dates";
import { Plus, Check, Loader2, X, Clock, Calendar, Hash } from "lucide-react";
import { TradeType } from "@/lib/outcome";

export interface TradeFormData {
  tradeDate: string;
  tradeTime: string;
  type: TradeType;
  value: number;
}

export interface TradeEditingItem extends TradeFormData {
  id: string;
}

interface TradeFormProps {
  onSubmit: (data: TradeFormData) => Promise<void>;
  onUpdate?: (id: string, data: TradeFormData) => Promise<void>;
  editingTrade?: TradeEditingItem | null;
  onCancelEdit?: () => void;
  defaultDate?: string; // Pre-filled when clicked from calendar day
}

export function TradeForm({
  onSubmit,
  onUpdate,
  editingTrade,
  onCancelEdit,
  defaultDate,
}: TradeFormProps) {
  const [tradeDate, setTradeDate] = useState<string>(
    editingTrade?.tradeDate || defaultDate || getCurrentDateIST()
  );
  const [tradeTime, setTradeTime] = useState<string>(
    editingTrade?.tradeTime || getCurrentTimeIST()
  );
  const [type, setType] = useState<TradeType>(editingTrade?.type || "TP");
  const [value, setValue] = useState<string>(
    editingTrade ? editingTrade.value.toString() : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTrade) {
      setTradeDate(editingTrade.tradeDate);
      setTradeTime(editingTrade.tradeTime);
      setType(editingTrade.type);
      setValue(editingTrade.value.toString());
    } else {
      if (defaultDate) {
        setTradeDate(defaultDate);
      } else {
        setTradeDate(getCurrentDateIST());
      }
      setTradeTime(getCurrentTimeIST());
      setValue("");
    }
    setError(null);
  }, [editingTrade, defaultDate]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(",", ".");
    // Allow empty string, or digits with at most one decimal point (e.g., "12", "12.", "12.34", ".5")
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setValue(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) {
      setError("Value must be a positive number greater than 0");
      return;
    }
    if (!tradeDate) {
      setError("Trade date is required");
      return;
    }
    if (!tradeTime) {
      setError("Trade time is required (HH:mm)");
      return;
    }

    setLoading(true);
    try {
      if (editingTrade && onUpdate) {
        await onUpdate(editingTrade.id, {
          tradeDate,
          tradeTime,
          type,
          value: numVal,
        });
        if (onCancelEdit) onCancelEdit();
      } else {
        await onSubmit({
          tradeDate,
          tradeTime,
          type,
          value: numVal,
        });
        setValue("");
        setTradeTime(getCurrentTimeIST());
      }
    } catch (err: any) {
      setError(err.message || "Failed to save trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          {editingTrade ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Edit Trade</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Record New Trade</span>
            </>
          )}
        </h3>

        {editingTrade && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Date */}
          <div>
            <label
              htmlFor="trade-date-input"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1"
            >
              <Calendar className="w-3 h-3 text-slate-400" /> Date (IST)
            </label>
            <input
              id="trade-date-input"
              type="date"
              required
              value={tradeDate}
              onChange={(e) => setTradeDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* 2. Time */}
          <div>
            <label
              htmlFor="trade-time-input"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1"
            >
              <Clock className="w-3 h-3 text-slate-400" /> Time (HH:mm)
            </label>
            <input
              id="trade-time-input"
              type="time"
              required
              value={tradeTime}
              onChange={(e) => setTradeTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* 3. Trade Type Toggle (Thumb-friendly SL / TP) */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Trade Type
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                id="trade-type-tp-button"
                type="button"
                onClick={() => setType("TP")}
                className={`py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  type === "TP"
                    ? "bg-emerald-600 text-white shadow-xs scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                TP (Target)
              </button>
              <button
                id="trade-type-sl-button"
                type="button"
                onClick={() => setType("SL")}
                className={`py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  type === "SL"
                    ? "bg-rose-600 text-white shadow-xs scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                SL (Stop Loss)
              </button>
            </div>
          </div>

          {/* 4. Value */}
          <div>
            <label
              htmlFor="trade-value-input"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1"
            >
              <Hash className="w-3 h-3 text-slate-400" /> Value
            </label>
            <input
              id="trade-value-input"
              type="text"
              inputMode="decimal"
              required
              placeholder="e.g. 60 or 1.5"
              value={value}
              onChange={handleValueChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Submit action */}
        <div className="flex justify-end pt-2">
          <button
            id="trade-form-submit-button"
            type="submit"
            disabled={loading || !value}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50 ${
              type === "TP"
                ? "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white"
                : "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : editingTrade ? (
              <>
                <Check className="w-4 h-4" />
                <span>Update Trade</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Save Trade ({type})</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
