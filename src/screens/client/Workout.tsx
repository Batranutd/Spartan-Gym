import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, CheckCircle2, ChevronRight, Dumbbell, History, Medal, Pencil, Plus, Scale, Timer, Trash2, Wrench, X } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Badge, Card, Columns, Empty, LineChart, Ring, Scroll, Segmented, SectionTitle, Stagger, TopBar } from "../../components/ui/kit";
import { Button, IconButton } from "../../components/ui/Button";
import { Sheet } from "../../components/ui/Sheet";
import { NumberBox } from "../../components/ui/NumberBox";
import { Stepper } from "../../components/ui/Stepper";
import { Field } from "../../components/ui/Field";
import { Chip } from "../../components/ui/Chip";
import { GroupPicker } from "../../components/GroupPicker";
import { BodyHeat } from "../../components/three/BodyHeat";
import { toast } from "../../components/ui/Toast";
import { MUSCLE_GROUPS, type ExerciseLog, type MuscleGroup, type WorkoutLog } from "../../data/types";
import { addDays, DAY_NAMES, fmtDate, relDay, startOfWeek, today, weekday } from "../../lib/date";

type View = "azi" | "plan" | "progres";

export function Workout() {
  const [view, setView] = useState<View>("azi");
  return (
    <>
      <TopBar title="Antrenament" />
      <div className="px-4 pb-2 shrink-0">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "azi", label: "Azi" },
            { value: "plan", label: "Săptămâna" },
            { value: "progres", label: "Progres" },
          ]}
        />
      </div>
      <Scroll>
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
            {view === "azi" ? <TodayView /> : view === "plan" ? <WeekView /> : <ProgressView />}
          </motion.div>
        </AnimatePresence>
      </Scroll>
    </>
  );
}

export const volumeOf = (l: WorkoutLog) => l.exercises.reduce((a, e) => a + e.sets.reduce((b, st) => b + st.kg * st.reps, 0), 0);

function lastSetsFor(logs: WorkoutLog[], exercise: string, beforeDate: string) {
  const prev = logs.filter((l) => l.date < beforeDate && l.exercises.some((e) => e.exercise === exercise)).sort((a, b) => b.date.localeCompare(a.date))[0];
  return prev?.exercises.find((e) => e.exercise === exercise) ?? null;
}

function maxKg(logs: WorkoutLog[], exercise: string, beforeDate: string) {
  let m = 0;
  logs.filter((l) => l.date < beforeDate).forEach((l) => l.exercises.forEach((e) => e.exercise === exercise && e.sets.forEach((s) => (m = Math.max(m, s.kg)))));
  return m;
}

/* ------------------------------ AZI ------------------------------ */

