import {
  format,
  parse,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const TIMEZONE = "Asia/Kolkata";

/**
 * Returns current date and time in IST (Asia/Kolkata)
 */
export function getNowIST(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Returns current date string formatted as YYYY-MM-DD in IST
 */
export function getCurrentDateIST(): string {
  const now = getNowIST();
  return format(now, "yyyy-MM-dd");
}

/**
 * Returns current time string formatted as HH:mm (24h) in IST
 */
export function getCurrentTimeIST(): string {
  const now = getNowIST();
  return format(now, "HH:mm");
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Formats YYYY-MM to Month Name + Year (e.g. "October 2026")
 */
export function formatMonthDisplay(monthStr: string): string {
  if (!monthStr || monthStr === "ALL") return "All Recorded Months";
  const parts = monthStr.split("-");
  if (parts.length >= 2) {
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES[monthIdx]} ${parts[0]}`;
    }
  }
  return monthStr;
}

/**
 * Formats YYYY-MM-DD to DD MonthName YYYY (e.g. "30 October 2026")
 */
export function formatDateWithMonthName(dateStr: string): string {
  if (!dateStr) return "";
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = cleanDate.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const monthIdx = parseInt(month, 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day.padStart(2, "0")} ${MONTH_NAMES[monthIdx]} ${year}`;
    }
  }
  return cleanDate;
}

/**
 * Formats YYYY-MM-DD to DD.MM.YYYY (matching client's sheet, e.g. 27.10.2026)
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  // If given an ISO timestamp like 2026-10-27T00:00:00.000Z, extract the YYYY-MM-DD part directly
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = cleanDate.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
  }
  return cleanDate;
}

/**
 * Formats 24h "HH:mm" to 12-hour AM/PM (e.g. "12:25 PM", "01:12 PM")
 */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return "";
  try {
    const dummyDate = parse(timeStr, "HH:mm", new Date());
    return format(dummyDate, "hh:mm a");
  } catch {
    return timeStr;
  }
}

/**
 * Gets week range (Monday to Sunday) containing the given date
 */
export function getWeekRange(dateInput: Date | string = new Date()): {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
} {
  const date = typeof dateInput === "string" ? new Date(dateInput + "T00:00:00") : dateInput;
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return {
    start,
    end,
    startStr: format(start, "yyyy-MM-dd"),
    endStr: format(end, "yyyy-MM-dd"),
  };
}

/**
 * Gets month range (1st to last day) containing the given date
 */
export function getMonthRange(dateInput: Date | string = new Date()): {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
} {
  const date = typeof dateInput === "string" ? new Date(dateInput + "T00:00:00") : dateInput;
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return {
    start,
    end,
    startStr: format(start, "yyyy-MM-dd"),
    endStr: format(end, "yyyy-MM-dd"),
  };
}

/**
 * Gets last 3 months range up to end of current month
 */
export function getLast3MonthsRange(dateInput: Date | string = new Date()): {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
} {
  const date = typeof dateInput === "string" ? new Date(dateInput + "T00:00:00") : dateInput;
  const end = endOfMonth(date);
  const start = startOfMonth(subMonths(date, 2));
  return {
    start,
    end,
    startStr: format(start, "yyyy-MM-dd"),
    endStr: format(end, "yyyy-MM-dd"),
  };
}
