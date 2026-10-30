"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface TpSlChartProps {
  tpCount: number;
  slCount: number;
}

export function TpSlChart({ tpCount, slCount }: TpSlChartProps) {
  const total = tpCount + slCount;

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No trades recorded to calculate win/loss distribution.
      </div>
    );
  }

  const chartData = [
    { name: "TP (Target)", value: tpCount, color: "#059669" },
    { name: "SL (Stop Loss)", value: slCount, color: "#e11d48" },
  ];

  return (
    <div className="w-full h-72 relative flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return (
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-xs shadow-lg">
                    <div className="font-bold text-slate-900 mb-1">{item.name}</div>
                    <div className="flex justify-between gap-4 text-slate-600">
                      <span>Count:</span>
                      <span className="font-bold text-slate-900">{item.value}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-slate-500">
                      <span>Share:</span>
                      <span className="font-bold text-slate-700">{pct}%</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(val) => <span className="text-xs text-slate-600 font-semibold">{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Donut Total Trades Label */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-2xl font-black tracking-tight text-slate-900">
          {total}
        </div>
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Total Trades
        </div>
      </div>
    </div>
  );
}
