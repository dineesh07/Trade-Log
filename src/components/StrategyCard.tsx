"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { Outcome } from "@/lib/outcome";

interface StrategyCardProps {
  id: string;
  name: string;
  symbol: string;
  tradeCount: number;
  monthOutcome: Outcome;
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string, name: string) => Promise<void>;
}

export function StrategyCard({
  id,
  name,
  tradeCount,
  monthOutcome,
  onRename,
  onDelete,
}: StrategyCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id, name);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div
        onClick={() => router.push(`/strategy/${id}`)}
        className="glass-card group relative p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between shadow-xs cursor-pointer"
      >
        <div>
          {/* Top row: Name & Menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
              {name}
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Strategy options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <div
                    className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 animate-fade-in text-xs font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onRename(id, name);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rename</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        setConfirmDelete(true);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Trade count badge */}
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {tradeCount} total {tradeCount === 1 ? "trade" : "trades"}
            </span>
          </div>
        </div>

        {/* Bottom row: Month Outcome and Open Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              This Month
            </span>
            <div
              className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-xs ${
                monthOutcome.tradeCount === 0
                  ? "bg-slate-100 text-slate-500 border border-slate-200"
                  : monthOutcome.outcome === "TP"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : monthOutcome.outcome === "SL"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {monthOutcome.tradeCount === 0 ? (
                <span>No trades</span>
              ) : (
                <>
                  {monthOutcome.outcome === "TP" && <TrendingUp className="w-3.5 h-3.5" />}
                  {monthOutcome.outcome === "SL" && <TrendingDown className="w-3.5 h-3.5" />}
                  {monthOutcome.outcome === "BE" && <Minus className="w-3.5 h-3.5" />}
                  <span>
                    {monthOutcome.outcome} {monthOutcome.value}
                  </span>
                </>
              )}
            </div>
          </div>

          <div
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all"
          >
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        >
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
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{name}"</span>?
              All recorded trades under this strategy will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Strategy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
