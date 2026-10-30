"use client";

import React, { useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { getCurrentDateIST } from "@/lib/dates";
import { DayOutcome } from "@/lib/stats";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface CalendarViewProps {
  dayOutcomes: DayOutcome[];
  onSelectDay: (dateStr: string) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function CalendarView({
  dayOutcomes,
  onSelectDay,
  selectedMonth,
  onMonthChange,
}: CalendarViewProps) {
  const todayStr = getCurrentDateIST();
  const todayDate = useMemo(() => new Date(todayStr + "T00:00:00"), [todayStr]);

  const outcomeMap = useMemo(() => {
    const map = new Map<string, DayOutcome>();
    for (const d of dayOutcomes) {
      map.set(d.date, d);
    }
    return map;
  }, [dayOutcomes]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [selectedMonth]);

  const weekDayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="glass-panel p-3.5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
      {/* Calendar Header */}
      <div className="flex items-center justify-between gap-2 pb-4 sm:pb-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {format(selectedMonth, "MMMM yyyy")}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onMonthChange(new Date())}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 p-0.5">
            <button
              onClick={() => onMonthChange(subMonths(selectedMonth, 1))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMonthChange(addMonths(selectedMonth, 1))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels (Monday First) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-3 sm:mt-4 text-center">
        {weekDayHeaders.map((day) => (
          <div
            key={day}
            className="py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2">
        {calendarDays.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(date, selectedMonth);
          const isToday = isSameDay(date, todayDate);
          const dayOutcome = outcomeMap.get(dateStr);
          const hasTrades = !!dayOutcome && dayOutcome.tradeCount > 0;

          // Determine styling
          let cellStyle = "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-xs";
          let dayNumStyle = isToday ? "font-black text-emerald-700" : "font-semibold text-slate-700";
          let valueStyle = "";
          let labelStyle = "text-slate-500 font-medium";

          if (hasTrades) {
            if (dayOutcome.outcome === "TP") {
              cellStyle = "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-sm";
              dayNumStyle = "font-black text-white";
              valueStyle = "text-white font-black text-sm sm:text-base";
              labelStyle = "text-white font-semibold text-[11px]";
            } else if (dayOutcome.outcome === "SL") {
              cellStyle = "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 shadow-sm";
              dayNumStyle = "font-black text-white";
              valueStyle = "text-white font-black text-sm sm:text-base";
              labelStyle = "text-white font-semibold text-[11px]";
            } else {
              cellStyle = "bg-slate-600 border-slate-600 text-white hover:bg-slate-700 shadow-sm";
              dayNumStyle = "font-black text-white";
              valueStyle = "text-white font-black text-sm";
              labelStyle = "text-white font-semibold text-[11px]";
            }
          }

          if (!isCurrentMonth) {
            cellStyle += " opacity-30";
          }

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDay(dateStr)}
              className={`min-h-[58px] sm:min-h-[85px] p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border flex flex-col justify-between text-left transition-all duration-150 active:scale-95 group relative ${cellStyle} ${
                isToday
                  ? hasTrades
                    ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-white font-bold"
                    : "ring-2 ring-emerald-600 ring-offset-2 ring-offset-white font-bold"
                  : ""
              }`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] sm:text-xs ${dayNumStyle}`}>
                  {format(date, "d")}
                </span>

                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                      hasTrades ? "bg-white" : "bg-emerald-600"
                    }`}
                  />
                )}
              </div>

              {/* Day Outcome result */}
              {hasTrades ? (
                <div className="mt-0.5 sm:mt-1 flex flex-col items-start leading-tight overflow-hidden w-full">
                  <span className={valueStyle}>
                    {dayOutcome.net > 0 ? `+${dayOutcome.net}` : dayOutcome.net}
                  </span>
                  <span className={`${labelStyle} truncate w-full`}>
                    {dayOutcome.outcome} ({dayOutcome.tradeCount})
                  </span>
                </div>
              ) : (
                <div className="h-3 sm:h-4" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 border border-emerald-700 shadow-xs" />
            <span className="font-semibold text-slate-700">Target (TP / Profit)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-600 border border-rose-700 shadow-xs" />
            <span className="font-semibold text-slate-700">Stop Loss (SL / Loss)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-600 border border-slate-700 shadow-xs" />
            <span className="font-semibold text-slate-700">Break-even</span>
          </div>
        </div>
        <div className="text-slate-500 font-medium text-[11px]">
          Click any date to view entries or add trades
        </div>
      </div>
    </div>
  );
}
