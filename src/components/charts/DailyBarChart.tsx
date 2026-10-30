"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  CartesianGrid,
} from "recharts";
import { DayOutcome } from "@/lib/stats";
import { formatDateDisplay } from "@/lib/dates";

interface DailyBarChartProps {
  data: DayOutcome[];
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No trading days recorded in selected range.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickFormatter={(str) => formatDateDisplay(str).substring(0, 5)}
            stroke="#94a3b8"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={0} stroke="#cbd5e1" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as DayOutcome;
                return (
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs shadow-lg">
                    <div className="font-bold text-slate-800 mb-1">
                      {formatDateDisplay(item.date)}
                    </div>
                    <div className="flex justify-between gap-4 text-emerald-700">
                      <span>Total TP:</span>
                      <span className="font-bold">{item.totalTP}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-rose-700">
                      <span>Total SL:</span>
                      <span className="font-bold">{item.totalSL}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-700 pt-1 border-t border-slate-100">
                      <span>Day Net:</span>
                      <span
                        className={`font-bold ${
                          item.net > 0
                            ? "text-emerald-700"
                            : item.net < 0
                            ? "text-rose-700"
                            : "text-slate-700"
                        }`}
                      >
                        {item.outcome} {item.value} ({item.net > 0 ? `+${item.net}` : item.net})
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="net" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.net > 0
                    ? "#059669"
                    : entry.net < 0
                    ? "#e11d48"
                    : "#64748b"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
