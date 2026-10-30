"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Target,
  ShieldAlert,
  Layers,
  Globe,
  Landmark,
} from "lucide-react";
import { InstrumentModal } from "./InstrumentModal";

interface DashboardOverviewProps {
  forexTpValue: number;
  forexTpCount: number;
  forexSlValue: number;
  forexSlCount: number;
  forexTotalTrades: number;

  indianTpValue: number;
  indianTpCount: number;
  indianSlValue: number;
  indianSlCount: number;
  indianTotalTrades: number;
}

export function DashboardOverview({
  forexTpValue,
  forexTpCount,
  forexSlValue,
  forexSlCount,
  forexTotalTrades,
  indianTpValue,
  indianTpCount,
  indianSlValue,
  indianSlCount,
  indianTotalTrades,
}: DashboardOverviewProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-5">
        {/* Top Header Row with Title and '+ Add Instrument' Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Trading Journal Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Market breakdown showing total TP, SL, and trade count
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>Add Instrument</span>
          </button>
        </div>

        {/* 2 Market Overview Panels: Forex & Indian Market with TP, SL, and Total (No winrate, No net income) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Panel 1: Forex & Global Markets */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    Forex & Global Markets
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Gold, currency pairs & crypto assets
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Forex
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
              {/* Forex TP */}
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
                    +{forexTpValue}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    {forexTpCount} {forexTpCount === 1 ? "trade" : "trades"}
                  </p>
                </div>
              </div>

              {/* Forex SL */}
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
                    -{forexSlValue}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    {forexSlCount} {forexSlCount === 1 ? "trade" : "trades"}
                  </p>
                </div>
              </div>

              {/* Forex Total */}
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
                    {forexTotalTrades}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    Total trades
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Indian Market */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-sky-100 text-sky-700">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    Indian Market
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Nifty, Bank Nifty & benchmark indices
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Indian
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
              {/* Indian TP */}
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
                    +{indianTpValue}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    {indianTpCount} {indianTpCount === 1 ? "trade" : "trades"}
                  </p>
                </div>
              </div>

              {/* Indian SL */}
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
                    -{indianSlValue}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                    {indianSlCount} {indianSlCount === 1 ? "trade" : "trades"}
                  </p>
                </div>
              </div>

              {/* Indian Total */}
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
                    {indianTotalTrades}
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

      {/* Add Instrument Modal */}
      <InstrumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
