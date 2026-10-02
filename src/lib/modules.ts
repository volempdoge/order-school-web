import { getModules } from "@/lib/notion";
import { reportError } from "@/lib/report-error";

export type ModuleStatus = "триває" | "наступний" | "незабаром початок" | null;

export interface TimelineModule {
  id: string;
  moduleId: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  dateRange: string;
  status: ModuleStatus;
}

interface ModuleRaw {
  id: string;
  moduleId: number;
  title: string;
  dateRange?: string; // Format: "DD.MM-DD.MM" (optional for backward compatibility)
  startDate?: string; // ISO format or parseable date string
  endDate?: string; // ISO format or parseable date string
  description: string;
}

type NormalizedModule = Omit<TimelineModule, "dateRange" | "status">;

const TIME_ZONE = "Europe/Kyiv";

interface CalendarDay {
  year: number;
  month: number; // 1-12
  day: number;
}

// Offset (ms) of Kyiv local time from UTC at a given instant; handles summer time.
function kyivOffset(instant: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - Math.floor(instant / 1000) * 1000;
}

// The instant when a Kyiv wall-clock time happens, regardless of the server's time zone.
function kyivTime({ year, month, day }: CalendarDay, h: number, m: number, sec: number, ms: number): Date {
  const guess = Date.UTC(year, month - 1, day, h, m, sec, ms);
  const first = guess - kyivOffset(guess);
  // Re-check once: the offset may differ on the day summer time switches
  return new Date(guess - kyivOffset(first));
}

const startOfKyivDay = (day: CalendarDay) => kyivTime(day, 0, 0, 0, 0);
const endOfKyivDay = (day: CalendarDay) => kyivTime(day, 23, 59, 59, 999);

/** Calendar parts of an instant as seen in Kyiv. */
function kyivCalendarDay(date: Date): CalendarDay {
  const [year, month, day] = kyivISODate(date).split("-").map(Number) as [number, number, number];
  return { year, month, day };
}

/** YYYY-MM-DD of an instant in Kyiv time (for <time dateTime> and JSON-LD). */
export function kyivISODate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

const DDMM = /^\d{1,2}\.\d{1,2}$/;
const DDMM_RANGE = /^\s*\d{1,2}\.\d{1,2}\s*-\s*\d{1,2}\.\d{1,2}\s*$/;

// Academic year logic: months 1-8 (Jan-Aug) belong to the next calendar year
function parseDDMM(str: string, baseYear: number): CalendarDay | null {
  const [dayPart, monthPart] = str.trim().split(".");
  if (dayPart === undefined || monthPart === undefined) return null;
  const day = parseInt(dayPart, 10);
  const month = parseInt(monthPart, 10);
  if (isNaN(day) || isNaN(month) || month < 1 || month > 12 || day < 1 || day > 31) return null;

  return { year: month < 9 ? baseYear + 1 : baseYear, month, day };
}

// Notion gives "YYYY-MM-DD" for all-day dates, or a full ISO timestamp when a time is set
function parseDate(value: string, baseYear: number, edge: "start" | "end"): Date | null {
  const trimmed = value.trim();
  if (DDMM.test(trimmed)) {
    const day = parseDDMM(trimmed, baseYear);
    return day && (edge === "start" ? startOfKyivDay(day) : endOfKyivDay(day));
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnly) {
    const day = { year: Number(dateOnly[1]), month: Number(dateOnly[2]), day: Number(dateOnly[3]) };
    return edge === "start" ? startOfKyivDay(day) : endOfKyivDay(day);
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeModule(raw: ModuleRaw, baseYear: number): NormalizedModule | null {
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  const rangeStr = raw.dateRange ?? (raw.startDate && DDMM_RANGE.test(raw.startDate) ? raw.startDate : null);
  if (rangeStr) {
    const [from, to, ...rest] = rangeStr.split("-");
    if (from !== undefined && to !== undefined && rest.length === 0) {
      startDate = parseDate(from, baseYear, "start");
      endDate = parseDate(to, baseYear, "end");
    }
  }

  if (!startDate && raw.startDate) startDate = parseDate(raw.startDate, baseYear, "start");
  if (!endDate && raw.endDate) endDate = parseDate(raw.endDate, baseYear, "end");

  if (!startDate) return null;

  // No end date: the module is a single day
  if (!endDate) endDate = endOfKyivDay(kyivCalendarDay(startDate));

  // A DD.MM range that crosses New Year (e.g. 20.12-10.01) ends in the following year
  if (endDate < startDate) {
    const { year, month, day } = kyivCalendarDay(endDate);
    endDate = endOfKyivDay({ year: year + 1, month, day });
  }

  return {
    id: raw.id,
    moduleId: raw.moduleId,
    title: raw.title,
    startDate,
    endDate,
    description: raw.description,
  };
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const format = (d: Date) =>
    d.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", timeZone: TIME_ZONE });
  return `${format(startDate)}–${format(endDate)}`;
}

export function buildTimeline(rawModules: ModuleRaw[], now: Date = new Date()): TimelineModule[] {
  // Academic year starts in September (Kyiv calendar, not the server's)
  const today = kyivCalendarDay(now);
  const baseYear = today.month >= 9 ? today.year : today.year - 1;

  const sorted = rawModules
    .map((raw) => normalizeModule(raw, baseYear))
    .filter((m): m is NormalizedModule => m !== null)
    .sort((a, b) => a.moduleId - b.moduleId);

  const nowTime = now.getTime();

  // CASE A - active module; CASE B - if none is active, the nearest future one
  const activeIndex = sorted.findIndex(
    (m) => nowTime >= m.startDate.getTime() && nowTime <= m.endDate.getTime(),
  );
  const soonIndex = activeIndex === -1 ? sorted.findIndex((m) => m.startDate.getTime() > nowTime) : -1;

  return sorted.map((module, index) => {
    let status: ModuleStatus = null;
    if (activeIndex !== -1) {
      if (index === activeIndex) status = "триває";
      else if (index === activeIndex + 1) status = "наступний";
    } else if (index === soonIndex) {
      status = "незабаром початок";
    }

    return { ...module, status, dateRange: formatDateRange(module.startDate, module.endDate) };
  });
}

/** A module is running or coming up. Otherwise the site announces upcoming courses instead of a schedule. */
export function hasOpenModules(modules: TimelineModule[]): boolean {
  return modules.some((module) => module.status !== null);
}

export interface Timeline {
  modules: TimelineModule[];
  /** Notion could not be reached: show a fallback instead of an empty list */
  unavailable: boolean;
}

// Never throws: the page must still render (and build) when Notion is unavailable.
export async function getTimeline(): Promise<Timeline> {
  try {
    return { modules: buildTimeline(await getModules()), unavailable: false };
  } catch (error) {
    reportError(error, { area: "notion", action: "load-modules" });
    return { modules: [], unavailable: true };
  }
}
