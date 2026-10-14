import { lazy, Suspense, useMemo } from "react";
import { MUSCLE_GROUPS, type MuscleGroup, type WorkoutLog } from "../../data/types";
import { addDays, today } from "../../lib/date";

const Body3D = lazy(() => import("./Body3D"));

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Câte serii a lucrat fiecare grupă în ultimele 7 zile */
export function weeklySets(logs: WorkoutLog[]) {
  const from = addDays(today(), -6);
  const sets: Record<MuscleGroup, number> = Object.fromEntries(MUSCLE_GROUPS.map((g) => [g, 0])) as Record<MuscleGroup, number>;
  logs
    .filter((l) => l.date >= from)
    .forEach((l) => l.exercises.forEach((e) => (sets[e.group] += e.sets.length)));
  return sets;
}

/** 10+ serii pe săptămână = grupă lucrată complet */
export function heatFrom(sets: Record<MuscleGroup, number>) {
  return Object.fromEntries(MUSCLE_GROUPS.map((g) => [g, Math.min(1, sets[g] / 10)])) as Record<MuscleGroup, number>;
}

export function BodyHeat({ logs, height = 260 }: { logs: WorkoutLog[]; height?: number }) {
  const webgl = useMemo(hasWebGL, []);
  const sets = useMemo(() => weeklySets(logs), [logs]);
  const heat = useMemo(() => heatFrom(sets), [sets]);
  const groups = MUSCLE_GROUPS.filter((g) => g !== "Cardio");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 items-center">
      <div className="relative" style={{ height }}>
        <div className="absolute inset-x-4 bottom-2 h-6 rounded-[50%] bg-volt/10 blur-md" aria-hidden />
        {webgl ? (
          <Suspense fallback={<div className="w-full h-full grid place-items-center text-[13px] text-muted">Se încarcă modelul 3D</div>}>
            <Body3D heat={heat} />
          </Suspense>
        ) : (
          <div className="w-full h-full grid place-items-center text-[13px] text-muted text-center px-2">Telefonul nu afișează 3D. Vezi lista din dreapta.</div>
        )}
      </div>
      <ul className="flex flex-col gap-2.5 min-w-0">
        {groups.map((g) => (
          <li key={g} className="min-w-0">
            <div className="flex justify-between gap-2 text-[13px]">
              <span className="text-text font-medium truncate">{g}</span>
              <span className="text-muted tabular shrink-0">{sets[g]} serii</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-3 mt-1 overflow-hidden">
              <div className="h-full rounded-full bg-volt transition-[width] duration-700" style={{ width: `${heat[g] * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