function TodayView() {
  const me = useMe();
  const s = useStore();
  const t = today();
  const myLogs = useMemo(() => s.workouts.filter((w) => w.clientId === me.id), [s.workouts, me.id]);
  const log = myLogs.find((w) => w.date === t);
  const groups = log ? log.groups : me.weekPlan[weekday()] ?? [];
  const [pick, setPick] = useState(false);
  const [add, setAdd] = useState(false);
  const [timer, setTimer] = useState(false);

  const ensure = () => s.ensureLog(me.id, t);

  const finish = () => {
    if (!log) return;
    const prs = log.exercises.filter((e) => {
      const best = Math.max(0, ...e.sets.map((x) => x.kg));
      const prev = maxKg(myLogs, e.exercise, t);
      return prev > 0 && best > prev;
    });
    s.setLogDone(log.id, true);
    toast(prs.length ? `Record personal la ${prs.map((p) => p.exercise.toLowerCase()).join(", ")}!` : "Antrenament salvat. Bravo!");
  };

  return (
    <div>
      <Stagger>
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-muted">
                {DAY_NAMES[weekday()]}, {fmtDate(t, { day: "numeric", month: "long" })}
              </div>
              <div className="font-display font-bold text-[20px] text-text mt-0.5 leading-tight">{groups.length ? groups.join(" + ") : "Zi de odihnă"}</div>
              {log && log.groups.join() !== (me.weekPlan[weekday()] ?? []).join() && <p className="text-[13px] text-violet-ink mt-1">Ai schimbat planul pentru azi</p>}
            </div>
            <Button size="sm" variant="secondary" full={false} icon={<Pencil size={15} />} onClick={() => setPick(true)}>
              Schimbă
            </Button>
          </div>
          {log?.done && (
            <div className="mt-3">
              <Badge tone="ok">
                <CheckCircle2 size={14} /> Terminat
              </Badge>
            </div>
          )}
        </Card>
      </Stagger>

      <div className="flex flex-col gap-3 mt-4">
        <AnimatePresence initial={false}>
          {log?.exercises.map((e) => (
            <motion.div key={e.id} layout initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <ExerciseCard logId={log.id} ex={e} prev={lastSetsFor(myLogs, e.exercise, t)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!log?.exercises.length && (
        <Stagger i={1} className="mt-4">
          <Empty
            icon={<Dumbbell size={22} />}
            title={groups.length ? "Notează primul exercițiu" : "Azi e liber în plan"}
            text={groups.length ? "Alege aparatul la care lucrezi. Îți arătăm ce ai ridicat data trecută." : "Dacă vii totuși la sală, adaugă ce lucrezi și se salvează în istoric."}
          />
        </Stagger>
      )}

      <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
        <Button icon={<Plus size={20} />} onClick={() => setAdd(true)}>
          Adaugă exercițiu
        </Button>
        <Button full={false} variant="secondary" aria-label="Cronometru pauză" icon={<Timer size={22} />} onClick={() => setTimer(true)} />
      </div>
      {log && log.exercises.length > 0 && !log.done && (
        <div className="mt-2">
          <Button variant="outline" icon={<CheckCircle2 size={19} />} onClick={finish}>
            Termină antrenamentul
          </Button>
        </div>
      )}

      <GroupPicker
        open={pick}
        title="Ce lucrezi azi?"
        hint="Se schimbă doar pentru azi. Planul săptămânii rămâne același."
        value={groups}
        onClose={() => setPick(false)}
        onSave={(g) => {
          s.setLogGroups(ensure(), g);
          setPick(false);
        }}
      />
      <AddExerciseSheet open={add} onClose={() => setAdd(false)} groups={groups} onAdd={(ex) => s.addExercise(ensure(), ex)} logs={myLogs} />
      <RestTimer open={timer} onClose={() => setTimer(false)} />
    </div>
  );
}

function ExerciseCard({ logId, ex, prev }: { logId: string; ex: ExerciseLog; prev: ExerciseLog | null }) {
  const s = useStore();
  const machine = s.machines.find((m) => m.id === ex.machineId);
  const isCardio = ex.group === "Cardio";
  return (
    <div className="rounded-3xl bg-surface border border-line p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[16px] text-text leading-snug">{ex.exercise}</div>
          <div className="text-[13px] text-muted mt-0.5 truncate">
            {machine?.name ?? "Fără aparat"} · {ex.group}
          </div>
        </div>
        <IconButton label="Șterge exercițiul" onClick={() => s.removeExercise(logId, ex.id)} className="-mr-2 -mt-1.5 text-faint">
          <Trash2 size={18} />
        </IconButton>
      </div>
      {prev && (
        <div className="mt-2 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-surface-3 text-[12px] text-muted">
          <History size={13} /> Data trecută: {prev.sets.map((p) => (isCardio ? `${p.reps} min` : `${p.kg}×${p.reps}`)).join(", ")}
        </div>
      )}
      <div className="mt-3 flex flex-col gap-2">
        <div className="grid grid-cols-[22px_minmax(0,1fr)_minmax(0,1fr)_36px] gap-2 text-[12px] text-muted px-0.5">
          <span>#</span>
          <span className="text-center">{isCardio ? "Intensitate" : "Greutate"}</span>
          <span className="text-center">{isCardio ? "Minute" : "Repetări"}</span>
          <span />
        </div>
        {ex.sets.map((st, i) => (
          <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-[22px_minmax(0,1fr)_minmax(0,1fr)_36px] gap-2 items-center">
            <span className="text-[14px] font-semibold text-muted tabular">{i + 1}</span>
            <NumberBox label={`greutate seria ${i + 1}`} unit={isCardio ? "niv" : "kg"} value={st.kg} step={isCardio ? 1 : 2.5} onChange={(v) => s.setSet(logId, ex.id, i, { kg: v })} />
            <NumberBox label={`repetări seria ${i + 1}`} unit={isCardio ? "min" : undefined} value={st.reps} onChange={(v) => s.setSet(logId, ex.id, i, { reps: v })} />
            <button type="button" aria-label={`Șterge seria ${i + 1}`} onClick={() => s.removeSet(logId, ex.id, i)} className="w-9 h-11 grid place-items-center text-faint">
              <X size={18} />
            </button>
          </motion.div>
        ))}
        <button type="button" onClick={() => s.addSet(logId, ex.id)} className="h-11 rounded-xl border border-dashed border-line-strong text-[14px] font-semibold text-volt inline-flex items-center justify-center gap-1.5">
          <Plus size={16} /> Serie
        </button>
      </div>
    </div>
  );
}

function AddExerciseSheet({ open, onClose, groups, onAdd, logs }: { open: boolean; onClose: () => void; groups: MuscleGroup[]; onAdd: (e: Omit<ExerciseLog, "id">) => void; logs: WorkoutLog[] }) {
  const machines = useStore((s) => s.machines);
  const [filter, setFilter] = useState<MuscleGroup | "toate">("toate");
  const [custom, setCustom] = useState(false);
  const [name, setName] = useState("");
  const [cg, setCg] = useState<MuscleGroup>("Abdomen");
  useEffect(() => {
    if (open) {
      setFilter(groups[0] ?? "toate");
      setCustom(false);
    }
  }, [open, groups]);

  const add = (machineId: string | null, exercise: string, group: MuscleGroup) => {
    const prev = lastSetsFor(logs, exercise, "9999");
    const sets = prev ? prev.sets.map((x) => ({ ...x })) : group === "Cardio" ? [{ kg: 5, reps: 20 }] : [{ kg: 20, reps: 12 }, { kg: 20, reps: 10 }, { kg: 20, reps: 10 }];
    onAdd({ machineId, exercise, group, sets });
    toast(`${exercise} adăugat`);
    onClose();
  };

  const list = machines.filter((m) => filter === "toate" || m.group === filter);
  const chips: (MuscleGroup | "toate")[] = ["toate", ...(groups.length ? groups : []), ...MUSCLE_GROUPS.filter((g) => !groups.includes(g))];

  return (
    <Sheet open={open} onClose={onClose} title={custom ? "Exercițiu fără aparat" : "Alege aparatul"}>
      {!custom ? (
        <>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {chips.map((g) => (
              <div key={g} className="shrink-0">
                <Chip label={g === "toate" ? "Toate" : g} selected={filter === g} onToggle={() => setFilter(g)} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 mt-3">
            {list.map((m) => (
              <div key={m.id} className={`rounded-2xl border p-3 ${m.status === "funcțional" ? "bg-surface-2 border-line" : "bg-surface border-line opacity-80"}`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[15px] text-text flex-1 min-w-0 truncate">{m.name}</span>
                  {m.status === "funcțional" ? <span className="text-[12px] text-muted shrink-0">× {m.count}</span> : <Badge tone="warn"><Wrench size={12} /> Mentenanță</Badge>}
                </div>
                {m.status === "funcțional" && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {m.exercises.map((ex) => (
                      <motion.button key={ex} whileTap={{ scale: 0.95 }} onClick={() => add(m.id, ex, m.group)} className="h-10 px-3.5 rounded-full bg-surface-3 text-[14px] text-text font-medium inline-flex items-center gap-1.5">
                        <Plus size={15} className="text-volt" />
                        {ex}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setCustom(true)} className="w-full mt-3 h-12 rounded-2xl border border-dashed border-line-strong text-[15px] font-semibold text-volt">
            Exercițiu fără aparat
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-4 pb-2">
          <Field label="Denumire" placeholder="De exemplu: flotări" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <div className="text-[14px] text-muted mb-2 font-medium">Grupa</div>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((g) => (
                <Chip key={g} label={g} selected={cg === g} onToggle={() => setCg(g)} />
              ))}
            </div>
          </div>
          <Button onClick={() => name.trim() && add(null, name.trim(), cg)}>Adaugă</Button>
          <Button variant="ghost" onClick={() => setCustom(false)}>
            Înapoi la aparate
          </Button>
        </div>
      )}
    </Sheet>
  );
}

function RestTimer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [total, setTotal] = useState(90);
  const [left, setLeft] = useState<number | null>(null);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      try {
        navigator.vibrate?.([200, 100, 200]);
      } catch {
        /* unele telefoane nu vibrează */
      }
      toast("Pauza s-a terminat. Următoarea serie!");
      setLeft(null);
      return;
    }
    ref.current = window.setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, [left]);
  const mm = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  return (
    <Sheet open={open} onClose={onClose} title="Pauză între serii">
      <div className="flex flex-col items-center pb-3">
        <Ring pct={left === null ? 1 : left / total} size={180} stroke={14}>
          <span className="font-display font-extrabold text-[44px] text-text tabular">{mm(left ?? total)}</span>
        </Ring>
        <div className="grid grid-cols-4 gap-2 w-full mt-5">
          {[60, 90, 120, 180].map((n) => (
            <button key={n} type="button" onClick={() => { setTotal(n); setLeft(null); }} className={`h-11 rounded-xl text-[15px] font-semibold ${total === n ? "bg-volt text-ink" : "bg-surface-2 text-text border border-line"}`}>
              {mm(n)}
            </button>
          ))}
        </div>
        <div className="w-full mt-3">
          {left === null ? <Button onClick={() => setLeft(total)}>Pornește</Button> : <Button variant="secondary" onClick={() => setLeft(null)}>Oprește</Button>}
        </div>
        <p className="text-[13px] text-faint mt-2">Poți închide panoul, cronometrul merge mai departe.</p>
      </div>
    </Sheet>
  );
}

/* ------------------------------ SĂPTĂMÂNA ------------------------------ */

function WeekView() {
  const me = useMe();
  const s = useStore();
  const [edit, setEdit] = useState<number | null>(null);
  const wk = startOfWeek();
  const myLogs = s.workouts.filter((w) => w.clientId === me.id);
  const history = myLogs.filter((w) => w.exercises.length).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);

  return (
    <div>
      <p className="text-[14px] text-muted mb-3 leading-snug">Planul tău pe zile. Atinge o zi ca să schimbi grupele.</p>
      <div className="flex flex-col gap-2">
        {DAY_NAMES.map((d, i) => {
          const date = addDays(wk, i);
          const g = me.weekPlan[i] ?? [];
          const log = myLogs.find((l) => l.date === date);
          const isToday = date === today();
          return (
            <Stagger key={d} i={i}>
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setEdit(i)} className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left border ${isToday ? "bg-surface-2 border-volt/60" : "bg-surface border-line"}`}>
                <span className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 font-display font-bold text-[15px] ${isToday ? "bg-volt text-ink" : "bg-surface-3 text-text"}`}>{d.slice(0, 2)}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-text truncate">{g.length ? g.join(" + ") : "Odihnă"}</span>
                  <span className="block text-[13px] text-muted truncate">
                    {d}
                    {log?.done ? " · terminat" : log?.exercises.length ? " · în lucru" : ""}
                  </span>
                </span>
                {log?.done ? <CheckCircle2 size={20} className="text-ok shrink-0" /> : <ChevronRight size={18} className="text-faint shrink-0" />}
              </motion.button>
            </Stagger>
          );
        })}
      </div>

      <SectionTitle className="mt-7">Istoric</SectionTitle>
      {history.length ? (
        <div className="flex flex-col gap-2">
          {history.map((l) => (
            <div key={l.id} className="rounded-2xl bg-surface border border-line p-3 flex items-center gap-3">
              <div className="w-12 text-center shrink-0">
                <div className="text-[12px] text-muted">{relDay(l.date) === fmtDate(l.date) ? DAY_NAMES[weekday(l.date)].slice(0, 3) : ""}</div>
                <div className="text-[14px] font-semibold text-text">{relDay(l.date)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-text truncate">{l.groups.join(" + ") || "Antrenament"}</div>
                <div className="text-[13px] text-muted truncate">
                  {l.exercises.length} exerciții · {l.exercises.reduce((a, e) => a + e.sets.length, 0)} serii · {(volumeOf(l) / 1000).toFixed(1).replace(".", ",")} t
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-muted">Antrenamentele terminate apar aici.</p>
      )}

      <GroupPicker
        open={edit !== null}
        title={edit !== null ? DAY_NAMES[edit] : ""}
        value={edit !== null ? me.weekPlan[edit] ?? [] : []}
        onClose={() => setEdit(null)}
        onSave={(g) => {
          if (edit !== null) s.setWeekPlan(me.id, edit, g);
          setEdit(null);
        }}
      />
    </div>
  );
}

/* ------------------------------ PROGRES ------------------------------ */

function ProgressView() {
  const me = useMe();
  const s = useStore();
  const nav = useClientNav();
  const [weighOpen, setWeighOpen] = useState(false);
  const [kg, setKg] = useState<number | null>(me.weightKg);
  const myLogs = useMemo(() => s.workouts.filter((w) => w.clientId === me.id), [s.workouts, me.id]);
  const weights = s.weights.filter((w) => w.clientId === me.id).sort((a, b) => a.date.localeCompare(b.date));
  const photos = s.photos.filter((p) => p.clientId === me.id);

  const weeks = Array.from({ length: 6 }, (_, i) => {
    const from = addDays(startOfWeek(), -7 * (5 - i));
    const to = addDays(from, 6);
    const v = myLogs.filter((l) => l.date >= from && l.date <= to).reduce((a, l) => a + volumeOf(l), 0);
    return { label: i === 5 ? "Acum" : fmtDate(from, { day: "numeric", month: "numeric" }).replace(/\.$/, ""), value: Math.round(v / 100) / 10 };
  });

  const prs = useMemo(() => {
    const m = new Map<string, { kg: number; date: string }>();
    myLogs.forEach((l) =>
      l.exercises.forEach((e) => {
        if (e.group === "Cardio") return;
        const best = Math.max(0, ...e.sets.map((x) => x.kg));
        const cur = m.get(e.exercise);
        if (best > 0 && (!cur || best > cur.kg)) m.set(e.exercise, { kg: best, date: l.date });
      }),
    );
    return [...m.entries()].sort((a, b) => b[1].kg - a[1].kg).slice(0, 6);
  }, [myLogs]);

  const delta = weights.length > 1 ? +(weights[weights.length - 1].kg - weights[0].kg).toFixed(1) : 0;

  return (
    <div>
      <Stagger>
        <SectionTitle>Mușchii lucrați în ultimele 7 zile</SectionTitle>
        <Card>
          <BodyHeat logs={myLogs} />
          <p className="text-[12px] text-faint mt-2">Rotește modelul cu degetul. Culoarea se aprinde la 10 serii pe săptămână.</p>
        </Card>
      </Stagger>

      <Stagger i={1} className="mt-6">
        <SectionTitle
          action={
            <Button size="sm" variant="secondary" full={false} icon={<Scale size={15} />} onClick={() => setWeighOpen(true)}>
              Cântărire
            </Button>
          }
        >
          Greutate
        </SectionTitle>
        <Card>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display font-extrabold text-[28px] text-text tabular">{weights.length ? String(weights[weights.length - 1].kg).replace(".", ",") : "–"}</span>
            <span className="text-muted text-[14px]">kg</span>
            {weights.length > 1 && (
              <Badge tone={me.goals.includes("Slăbire") ? (delta <= 0 ? "ok" : "warn") : delta >= 0 ? "ok" : "neutral"} className="ml-auto">
                {delta > 0 ? "+" : ""}
                {String(delta).replace(".", ",")} kg de la început
              </Badge>
            )}
          </div>
          <LineChart points={weights.map((w) => ({ label: fmtDate(w.date), value: w.kg }))} unit="kg" />
        </Card>
      </Stagger>

      <Stagger i={2} className="mt-6">
        <SectionTitle>Volum pe săptămână (tone)</SectionTitle>
        <Card>
          <Columns data={weeks} format={(v) => `${String(v).replace(".", ",")} t`} />
        </Card>
      </Stagger>

      <Stagger i={3} className="mt-6">
        <SectionTitle>Recorduri personale</SectionTitle>
        {prs.length ? (
          <div className="grid grid-cols-2 gap-2">
            {prs.map(([name, v], i) => (
              <motion.div key={name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }} className="rounded-2xl bg-surface border border-line p-3 min-w-0">
                <Medal size={18} className={i === 0 ? "text-warn" : "text-muted"} />
                <div className="font-display font-extrabold text-[22px] text-text mt-1 tabular">{String(v.kg).replace(".", ",")} kg</div>
                <div className="text-[13px] text-muted leading-tight mt-0.5 line-clamp-2">{name}</div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-muted">Notează câteva antrenamente și apar aici.</p>
        )}
      </Stagger>

      <Stagger i={4} className="mt-6">
        <Card onClick={() => nav.push("photos")}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-soft text-violet-ink grid place-items-center shrink-0">
              <Camera size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[16px] text-text">Poze de evoluție</div>
              <div className="text-[13px] text-muted">{photos.length ? `${photos.length} poze · tu alegi cine le vede` : "Prima poză e punctul de pornire"}</div>
            </div>
            <ChevronRight size={20} className="text-faint shrink-0" />
          </div>
        </Card>
      </Stagger>

      <Sheet open={weighOpen} onClose={() => setWeighOpen(false)} title="Cântărirea de azi">
        <div className="flex flex-col gap-4 pb-2">
          <Stepper label="Greutatea" unit="kg" value={kg} placeholder={me.weightKg ?? 75} min={35} max={250} step={0.1} onChange={setKg} />
          <Button
            onClick={() => {
              if (kg) {
                s.addWeight(me.id, kg);
                toast("Greutatea a fost salvată");
              }
              setWeighOpen(false);
            }}
          >
            Salvează
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
