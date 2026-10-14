import { useState } from "react";
import { CalendarX2, Plus, Trash2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useTrainerNav } from "../../lib/nav";
import { useTrainer } from "./TrainerApp";
import { Avatar, Badge, Card, Scroll, Segmented, SectionTitle, Stagger, TopBar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { toast } from "../../components/ui/Toast";
import { TimeSelect } from "../onboarding/Staff";
import { addDays, DAY_ABBR, DAY_NAMES, fmtDate, relDay, today, weekday } from "../../lib/date";
import { fullName } from "../../lib/derive";
import type { Availability } from "../../data/types";

const HOURS = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

export function TrainerSchedule() {
  const t = useTrainer();
  const s = useStore();
  const nav = useTrainerNav();
  const [view, setView] = useState<"programari" | "disponibilitate">("programari");
  const [av, setAv] = useState<Availability[]>(t.availability);
  const [absent, setAbsent] = useState(addDays(today(), 1));
  const upcoming = s.bookings.filter((b) => b.trainerId === t.id && b.date >= today() && b.status !== "anulată").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i));

  const setDay = (day: number, on: boolean) => setAv(on ? [...av.filter((a) => a.day !== day), { day, from: "08:00", to: "14:00" }].sort((a, b) => a.day - b.day) : av.filter((a) => a.day !== day));
  const patch = (day: number, p: Partial<Availability>) => setAv(av.map((a) => (a.day === day ? { ...a, ...p } : a)));

  return (
    <>
      <TopBar title="Program" />
      <div className="px-4 pb-2 shrink-0">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "programari", label: "Programări" },
            { value: "disponibilitate", label: "Disponibilitate" },
          ]}
        />
      </div>
      <Scroll>
        {view === "programari" ? (
          <div className="flex flex-col gap-4">
            {days.map((d, i) => {
              const list = upcoming.filter((b) => b.date === d);
              const off = t.absentDates.includes(d);
              const works = t.availability.some((a) => a.day === weekday(d));
              if (!list.length && !(i < 7)) return null;
              return (
                <Stagger key={d} i={Math.min(i, 8)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-[15px] text-text">{relDay(d) === fmtDate(d) ? DAY_NAMES[weekday(d)] : relDay(d)}</span>
                    <span className="text-[13px] text-muted">{fmtDate(d, { day: "numeric", month: "long" })}</span>
                    {off ? <Badge tone="danger">Lipsă</Badge> : !works ? <Badge>Liber</Badge> : null}
                  </div>
                  {list.length ? (
                    <Card className="py-1">
                      {list.map((b, k) => {
                        const c = s.clients.find((x) => x.id === b.clientId);
                        return (
                          <button key={b.id} type="button" onClick={() => c && nav.push("client", { id: c.id })} className={`w-full flex items-center gap-3 py-2.5 text-left ${k ? "border-t border-line" : ""}`}>
                            <span className="w-12 font-display font-bold text-[15px] text-text tabular shrink-0">{b.time}</span>
                            <Avatar name={fullName(c)} photo={c?.photo} size={32} id={b.clientId} />
                            <span className="flex-1 min-w-0 text-[14px] text-text truncate">{fullName(c)}</span>
                            <Badge tone={b.status === "confirmată" ? "ok" : b.status === "efectuată" ? "neutral" : "warn"}>{b.status === "cerută" ? "De confirmat" : b.status === "confirmată" ? "Confirmată" : "Efectuată"}</Badge>
                          </button>
                        );
                      })}
                    </Card>
                  ) : (
                    <p className="text-[13px] text-faint">Nicio programare</p>
                  )}
                </Stagger>
              );
            })}
          </div>
        ) : (
          <div>
            <SectionTitle>Orele pe zile</SectionTitle>
            <div className="flex flex-col gap-2">
              {DAY_NAMES.map((d, i) => {
                const a = av.find((x) => x.day === i);
                return (
                  <div key={d} className={`rounded-2xl border p-3 ${a ? "bg-surface border-line" : "bg-transparent border-line border-dashed"}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[15px] text-text flex-1">{d}</span>
                      <button type="button" role="switch" aria-checked={!!a} aria-label={`Lucrez ${d.toLowerCase()}`} onClick={() => setDay(i, !a)} className={`w-[52px] h-8 rounded-full p-1 shrink-0 transition-colors ${a ? "bg-volt" : "bg-surface-3 border border-line-strong"}`}>
                        <span className={`block w-6 h-6 rounded-full transition-transform ${a ? "bg-ink translate-x-5" : "bg-muted"}`} />
                      </button>
                    </div>
                    {a && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <TimeSelect label="De la" value={a.from} onChange={(v) => patch(i, { from: v })} options={HOURS} />
                        <TimeSelect label="Până la" value={a.to} onChange={(v) => patch(i, { to: v })} options={HOURS.filter((h) => h > a.from)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3">
              <Button onClick={() => (s.setAvailability(t.id, av), toast("Programul a fost salvat"))}>Salvează programul</Button>
            </div>

            <SectionTitle className="mt-7">Zile în care lipsești</SectionTitle>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {Array.from({ length: 21 }, (_, i) => addDays(today(), i)).map((d) => (
                <button key={d} type="button" onClick={() => setAbsent(d)} className={`shrink-0 w-14 h-16 rounded-2xl flex flex-col items-center justify-center border ${absent === d ? "bg-volt text-ink border-volt" : "bg-surface text-text border-line"}`}>
                  <span className={`text-[12px] font-semibold ${absent === d ? "text-ink" : "text-muted"}`}>{DAY_ABBR[weekday(d)]}</span>
                  <span className="font-display font-bold text-[18px]">{parseInt(d.slice(8))}</span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Button
                variant="secondary"
                icon={<Plus size={18} />}
                onClick={() => {
                  if (t.absentDates.includes(absent)) return toast("Ziua e deja marcată", "info");
                  s.updateTrainer(t.id, { absentDates: [...t.absentDates, absent].sort() });
                  toast(`Marcat: lipsești ${fmtDate(absent, { day: "numeric", month: "long" })}`);
                }}
              >
                Marchează că lipsesc pe {fmtDate(absent)}
              </Button>
            </div>
            <div className="flex flex-col gap-2 mt-3">
              {t.absentDates
                .filter((d) => d >= today())
                .map((d) => (
                  <div key={d} className="flex items-center gap-3 rounded-2xl bg-surface border border-line px-3 py-2">
                    <CalendarX2 size={18} className="text-danger shrink-0" />
                    <span className="flex-1 text-[14px] text-text">{fmtDate(d, { weekday: "long", day: "numeric", month: "long" })}</span>
                    <button type="button" aria-label="Șterge ziua" onClick={() => s.updateTrainer(t.id, { absentDates: t.absentDates.filter((x) => x !== d) })} className="w-10 h-10 grid place-items-center text-faint">
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Scroll>
    </>
  );
}
