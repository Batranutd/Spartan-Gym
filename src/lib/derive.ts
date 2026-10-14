import type { CheckIn, Client, Subscription } from "../data/types";
import type { Store } from "../store/useStore";
import { addDays, dayOf, diffDays, startOfWeek, today } from "./date";

export interface SubInfo {
  sub: Subscription | null; // abonamentul activ azi (sau cel mai recent)
  active: boolean;
  pending: Subscription | null;
  upcoming: Subscription | null; // plătit, începe după cel curent
  daysLeft: number;
  totalDays: number;
  pct: number; // cât a rămas, 0..1
  state: "activ" | "expiră curând" | "expirat" | "fără abonament";
}

export function subInfo(s: Pick<Store, "subscriptions" | "plans">, clientId: string): SubInfo {
  const t = today();
  const mine = s.subscriptions.filter((x) => x.clientId === clientId);
  const activeNow = mine.find((x) => x.status === "activ" && x.start <= t && x.end >= t) ?? null;
  const pending = mine.find((x) => x.status === "în așteptare") ?? null;
  const upcoming = mine.filter((x) => x.status === "activ" && x.start > t).sort((a, b) => a.start.localeCompare(b.start))[0] ?? null;
  const last = mine.filter((x) => x.status === "activ").sort((a, b) => b.end.localeCompare(a.end))[0] ?? null;
  const sub = activeNow ?? last;
  if (!sub) return { sub: null, active: false, pending, upcoming, daysLeft: 0, totalDays: 0, pct: 0, state: "fără abonament" };
  // zilele rămase includ și abonamentele deja plătite care urmează
  const finalEnd = upcoming && activeNow ? mine.filter((x) => x.status === "activ").reduce((m, x) => (x.end > m ? x.end : m), sub.end) : sub.end;
  const daysLeft = activeNow ? diffDays(finalEnd, t) + 1 : 0;
  const totalDays = diffDays(sub.end, sub.start) + 1;
  const pct = activeNow ? Math.min(1, Math.max(0, (diffDays(sub.end, t) + 1) / totalDays)) : 0;
  const state = !activeNow ? "expirat" : daysLeft <= 5 ? "expiră curând" : "activ";
  return { sub, active: !!activeNow, pending, upcoming, daysLeft, totalDays, pct, state };
}

export const clientCheckIns = (s: Pick<Store, "checkIns">, clientId: string) => s.checkIns.filter((c) => c.clientId === clientId);

export function lastVisit(s: Pick<Store, "checkIns">, clientId: string): string | null {
  const mine = clientCheckIns(s, clientId);
  if (!mine.length) return null;
  return mine.reduce((m, c) => (c.at > m ? c.at : m), mine[0].at);
}

export function visitsBetween(list: CheckIn[], from: string, to: string = today()) {
  return list.filter((c) => {
    const d = dayOf(c.at);
    return d >= from && d <= to;
  }).length;
}

export function monthStart() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Săptămâni consecutive cu cel puțin 2 vizite */
export function streakWeeks(list: CheckIn[]): number {
  let wk = startOfWeek();
  // săptămâna curentă contează doar dacă are deja 2 vizite (încă nu s-a terminat)
  let n = visitsBetween(list, wk, addDays(wk, 6)) >= 2 ? 1 : 0;
  wk = addDays(wk, -7);
  for (let i = 0; i < 52; i++) {
    if (visitsBetween(list, wk, addDays(wk, 6)) >= 2) n++;
    else break;
    wk = addDays(wk, -7);
  }
  return n;
}

export function isAtRisk(s: Pick<Store, "checkIns" | "subscriptions" | "plans">, c: Client) {
  const info = subInfo(s, c.id);
  if (!info.active) return false;
  const lv = lastVisit(s, c.id);
  return !lv || diffDays(today(), dayOf(lv)) >= 12;
}

/** Ocupare estimată acum: check-in-urile din ultimele 90 de minute */
export function occupancy(s: Pick<Store, "checkIns" | "gym">) {
  const now = Date.now();
  const recent = s.checkIns.filter((c) => now - new Date(c.at).getTime() < 90 * 60000 && now >= new Date(c.at).getTime()).length;
  // profil tipic pe ore, folosit când nu sunt destule date
  const h = new Date().getHours();
  const typical = [0, 0, 0, 0, 0, 0, 8, 14, 12, 8, 6, 7, 10, 9, 7, 9, 16, 26, 34, 32, 24, 14, 6, 2][h];
  const people = Math.max(recent, typical);
  const pct = Math.min(1, people / s.gym.capacity);
  const label = pct < 0.35 ? "Liber" : pct < 0.65 ? "Moderat" : "Aglomerat";
  return { people, pct, label };
}

/** Distribuția vizitelor pe ore (pentru graficul orelor de vârf) */
export function hourProfile(list: CheckIn[]) {
  const arr = Array(24).fill(0) as number[];
  list.forEach((c) => arr[new Date(c.at).getHours()]++);
  return arr;
}

export const fullName = (c: { firstName: string; lastName: string } | null | undefined) => (c ? `${c.firstName} ${c.lastName}` : "Client șters");
export const initials = (c: { firstName: string; lastName: string } | null | undefined) => (c ? `${c.firstName[0] ?? ""}${c.lastName[0] ?? ""}`.toUpperCase() : "?");

export function tierOf(lifetime: number) {
  if (lifetime >= 2000) return { name: "Gold", next: null as number | null, color: "#FFC94D" };
  if (lifetime >= 800) return { name: "Silver", next: 2000, color: "#C9D1DE" };
  return { name: "Bronze", next: 800, color: "#D99A6C" };
}

export function lifetimePoints(s: Pick<Store, "points">, clientId: string) {
  return s.points.filter((p) => p.clientId === clientId && p.delta > 0).reduce((a, p) => a + p.delta, 0);
}
