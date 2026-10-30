"use client";

import React, { useState } from "react";
import { X, Plus, Loader2, Landmark, Globe, Sparkles } from "lucide-react";
import { useToast } from "./ToastProvider";

interface InstrumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InstrumentModal({
  isOpen,
  onClose,
  onSuccess,
}: InstrumentModalProps) {
  const { showToast } = useToast();
  const [market, setMarket] = useState<"FOREX" | "INDIAN">("FOREX");
  const [symbol, setSymbol] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanSymbol = symbol.trim().toUpperCase().replace(/\s+/g, "");
    const cleanName = displayName.trim();

    if (!cleanSymbol || cleanSymbol.length < 2) {
      setError("Please enter a valid symbol (min. 2 characters, e.g. ETHUSD, USDJPY)");
      return;
    }

    if (!cleanName || cleanName.length < 2) {
      setError("Please enter a display name (e.g. ETH/USD, Crude Oil)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/instruments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market,
          symbol: cleanSymbol,
          displayName: cleanName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create instrument");
      }

      showToast(`Instrument "${cleanSymbol}" added successfully!`, "success");
      setSymbol("");
      setDisplayName("");
      onClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create instrument");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Add New Instrument
              </h3>
              <p className="text-xs text-slate-500">
                Track a new currency, commodity, index or stock
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Market Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Market Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMarket("FOREX")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  market === "FOREX"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Forex & Global</span>
              </button>

              <button
                type="button"
                onClick={() => setMarket("INDIAN")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  market === "INDIAN"
                    ? "bg-sky-50 border-sky-300 text-sky-800 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Landmark className="w-4 h-4 text-sky-600" />
                <span>Indian Market</span>
              </button>
            </div>
          </div>

          {/* Symbol */}
          <div>
            <label
              htmlFor="symbol-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Instrument Symbol
            </label>
            <input
              id="symbol-input"
              type="text"
              required
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder={market === "FOREX" ? "e.g. ETHUSD, GBPUSD, USOIL" : "e.g. FINNIFTY, MIDCPNIFTY"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm font-semibold tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used in URLs and trade records (alphanumeric, no spaces)
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label
              htmlFor="name-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
            >
              Display Name
            </label>
            <input
              id="name-input"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={market === "FOREX" ? "e.g. ETH/USD (Ethereum)" : "e.g. FIN NIFTY"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Instrument</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
