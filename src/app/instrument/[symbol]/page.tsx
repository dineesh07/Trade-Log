"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StrategyCard } from "@/components/StrategyCard";
import { StrategyModal } from "@/components/StrategyModal";
import { useToast } from "@/components/ToastProvider";
import {
  ArrowLeft,
  Plus,
  Loader2,
  FolderOpen,
  Trash2,
  AlertTriangle,
  Globe,
  Landmark,
  Target,
  ShieldAlert,
  Layers,
} from "lucide-react";

interface InstrumentData {
  id: string;
  symbol: string;
  displayName: string;
  market: "FOREX" | "INDIAN";
  tpValue?: number;
  tpCount?: number;
  slValue?: number;
  slCount?: number;
  totalTrades?: number;
}

interface StrategyItem {
  id: string;
  name: string;
  instrumentId: string;
  instrumentSymbol: string;
  instrumentName: string;
  totalTradeCount: number;
  tpValue: number;
  tpCount: number;
  slValue: number;
  slCount: number;
  createdAt: string;
}

export default function InstrumentPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const symbol = (params?.symbol as string)?.toUpperCase();

  const [instrument, setInstrument] = useState<InstrumentData | null>(null);
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStrategies = useCallback(async () => {
    if (!symbol) return;
    try {
      const [stratRes, meRes] = await Promise.all([
        fetch(`/api/instruments/${symbol}/strategies`),
        fetch("/api/auth/me"),
      ]);

      if (stratRes.status === 401 || meRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!stratRes.ok) {
        throw new Error("Failed to load instrument strategies");
      }

      const stratData = await stratRes.json();
      setInstrument(stratData.instrument);
      setStrategies(stratData.strategies);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUserEmail(meData.user?.email);
        setUserName(meData.user?.name);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Error loading strategies", "error");
    } finally {
      setLoading(false);
    }
  }, [symbol, router, showToast]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const handleCreateStrategy = async (name: string) => {
    const res = await fetch("/api/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instrumentSymbol: symbol, name }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create strategy");
    }

    showToast(`Strategy "${name}" created successfully!`, "success");
    await fetchStrategies();
  };

  const handleRenameStrategy = async (name: string) => {
    if (!renameTarget) return;
    const res = await fetch(`/api/strategies/${renameTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to rename strategy");
    }

    showToast(`Strategy renamed to "${name}"`, "success");
    await fetchStrategies();
  };

  const handleDeleteStrategy = async (id: string, name: string) => {
    const res = await fetch(`/api/strategies/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Failed to delete strategy", "error");
      return;
    }

    showToast(`Strategy "${name}" and all trades deleted`, "info");
    await fetchStrategies();
  };

  const handleDeleteInstrument = async () => {
    if (!symbol) return;
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
      router.push("/");
    } catch (err: any) {
      showToast(err.message || "Failed to delete instrument", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header userEmail={userEmail} userName={userName} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {instrument?.market === "FOREX" ? "Forex" : "Indian Market"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-emerald-700 font-bold">
                  {symbol}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {instrument?.displayName || symbol} Strategies
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Instrument</span>
              </button>

              <button
                id="add-strategy-button"
                onClick={() => setIsCreateOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Strategy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Instrument Overview Card */}
        {instrument && (
          <div className="glass-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-xl ${
                    instrument.market === "FOREX"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {instrument.market === "FOREX" ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <Landmark className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    {instrument.displayName} ({instrument.symbol}) Overview
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    All-time cumulative performance across {strategies.length}{" "}
                    {strategies.length === 1 ? "strategy" : "strategies"}
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  instrument.market === "FOREX"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-sky-50 text-sky-700 border border-sky-200"
                }`}
              >
                {instrument.market === "FOREX" ? "Forex" : "Indian"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
              {/* Target (TP) */}
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    Target (TP)
                  </span>
                  <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 tracking-tight truncate">
                    +{instrument.tpValue ?? 0}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    {instrument.tpCount ?? 0}{" "}
                    {(instrument.tpCount ?? 0) === 1 ? "trade" : "trades"}
                  </p>
                </div>
              </div>

              {/* Stop Loss (SL) */}
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    Stop Loss (SL)
                  </span>
                  <div className="p-1 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-extrabold text-rose-600 tracking-tight truncate">
                    -{instrument.slValue ?? 0}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    {instrument.slCount ?? 0}{" "}
                    {(instrument.slCount ?? 0) === 1 ? "trade" : "trades"}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                    Total
                  </span>
                  <div className="p-1 rounded-lg bg-slate-200/70 text-slate-600 shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate">
                    {instrument.totalTrades ?? 0}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    Total trades
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-sm">Loading strategies...</span>
          </div>
        ) : strategies.length === 0 ? (
          /* Empty State */
          <div className="py-20 px-4 rounded-3xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No strategies yet
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Create your first trading strategy (e.g. "5EMA 1:3", "Breakout Pullback") to start journaling trades.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Your First Strategy</span>
            </button>
          </div>
        ) : (
          /* Strategy Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                id={strategy.id}
                name={strategy.name}
                symbol={symbol}
                tradeCount={strategy.totalTradeCount}
                tpValue={strategy.tpValue}
                tpCount={strategy.tpCount}
                slValue={strategy.slValue}
                slCount={strategy.slCount}
                onRename={(id, name) => setRenameTarget({ id, name })}
                onDelete={handleDeleteStrategy}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <StrategyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateStrategy}
        title={`Add Strategy for ${symbol}`}
        submitButtonText="Create Strategy"
      />

      {/* Rename Modal */}
      <StrategyModal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        onSubmit={handleRenameStrategy}
        initialName={renameTarget?.name || ""}
        title="Rename Strategy"
        submitButtonText="Update Name"
      />

      {/* Delete Instrument Confirmation Modal */}
      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsDeleteOpen(false)}
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
                  Are you sure you want to delete <span className="font-semibold text-slate-800">{instrument?.displayName || symbol}</span>? All strategies and trade logs associated with this instrument will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteInstrument}
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
    </div>
  );
}
