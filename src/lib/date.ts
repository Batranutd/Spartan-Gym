import type { ISODate } from "../data/types";

export const DAY_NAMES = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
export const DAY_SHORT = ["L", "Ma", "Mi", "J", "V", "S", "D"];
export const DAY_ABBR = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

const pad = (n: number) => String(n).padStart(2, "0");

export function iso(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function today(): ISODate {
  return iso(new Date());
}
export function parse(d: ISODate): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}
export function addDays(d: ISODate, n: number): ISODate {
  const x = parse(d);
  x.setDate(x.getDate() + n);
  return iso(x);
}
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((parse(a).getTime() - parse(b).getTime()) / 86400000);
}
/** 0 = luni ... 6 = duminică */
export function weekday(d: ISODate | Date = today()): number {
  const x = typeof d === "string" ? parse(d) : d;
  return (x.getDay() + 6) % 7;
}
export function startOfWeek(d: ISODate = today()): ISODate {
  return addDays(d, -weekday(d));
}
export function fmtDate(d: ISODate | string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  const x = d.length === 10 ? parse(d) : new Date(d);
  return x.toLocaleDateString("ro-RO", opts).replace(/\.$/, "");
}
export function fmtLong(d: ISODate) {
  return fmtDate(d, { day: "numeric", month: "long", year: "numeric" });
}
export function fmtTime(t: string) {
  return new Date(t).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}
export function relDay(d: ISODate): string {
  const n = diffDays(d, today());
  if (n === 0) return "Azi";
  if (n === -1) return "Ieri";
  if (n === 1) return "Mâine";
  return fmtDate(d);
}
export function plural(n: number, one: string, many: string) {
  if (n === 1) return `1 ${one}`;
  // în română: 1 zi, 2-19 zile, 20+ „de zile”
  const mod = n % 100;
  return mod === 0 || mod >= 20 ? `${n} de ${many}` : `${n} ${many}`;
}
export function nowIso() {
  return new Date().toISOString();
}
export function atTime(d: ISODate, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const x = parse(d);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
}

/** Ziua locală (nu UTC) a unui moment ISO */
export function dayOf(at: string): ISODate {
  return iso(new Date(at));
}
