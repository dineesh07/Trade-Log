import { describe, it, expect } from "vitest";
import {
  formatDateDisplay,
  formatTimeDisplay,
  formatMonthDisplay,
  formatDateWithMonthName,
  getWeekRange,
  getMonthRange,
} from "./dates";

describe("date helpers", () => {
  it("formats date YYYY-MM-DD to DD.MM.YYYY", () => {
    expect(formatDateDisplay("2026-10-27")).toBe("27.10.2026");
    expect(formatDateDisplay("2026-05-04")).toBe("04.05.2026");
  });

  it("formats time 24h to 12h AM/PM", () => {
    expect(formatTimeDisplay("12:25")).toBe("12:25 PM");
    expect(formatTimeDisplay("13:12")).toBe("01:12 PM");
    expect(formatTimeDisplay("03:56")).toBe("03:56 AM");
    expect(formatTimeDisplay("15:56")).toBe("03:56 PM");
    expect(formatTimeDisplay("21:08")).toBe("09:08 PM");
  });

  it("calculates Monday-to-Sunday week range", () => {
    // 2026-10-27 is a Tuesday
    const range = getWeekRange("2026-10-27");
    expect(range.startStr).toBe("2026-10-26"); // Monday
    expect(range.endStr).toBe("2026-11-01"); // Sunday
  });

  it("calculates full month range", () => {
    const range = getMonthRange("2026-10-27");
    expect(range.startStr).toBe("2026-10-01");
    expect(range.endStr).toBe("2026-10-31");
  });

  it("formats date YYYY-MM-DD to DD MonthName YYYY", () => {
    expect(formatDateWithMonthName("2026-10-27")).toBe("27 October 2026");
    expect(formatDateWithMonthName("2026-05-04")).toBe("04 May 2026");
  });

  it("formats month YYYY-MM to MonthName YYYY", () => {
    expect(formatMonthDisplay("2026-10")).toBe("October 2026");
    expect(formatMonthDisplay("2026-01")).toBe("January 2026");
    expect(formatMonthDisplay("ALL")).toBe("All Recorded Months");
  });
});
