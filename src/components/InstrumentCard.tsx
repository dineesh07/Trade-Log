"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Layers,
  Trash2,
  AlertTriangle,
  Loader2,
  Target,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "./ToastProvider";

interface InstrumentCardProps {
  symbol: string;
  displayName: string;
  market: "FOREX" | "INDIAN";
  strategyCount: number;
  tpValue?: number;
  tpCount?: number;
  slValue?: number;
  slCount?: number;
  totalTrades?: number;
}

export function InstrumentCard({
  symbol,
  displayName,
  market,
  strategyCount,
  tpValue = 0,
  tpCount = 0,
  slValue = 0,
  slCount = 0,
  totalTrades = 0,
}: InstrumentCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/instruments/${symbol.toLowerCase()}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete instrument");
      }

      showToast(`Instrument "${symbol}" and all related records deleted.`, "success");
      setShowDeleteModal(false);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || "Failed to delete instrument", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={() => router.push(`/instrument/${symbol.toLowerCase()}`)}
        className="glass-card group relative block p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/50 transition-all duration-200 shadow-xs hover:shadow-lg cursor-pointer"
      >
        {/* Main Card Content linked to Instrument detail */}
        <Link
          href={`/instrument/${symbol.toLowerCase()}`}
          className="block"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 mb-2">
                {market === "FOREX" ? "Forex" : "Indian Market"}
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {symbol}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {displayName}
              </p>
            </div>

            {/* Action buttons (Delete & Navigate) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all opacity-70 group-hover:opacity-100"
                title={`Delete ${symbol}`}
                aria-label={`Delete ${symbol}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-50 group-hover:translate-x-0.5 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Sub-cards: TP, SL, and Total */}
          <div className="pt-3.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {strategyCount} {strategyCount === 1 ? "strategy" : "strategies"}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                All-Time Records
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* TP */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    TP
                  </span>
                  <div className="p-0.5 rounded-md bg-emerald-50 text-emerald-600 shrink-0">
                    <Target className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-600 tracking-tight truncate">
                    +{tpValue}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                    {tpCount} {tpCount === 1 ? "trade" : "trades"}
                  </p>
                </div>
              </div>

              {/* SL */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    SL
                  </span>
                  <div className="p-0.5 rounded-md bg-rose-50 text-rose-600 shrink-0">
                    <ShieldAlert className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-rose-600 tracking-tight truncate">
                    -{slValue}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                    {slCount} {slCount === 1 ? "trade" : "trades"}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    Total
                  </span>
                  <div className="p-0.5 rounded-md bg-slate-200/70 text-slate-600 shrink-0">
                    <Layers className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight truncate">
                    {totalTrades}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                    Total trades
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(false);
          }}
        >
          <div
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete {symbol}?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-slate-800">{displayName} ({symbol})</span>? All strategies and trade logs associated with this instrument will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Instrument</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
