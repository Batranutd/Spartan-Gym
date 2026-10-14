import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Barcode, ChevronLeft, ChevronRight, FileText, Info, Keyboard, Loader2, PenLine, Plus, ScanLine, Search, Trash2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useMe } from "./useMe";
import { Bar, Card, Ring, Scroll, Segmented, Stagger, TopBar, CountUp } from "../../components/ui/kit";
import { Button, IconButton } from "../../components/ui/Button";
import { Sheet } from "../../components/ui/Sheet";
import { Field } from "../../components/ui/Field";
import { NumberBox } from "../../components/ui/NumberBox";
import { toast } from "../../components/ui/Toast";
import { MEALS, type FoodEntry, type FoodItem, type Meal } from "../../data/types";
import { addDays, relDay, today } from "../../lib/date";
import { decodeBarcodeFromFile, findByBarcode, lookupOpenFoodFacts, macrosFor, ocrLabel, searchFoods, targetFor, type LabelValues } from "../../lib/nutrition";

const fmt1 = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

export function Nutrition() {
  const me = useMe();
  const s = useStore();
  const [date, setDate] = useState(today());
  const [addTo, setAddTo] = useState<Meal | null>(null);
  const entries = s.foods.filter((f) => f.clientId === me.id && f.date === date);
  const target = targetFor(me);
  const sum = entries.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });
  const left = target.kcal - sum.kcal;

  const defaultMeal = (): Meal => {
    const h = new Date().getHours();
    return h < 11 ? "Mic dejun" : h < 16 ? "Prânz" : h < 21 ? "Cină" : "Gustări";
  };

  return (
    <>
      <TopBar
        title="Nutriție"
        right={
          <div className="flex items-center gap-0.5 shrink-0">
            <IconButton label="Ziua anterioară" onClick={() => setDate(addDays(date, -1))}>
              <ChevronLeft size={22} />
            </IconButton>
            <span className="text-[14px] font-semibold text-text w-14 text-center">{relDay(date)}</span>
            <IconButton label="Ziua următoare" onClick={() => date < today() && setDate(addDays(date, 1))} className={date >= today() ? "opacity-30" : ""}>
              <ChevronRight size={22} />
            </IconButton>
          </div>
        }
      />
      <Scroll>
        <Stagger>
          <Card>
            <div className="flex items-center gap-4">
              <Ring pct={sum.kcal / target.kcal} size={128} stroke={12} color={left < 0 ? "var(--color-warn)" : "var(--color-volt)"}>
                <div>
                  <CountUp value={Math.abs(left)} className="font-display font-extrabold text-[28px] leading-none text-text" />
                  <div className="text-[12px] text-muted mt-1">{left >= 0 ? "kcal rămase" : "kcal peste"}</div>
                </div>
              </Ring>
              <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                {[
                  { k: "Proteine", v: sum.p, t: target.p, c: "bg-volt" },
                  { k: "Carbohidrați", v: sum.c, t: target.c, c: "bg-violet-ink" },
                  { k: "Grăsimi", v: sum.f, t: target.f, c: "bg-warn" },
                ].map((m) => (
                  <div key={m.k}>
                    <div className="flex justify-between gap-2 text-[13px]">
                      <span className="text-text font-medium">{m.k}</span>
                      <span className="text-muted tabular">
                        {Math.round(m.v)}/{m.t} g
                      </span>
                    </div>
                    <Bar pct={m.v / m.t} color={m.c} className="h-1.5 mt-1" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[12px] text-faint">
              <Info size={13} className="shrink-0" />
              <span>
                Mâncat {sum.kcal} din {target.kcal} kcal. Țintă orientativă, calculată din profil.
              </span>
            </div>
          </Card>
        </Stagger>

        <Stagger i={1} className="grid grid-cols-2 gap-2 mt-3">
          <Button size="md" icon={<ScanLine size={19} />} onClick={() => setAddTo(defaultMeal())}>
            Scanează
          </Button>
          <Button size="md" variant="secondary" icon={<Search size={18} />} onClick={() => setAddTo(defaultMeal())}>
            Caută aliment
          </Button>
        </Stagger>

        <div className="flex flex-col gap-3 mt-5">
          {MEALS.map((meal, i) => {
            const list = entries.filter((e) => e.meal === meal);
            const k = list.reduce((a, e) => a + e.kcal, 0);
            return (
              <Stagger key={meal} i={i + 2}>
                <div className="rounded-3xl bg-surface border border-line">
                  <div className="flex items-center gap-2 pl-4 pr-2 py-2">
                    <span className="font-semibold text-[16px] text-text flex-1">{meal}</span>
                    <span className="text-[14px] text-muted tabular">{k} kcal</span>
                    <IconButton label={`Adaugă la ${meal}`} onClick={() => setAddTo(meal)} className="text-volt">
                      <Plus size={22} />
                    </IconButton>
                  </div>
                  <AnimatePresence initial={false}>
                    {list.map((e) => (
                      <motion.div key={e.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-line">
                        <div className="flex items-center gap-2 pl-4 pr-1.5 py-2.5">
                          <div className="flex-1 min-w-0">
                            <div className="text-[15px] text-text truncate">{e.name}</div>
                            <div className="text-[12px] text-muted tabular">
                              {e.grams} g · P {fmt1(e.p)} · C {fmt1(e.c)} · G {fmt1(e.f)}
                            </div>
                          </div>
                          <span className="text-[14px] font-semibold text-text tabular shrink-0">{e.kcal}</span>
                          <IconButton label={`Șterge ${e.name}`} onClick={() => s.removeFood(e.id)} className="text-faint">
                            <Trash2 size={17} />
                          </IconButton>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Stagger>
            );
          })}
        </div>
      </Scroll>

      <AddFoodSheet meal={addTo} date={date} onClose={() => setAddTo(null)} />
    </>
  );
}

type Step = "method" | "scan" | "label" | "search" | "manual" | "amount";

function AddFoodSheet({ meal, date, onClose }: { meal: Meal | null; date: string; onClose: () => void }) {
  const me = useMe();
  const s = useStore();
  const [step, setStep] = useState<Step>("method");
  const [m, setM] = useState<Meal>("Prânz");
  const [food, setFood] = useState<FoodItem | null>(null);
  const [source, setSource] = useState<FoodEntry["source"]>("căutare");
  const [busy, setBusy] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [lastMeal, setLastMeal] = useState<Meal | null>(null);
  if (meal && meal !== lastMeal) {
    setLastMeal(meal);
    setM(meal);
    setStep("method");
    setFood(null);
    setCode("");
  }
  if (!meal && lastMeal) setLastMeal(null);

  const recents = useMemo(() => {
    const seen = new Set<string>();
    return s.foods
      .filter((f) => f.clientId === me.id)
      .reverse()
      .filter((f) => !seen.has(f.foodId) && seen.add(f.foodId))
      .slice(0, 5);
  }, [s.foods, me.id]);

  const resolveCode = async (c: string) => {
    setBusy("Caut produsul…");
    const local = findByBarcode(c) ?? s.customFoods.find((f) => f.barcode === c);
    const found = local ?? (await lookupOpenFoodFacts(c));
    setBusy(null);
    if (found) {
      if (!local) s.saveCustomFood(found);
      setFood(found);
      setSource("cod de bare");
      setStep("amount");
      toast(`Găsit: ${found.name}`);
    } else {
      setCode(c);
      setStep("label");
      toast("Produsul nu e în baza de date. Fotografiază eticheta nutrițională.", "info");
    }
  };

  const titles: Record<Step, string> = {
    method: `Adaugă la ${m.toLowerCase()}`,
    scan: "Codul de bare",
    label: "Eticheta nutrițională",
    search: "Caută aliment",
    manual: "Introdu manual",
    amount: "Cât ai mâncat?",
  };

  return (
    <Sheet open={!!meal} onClose={onClose} title={titles[step]}>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }} className="pb-2">
          {step === "method" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { k: "scan" as Step, icon: <Barcode size={24} />, t: "Cod de bare", d: "Cel mai rapid", hi: true },
                  { k: "label" as Step, icon: <FileText size={24} />, t: "Etichetă", d: "Poză la tabel" },
                  { k: "search" as Step, icon: <Search size={24} />, t: "Caută", d: "Alimente uzuale" },
                  { k: "manual" as Step, icon: <PenLine size={24} />, t: "Manual", d: "Scrii valorile" },
                ].map((x) => (
                  <motion.button key={x.k} whileTap={{ scale: 0.96 }} onClick={() => setStep(x.k)} className={`rounded-2xl p-3.5 text-left border ${x.hi ? "bg-volt text-ink border-volt" : "bg-surface-2 text-text border-line"}`}>
                    {x.icon}
                    <span className="block font-semibold text-[15px] mt-2">{x.t}</span>
                    <span className={`block text-[13px] ${x.hi ? "text-ink/75" : "text-muted"}`}>{x.d}</span>
                  </motion.button>
                ))}
              </div>
              {recents.length > 0 && (
                <div className="mt-2">
                  <div className="text-[14px] text-muted mb-1 font-medium">Recente</div>
                  {recents.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        const f = searchFoods("", s.customFoods).find((x) => x.id === r.foodId) ?? { id: r.foodId, name: r.name, per100: { kcal: (r.kcal / r.grams) * 100, p: (r.p / r.grams) * 100, c: (r.c / r.grams) * 100, f: (r.f / r.grams) * 100 } };
                        setFood(f);
                        setSource("căutare");
                        setStep("amount");
                      }}
                      className="w-full flex items-center gap-3 py-2.5 text-left border-b border-line last:border-0"
                    >
                      <span className="flex-1 min-w-0 text-[15px] text-text truncate">{r.name}</span>
                      <span className="text-[13px] text-muted tabular shrink-0">{r.grams} g</span>
                      <Plus size={18} className="text-volt shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "scan" && <ScanStep busy={busy} onCode={resolveCode} onBack={() => setStep("method")} />}

          {step === "label" && (
            <LabelStep
              barcode={code}
              onBack={() => setStep("method")}
              onDone={(f) => {
                s.saveCustomFood(f);
                setFood(f);
                setSource("etichetă");
                setStep("amount");
              }}
            />
          )}

          {step === "search" && (
            <SearchStep
              extra={s.customFoods}
              onPick={(f) => {
                setFood(f);
                setSource("căutare");
                setStep("amount");
              }}
            />
          )}

          {step === "manual" && (
            <ManualStep
              onAdd={(v) => {
                s.addFood({ clientId: me.id, date, meal: m, foodId: `manual-${Date.now()}`, name: v.name, grams: v.grams, kcal: v.kcal, p: v.p, c: v.c, f: v.f, source: "manual" });
                toast(`${v.name} adăugat la ${m.toLowerCase()}`);
                onClose();
              }}
            />
          )}

          {step === "amount" && food && (
            <AmountStep
              food={food}
              meal={m}
              onMeal={setM}
              onAdd={(g) => {
                s.addFood({ clientId: me.id, date, meal: m, foodId: food.id, name: food.name, grams: g, ...macrosFor(food, g), source });
                toast(`${food.name} adăugat la ${m.toLowerCase()}`);
                onClose();
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Sheet>
  );
}

function ScanStep({ busy, onCode, onBack }: { busy: string | null; onCode: (c: string) => void; onBack: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const onFile = async (f?: File) => {
    if (!f) return;
    setMsg(null);
    setReading(true);
    const c = await decodeBarcodeFromFile(f);
    setReading(false);
    if (c) onCode(c);
    else setMsg("Nu am putut citi codul. Apropie telefonul, cu codul drept și bine luminat, sau scrie cifrele de sub cod.");
  };
  return (
    <div className="flex flex-col gap-4">
      <motion.button whileTap={{ scale: 0.98 }} onClick={() => ref.current?.click()} className="relative h-44 rounded-3xl bg-surface-2 border border-line overflow-hidden grid place-items-center">
        <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-line-strong" aria-hidden />
        <motion.div className="absolute left-8 right-8 h-[3px] rounded-full bg-volt" animate={{ top: ["22%", "78%", "22%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} aria-hidden />
        <span className="relative flex flex-col items-center gap-2">
          {reading || busy ? <Loader2 size={30} className="text-volt animate-spin" /> : <Barcode size={34} className="text-text" />}
          <span className="text-[15px] font-semibold text-text">{busy ?? (reading ? "Citesc codul…" : "Fă o poză la codul de bare")}</span>
        </span>
      </motion.button>
      <input ref={ref} type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")} accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {msg && <p className="text-[14px] text-warn leading-snug">{msg}</p>}
      <div className="flex gap-2 items-end">
        <Field className="flex-1 min-w-0" label="Sau scrie codul" inputMode="numeric" placeholder="594…" prefix={<Keyboard size={18} />} value={typed} onChange={(e) => setTyped(e.target.value.replace(/\D/g, "").slice(0, 14))} />
        <Button full={false} size="lg" onClick={() => typed.length >= 8 && onCode(typed)}>
          Caută
        </Button>
      </div>
      <p className="text-[13px] text-faint leading-snug">Produsele de la barul sălii au coduri proprii. Demo: încearcă 2000000000024 (baton proteic).</p>
      <Button variant="ghost" onClick={onBack}>
        Altă metodă
      </Button>
    </div>
  );
}

function LabelStep({ barcode, onDone, onBack }: { barcode: string; onDone: (f: FoodItem) => void; onBack: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [v, setV] = useState<LabelValues>({});
  const [note, setNote] = useState<string | null>(null);
  const read = async (f?: File) => {
    if (!f) return;
    setNote(null);
    setProgress(0);
    const r = await ocrLabel(f, (p) => setProgress(p));
    setProgress(null);
    if (r) {
      setV(r);
      setNote("Am citit eticheta. Verifică valorile înainte să salvezi.");
    } else setNote("Nu am putut citi eticheta (sau nu e internet pentru recunoaștere). Scrie valorile de pe tabel, la 100 g.");
  };
  const ok = name.trim() && v.kcal != null;
  const num = (k: keyof LabelValues, label: string) => (
    <Field
      label={label}
      inputMode="decimal"
      placeholder="0"
      value={v[k] != null ? String(v[k]).replace(".", ",") : ""}
      onChange={(e) => {
        const n = parseFloat(e.target.value.replace(",", "."));
        setV({ ...v, [k]: Number.isNaN(n) ? undefined : n });
      }}
    />
  );
  return (
    <div className="flex flex-col gap-4">
      <motion.button whileTap={{ scale: 0.98 }} onClick={() => ref.current?.click()} className="h-28 rounded-3xl bg-surface-2 border border-line flex flex-col items-center justify-center gap-2">
        {progress !== null ? (
          <>
            <Loader2 size={26} className="text-volt animate-spin" />
            <span className="text-[14px] text-text">Citesc eticheta… {Math.round(progress * 100)}%</span>
          </>
        ) : (
          <>
            <FileText size={28} className="text-text" />
            <span className="text-[15px] font-semibold text-text">Fă o poză la tabelul nutrițional</span>
          </>
        )}
      </motion.button>
      <input ref={ref} type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")} accept="image/*" capture="environment" hidden onChange={(e) => read(e.target.files?.[0])} />
      {note && <p className="text-[14px] text-muted leading-snug">{note}</p>}
      <Field label="Numele produsului" placeholder="De exemplu: iaurt cu fructe" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="text-[14px] text-text font-semibold -mb-1">Valori la 100 g</div>
      <div className="grid grid-cols-2 gap-3">
        {num("kcal", "Calorii (kcal)")}
        {num("p", "Proteine (g)")}
        {num("c", "Carbohidrați (g)")}
        {num("f", "Grăsimi (g)")}
      </div>
      <Button
        disabled={!ok}
        onClick={() =>
          ok &&
          onDone({
            id: `lbl-${barcode || Date.now()}`,
            name: name.trim(),
            barcode: barcode || undefined,
            per100: { kcal: v.kcal ?? 0, p: v.p ?? 0, c: v.c ?? 0, f: v.f ?? 0, sugar: v.sugar, fiber: v.fiber, salt: v.salt },
          })
        }
      >
        Continuă
      </Button>
      <Button variant="ghost" onClick={onBack}>
        Altă metodă
      </Button>
    </div>
  );
}

function SearchStep({ extra, onPick }: { extra: FoodItem[]; onPick: (f: FoodItem) => void }) {
  const [q, setQ] = useState("");
  const res = searchFoods(q, extra);
  return (
    <div className="flex flex-col gap-3">
      <Field label="Ce ai mâncat?" placeholder="pui, orez, banană…" prefix={<Search size={18} />} value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      <div className="flex flex-col">
        {res.map((f) => (
          <button key={f.id} type="button" onClick={() => onPick(f)} className="flex items-center gap-3 py-3 border-b border-line last:border-0 text-left">
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] text-text truncate">{f.name}</span>
              <span className="block text-[12px] text-muted">
                {f.per100.kcal} kcal / 100 g{f.brand ? ` · ${f.brand}` : ""}
              </span>
            </span>
            <Plus size={18} className="text-volt shrink-0" />
          </button>
        ))}
        {!res.length && <p className="text-[14px] text-muted py-3">Nu am găsit. Încearcă alt cuvânt sau introdu manual.</p>}
      </div>
    </div>
  );
}

function ManualStep({ onAdd }: { onAdd: (v: { name: string; grams: number; kcal: number; p: number; c: number; f: number }) => void }) {
  const [v, setV] = useState({ name: "", grams: "", kcal: "", p: "", c: "", f: "" });
  const n = (x: string) => parseFloat(x.replace(",", ".")) || 0;
  const ok = v.name.trim() && n(v.kcal) > 0;
  const f = (k: keyof typeof v, label: string) => <Field label={label} inputMode="decimal" placeholder="0" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value.replace(/[^\d.,]/g, "") })} />;
  return (
    <div className="flex flex-col gap-4">
      <Field label="Ce ai mâncat?" placeholder="De exemplu: salată de casă" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        {f("grams", "Cantitate (g)")}
        {f("kcal", "Calorii (kcal)")}
        {f("p", "Proteine (g)")}
        {f("c", "Carbohidrați (g)")}
        {f("f", "Grăsimi (g)")}
      </div>
      <p className="text-[13px] text-faint -mt-1">Scrii valorile pentru porția mâncată, nu la 100 g.</p>
      <Button disabled={!ok} onClick={() => ok && onAdd({ name: v.name.trim(), grams: Math.round(n(v.grams)), kcal: Math.round(n(v.kcal)), p: n(v.p), c: n(v.c), f: n(v.f) })}>
        Adaugă
      </Button>
    </div>
  );
}

function AmountStep({ food, meal, onMeal, onAdd }: { food: FoodItem; meal: Meal; onMeal: (m: Meal) => void; onAdd: (g: number) => void }) {
  const [g, setG] = useState(food.unit?.grams ?? 100);
  const mac = macrosFor(food, g);
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-surface-2 border border-line p-3.5">
        <div className="font-semibold text-[16px] text-text">{food.name}</div>
        <div className="text-[13px] text-muted mt-0.5">
          {food.brand ? `${food.brand} · ` : ""}
          {food.per100.kcal} kcal / 100 g
        </div>
      </div>
      <div>
        <div className="text-[14px] text-muted mb-2 font-medium">Cantitate</div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <NumberBox label="grame" unit="g" value={g} step={food.unit ? food.unit.grams : 10} max={3000} onChange={setG} />
          <div className="flex gap-1.5">
            {food.unit && (
              <button type="button" onClick={() => setG(food.unit!.grams)} className={`h-11 px-3 rounded-xl text-[13px] font-semibold whitespace-nowrap ${g === food.unit.grams ? "bg-volt text-ink" : "bg-surface-2 text-text border border-line"}`}>
                {food.unit.label}
              </button>
            )}
            <button type="button" onClick={() => setG(100)} className={`h-11 px-3 rounded-xl text-[13px] font-semibold ${g === 100 ? "bg-volt text-ink" : "bg-surface-2 text-text border border-line"}`}>
              100 g
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { k: "kcal", v: mac.kcal },
          { k: "Proteine", v: mac.p },
          { k: "Carbo", v: mac.c },
          { k: "Grăsimi", v: mac.f },
        ].map((x) => (
          <div key={x.k} className="rounded-2xl bg-surface-2 py-2.5 min-w-0">
            <div className="font-display font-extrabold text-[18px] text-text tabular">{fmt1(x.v)}</div>
            <div className="text-[11px] text-muted truncate px-1">{x.k}</div>
          </div>
        ))}
      </div>
      <Segmented value={meal} onChange={onMeal} options={MEALS.map((m) => ({ value: m, label: m === "Mic dejun" ? "Dimineața" : m }))} />
      <Button onClick={() => g > 0 && onAdd(g)}>Adaugă</Button>
    </div>
  );
}
