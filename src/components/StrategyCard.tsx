"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Target,
  ShieldAlert,
  Layers,
} from "lucide-react";

interface StrategyCardProps {
  id: string;
  name: string;
  symbol: string;
  tradeCount: number;
  tpValue?: number;
  tpCount?: number;
  slValue?: number;
  slCount?: number;
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string, name: string) => Promise<void>;
}

export function StrategyCard({
  id,
  name,
  tradeCount,
  tpValue = 0,
  tpCount = 0,
  slValue = 0,
  slCount = 0,
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

          {/* Sub-cards: TP, SL, and Total */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100">
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
                  {tradeCount}
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                  Total trades
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Open strategy */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all">
            <span>Open Strategy</span>
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
