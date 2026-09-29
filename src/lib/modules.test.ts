import { describe, expect, it } from "vitest";

import { buildTimeline, kyivISODate } from "./modules";

const raw = (moduleId: number, startDate: string, endDate: string) => ({
  id: `m${moduleId}`,
  moduleId,
  title: `Модуль ${moduleId}`,
  description: "",
  startDate,
  endDate,
});

describe("buildTimeline", () => {
  const modules = [
    raw(3, "2026-11-01", "2026-11-14"),
    raw(1, "2026-10-01", "2026-10-14"),
    raw(2, "2026-10-15", "2026-10-28"),
  ];

  it("sorts modules by module id", () => {
    const result = buildTimeline(modules, new Date("2026-09-01T12:00:00Z"));
    expect(result.map((m) => m.moduleId)).toEqual([1, 2, 3]);
  });

  it("marks the running module and the one after it", () => {
    const result = buildTimeline(modules, new Date("2026-10-20T12:00:00Z"));
    expect(result.map((m) => m.status)).toEqual([null, "триває", "наступний"]);
  });

  it("marks the nearest upcoming module when nothing is running", () => {
    const result = buildTimeline(modules, new Date("2026-09-15T12:00:00Z"));
    expect(result.map((m) => m.status)).toEqual(["незабаром початок", null, null]);
  });

  it("has no statuses after the last module", () => {
    const result = buildTimeline(modules, new Date("2027-01-01T12:00:00Z"));
    expect(result.every((m) => m.status === null)).toBe(true);
  });

  it("formats the date range as DD.MM-DD.MM", () => {
    const [first] = buildTimeline(modules, new Date("2026-09-01T12:00:00Z"));
    expect(first?.dateRange).toBe("01.10–14.10");
  });

  it("parses DD.MM ranges into the current academic year", () => {
    // September 2026 → academic year 2026/27: January belongs to 2027
    const [module] = buildTimeline(
      [{ id: "x", moduleId: 1, title: "", description: "", dateRange: "20.01-02.02" }],
      new Date("2026-09-10T12:00:00Z"),
    );
    expect(module && kyivISODate(module.startDate)).toBe("2027-01-20");
    expect(module && kyivISODate(module.endDate)).toBe("2027-02-02");
    expect(module?.dateRange).toBe("20.01–02.02");
  });

  it("wraps a DD.MM range that crosses New Year", () => {
    const [module] = buildTimeline(
      [{ id: "x", moduleId: 1, title: "", description: "", dateRange: "20.12-10.01" }],
      new Date("2026-09-10T12:00:00Z"),
    );
    expect(module && kyivISODate(module.startDate)).toBe("2026-12-20");
    expect(module && kyivISODate(module.endDate)).toBe("2027-01-10");
  });

  it("drops modules without a valid start date", () => {
    const result = buildTimeline([raw(1, "not a date", "")], new Date());
    expect(result).toEqual([]);
  });

  it("treats a module without an end date as a single day", () => {
    const [module] = buildTimeline([raw(1, "2026-10-01", "")], new Date("2026-09-01T12:00:00Z"));
    expect(module && kyivISODate(module.endDate)).toBe("2026-10-01");
  });
});

describe("module days follow Kyiv time, not the server's UTC clock", () => {
  // 01.10–14.10.2026; Kyiv is UTC+3 until the last Sunday of October
  const modules = [raw(1, "2026-10-01", "2026-10-14"), raw(2, "2026-10-15", "2026-10-28")];
  const statusAt = (iso: string) => buildTimeline(modules, new Date(iso)).map((m) => m.status);

  it("is running on the last day, late in the evening", () => {
    expect(statusAt("2026-10-14T20:30:00Z")).toEqual(["триває", "наступний"]); // 23:30 in Kyiv
  });

  it("is running from the first minute of the first day", () => {
    expect(statusAt("2026-09-30T21:05:00Z")).toEqual(["триває", "наступний"]); // 00:05 on Oct 1 in Kyiv
  });

  it("is over right after midnight in Kyiv", () => {
    expect(statusAt("2026-10-14T21:05:00Z")).toEqual([null, "триває"]); // 00:05 on Oct 15 in Kyiv
  });

  it("handles the switch to winter time (UTC+2) on Oct 25", () => {
    const [, second] = buildTimeline(modules, new Date("2026-10-28T21:30:00Z")); // 23:30 on Oct 28, UTC+2
    expect(second?.status).toBe("триває");
    expect(buildTimeline(modules, new Date("2026-10-28T22:05:00Z"))[1]?.status).toBeNull(); // 00:05 on Oct 29
  });

  it("uses Kyiv dates for the date range and machine-readable dates", () => {
    const [first] = buildTimeline(modules, new Date("2026-09-01T12:00:00Z"));
    expect(first?.dateRange).toBe("01.10–14.10");
    expect(first && kyivISODate(first.startDate)).toBe("2026-10-01");
    expect(first && kyivISODate(first.endDate)).toBe("2026-10-14");
  });

  it("keeps the exact instant when Notion sends a time", () => {
    const [module] = buildTimeline(
      [raw(1, "2026-10-01T18:00:00.000+03:00", "2026-10-01T20:00:00.000+03:00")],
      new Date("2026-10-01T16:00:00Z"),
    );
    expect(module?.status).toBe("триває");
  });
});
