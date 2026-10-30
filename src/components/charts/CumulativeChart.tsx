"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { CumulativePoint } from "@/lib/stats";
import { formatDateDisplay } from "@/lib/dates";

interface CumulativeChartProps {
  data: CumulativePoint[];
}

export function CumulativeChart({ data }: CumulativeChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No trades recorded in selected range to plot cumulative chart.
      </div>
    );
  }

  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.cumulative), 0);
    const dataMin = Math.min(...data.map((i) => i.cumulative), 0);

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="#10b981" stopOpacity={0.3} />
              <stop offset={off} stopColor="#f43f5e" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="#059669" stopOpacity={1} />
              <stop offset={off} stopColor="#e11d48" stopOpacity={1} />
            </linearGradient>
          </defs>

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
          <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CumulativePoint;
                return (
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs shadow-lg">
                    <div className="font-bold text-slate-800 mb-1">
                      {formatDateDisplay(item.date)}
                    </div>
                    <div className="flex justify-between gap-4 text-slate-600">
                      <span>Daily:</span>
                      <span
                        className={`font-bold ${
                          item.daily > 0
                            ? "text-emerald-700"
                            : item.daily < 0
                            ? "text-rose-700"
                            : "text-slate-700"
                        }`}
                      >
                        {item.daily > 0 ? `+${item.daily}` : item.daily}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-600 pt-1 border-t border-slate-100">
                      <span>Cumulative:</span>
                      <span
                        className={`font-bold ${
                          item.cumulative > 0
                            ? "text-emerald-700"
                            : item.cumulative < 0
                            ? "text-rose-700"
                            : "text-slate-700"
                        }`}
                      >
                        {item.cumulative > 0 ? `+${item.cumulative}` : item.cumulative}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="url(#splitStroke)"
            fill="url(#splitColor)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
