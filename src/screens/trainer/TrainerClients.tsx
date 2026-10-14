import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Lock, NotebookPen, Search, Send, ShieldOff, Target } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useTrainerNav } from "../../lib/nav";
import { useTrainer } from "./TrainerApp";
import { Avatar, Badge, Card, Empty, LineChart, Scroll, Segmented, SectionTitle, Stagger, TextArea, TopBar, Bar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { toast } from "../../components/ui/Toast";
import { BodyHeat, weeklySets } from "../../components/three/BodyHeat";
import { addDays, dayOf, DAY_ABBR, fmtDate, relDay, today, weekday } from "../../lib/date";
import { fullName, lastVisit, subInfo } from "../../lib/derive";
import { targetFor } from "../../lib/nutrition";
import { MEALS } from "../../data/types";
import { volumeOf } from "../client/Workout";

export function TrainerClients() {
  const t = useTrainer();
  const s = useStore();
  const nav = useTrainerNav();
  const [q, setQ] = useState("");
  const clients = s.clients.filter((c) => c.trainerAccess.includes(t.id) && (!q || fullName(c).toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <TopBar title="Clienții mei" subtitle={`${clients.length} clienți ți-au dat acces`} />
      <div className="px-4 pb-2 shrink-0">
        <Field label="Caută" prefix={<Search size={18} />} placeholder="Numele clientului" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Scroll>
        {clients.length ? (
          <div className="flex flex-col gap-2">
            {clients.map((c, i) => {
              const sets = weeklySets(s.workouts.filter((w) => w.clientId === c.id));
              const total = Object.values(sets).reduce((a, b) => a + b, 0);
              const lv = lastVisit(s, c.id);
              return (
                <Stagger key={c.id} i={i}>
                  <Card onClick={() => nav.push("client", { id: c.id })}>
                    <div className="flex items-center gap-3">
                      <Avatar name={fullName(c)} photo={c.photo} size={50} id={c.id} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[16px] text-text truncate">{fullName(c)}</div>
                        <div className="text-[13px] text-muted truncate">{c.goals.join(" · ") || "Fără obiectiv"}</div>
                        <div className="text-[12px] text-faint mt-0.5">
                          {total} serii săptămâna asta · {lv ? `ultima vizită ${relDay(dayOf(lv)).toLowerCase()}` : "nicio vizită"}
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-faint shrink-0" />
                    </div>
                  </Card>
                </Stagger>
              );
            })}
          </div>
        ) : (
          <Empty icon={<Lock size={22} />} title="Niciun client încă" text="Clienții îți dau acces din profilul tău sau când programează o ședință cu tine." />
        )}
      </Scroll>
    </>
  );
}

type Tab = "antrenamente" | "nutritie" | "progres" | "notite";

export function TrainerClientDetail({ params }: { params?: Record<string, string> }) {
  const t = useTrainer();
  const s = useStore();
  const nav = useTrainerNav();
  const c = s.clients.find((x) => x.id === params?.id);
  const [tab, setTab] = useState<Tab>("antrenamente");
  const [day, setDay] = useState(today());
  const [note, setNote] = useState("");
  const [rec, setRec] = useState("");
  const logs = useMemo(() => s.workouts.filter((w) => w.clientId === c?.id).sort((a, b) => b.date.localeCompare(a.date)), [s.workouts, c?.id]);
  if (!c) return null;
  if (!c.trainerAccess.includes(t.id))
    return (
      <>
        <TopBar title={fullName(c)} onBack={nav.pop} />
        <Scroll>
          <Empty icon={<ShieldOff size={22} />} title="Acces retras" text="Clientul nu îți mai dă acces la datele lui." />
        </Scroll>
      </>
    );
  const info = subInfo(s, c.id);
  const foods = s.foods.filter((f) => f.clientId === c.id && f.date === day);
  const target = targetFor(c);
  const sum = foods.reduce((a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }), { kcal: 0, p: 0, c: 0, f: 0 });
  const weights = s.weights.filter((w) => w.clientId === c.id).sort((a, b) => a.date.localeCompare(b.date));
  const photos = s.photos.filter((p) => p.clientId === c.id && (p.visibility === "public" || (p.visibility === "selectat" && p.allowed.includes(t.id))));
  const notes = s.trainerNotes.filter((n) => n.trainerId === t.id && n.clientId === c.id);

  return (
    <>
      <TopBar title={fullName(c)} subtitle={`${c.age ?? "–"} ani · ${c.heightCm ?? "–"} cm · ${String(c.weightKg ?? "–").replace(".", ",")} kg`} onBack={nav.pop} />
      <Scroll>
        <Stagger>
          <Card>
            <div className="flex items-start gap-3">
              <Avatar name={fullName(c)} photo={c.photo} size={56} id={c.id} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={info.active ? "ok" : "danger"}>{info.active ? `Abonament: ${info.daysLeft} zile` : "Fără abonament activ"}</Badge>
                </div>
                <div className="mt-2 flex items-start gap-2 text-[14px] text-text">
                  <Target size={16} className="text-volt shrink-0 mt-0.5" />
                  <span>{c.goals.join(", ") || "Fără obiectiv"}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-3 text-[13px]">
              {[
                { k: "Vrea să îmbunătățească", v: c.improve },
                { k: "Se descurcă la", v: c.strengths },
                { k: "I se pare greu", v: c.struggles },
              ].map((x) => (
                <div key={x.k} className="flex gap-2">
                  <span className="text-muted w-40 shrink-0">{x.k}</span>
                  <span className="text-text min-w-0">{x.v.join(", ") || "–"}</span>
                </div>
              ))}
            </div>
            {c.notes && <p className="text-[14px] text-text mt-3 rounded-xl bg-surface-2 p-2.5 leading-snug">„{c.notes}”</p>}
          </Card>
        </Stagger>

        <div className="mt-4">
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: "antrenamente", label: "Sală" },
              { value: "nutritie", label: "Nutriție" },
              { value: "progres", label: "Progres" },
              { value: "notite", label: "Notițe" },
            ]}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-4">
            {tab === "antrenamente" &&
              (logs.length ? (
                <div className="flex flex-col gap-3">
                  {logs.slice(0, 10).map((l) => (
                    <Card key={l.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[15px] text-text">
                          {relDay(l.date)} · {l.groups.join(" + ") || "Antrenament"}
                        </span>
                        <span className="text-[12px] text-muted tabular shrink-0">{(volumeOf(l) / 1000).toFixed(1).replace(".", ",")} t</span>
                      </div>
                      <div className="mt-2 flex flex-col gap-1.5">
                        {l.exercises.map((e) => (
                          <div key={e.id} className="flex gap-2 text-[13px]">
                            <span className="text-text w-[45%] shrink-0 truncate">{e.exercise}</span>
                            <span className="text-muted tabular min-w-0">{e.sets.map((x) => (e.group === "Cardio" ? `${x.reps} min` : `${x.kg}×${x.reps}`)).join(" · ")}</span>
                          </div>
                        ))}
                        {!l.exercises.length && <span className="text-[13px] text-muted">Fără exerciții notate</span>}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-muted">Clientul nu a notat încă antrenamente.</p>
              ))}

            {tab === "nutritie" && (
              <div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {Array.from({ length: 7 }, (_, i) => addDays(today(), -i)).map((d) => (
                    <button key={d} type="button" onClick={() => setDay(d)} className={`shrink-0 w-14 h-16 rounded-2xl flex flex-col items-center justify-center border ${day === d ? "bg-volt text-ink border-volt" : "bg-surface text-text border-line"}`}>
                      <span className={`text-[12px] font-semibold ${day === d ? "text-ink" : "text-muted"}`}>{DAY_ABBR[weekday(d)]}</span>
                      <span className="font-display font-bold text-[18px]">{parseInt(d.slice(8))}</span>
                    </button>
                  ))}
                </div>
                <Card className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[14px] text-muted">Total</span>
                    <span className="text-text">
                      <b className="font-display text-[22px] tabular">{sum.kcal}</b> <span className="text-muted text-[14px]">/ {target.kcal} kcal</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                      { k: "Proteine", v: sum.p, t: target.p },
                      { k: "Carbo", v: sum.c, t: target.c },
                      { k: "Grăsimi", v: sum.f, t: target.f },
                    ].map((m) => (
                      <div key={m.k} className="min-w-0">
                        <div className="text-[12px] text-muted">{m.k}</div>
                        <div className="text-[14px] text-text font-semibold tabular">
                          {Math.round(m.v)}/{m.t} g
                        </div>
                        <Bar pct={m.v / m.t} className="h-1.5 mt-1" />
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="flex flex-col gap-2 mt-3">
                  {MEALS.map((m) => {
                    const list = foods.filter((f) => f.meal === m);
                    if (!list.length) return null;
                    return (
                      <Card key={m} className="py-2">
                        <div className="text-[13px] font-semibold text-volt py-1">{m}</div>
                        {list.map((f) => (
                          <div key={f.id} className="flex justify-between gap-2 py-1.5 border-t border-line text-[14px]">
                            <span className="text-text truncate">
                              {f.name} <span className="text-muted">· {f.grams} g</span>
                            </span>
                            <span className="text-text tabular shrink-0">{f.kcal} kcal</span>
                          </div>
                        ))}
                      </Card>
                    );
                  })}
                  {!foods.length && <p className="text-[14px] text-muted">Nimic notat în ziua asta.</p>}
                </div>
              </div>
            )}

            {tab === "progres" && (
              <div className="flex flex-col gap-4">
                <Card>
                  <BodyHeat logs={logs} height={230} />
                </Card>
                <Card>
                  <div className="text-[15px] font-semibold text-text mb-2">Greutate</div>
                  <LineChart points={weights.map((w) => ({ label: fmtDate(w.date), value: w.kg }))} unit="kg" />
                </Card>
                <div>
                  <SectionTitle>Poze la care ai acces</SectionTitle>
                  {photos.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((p) => (
                        <img key={p.id} src={p.img} alt={`Poză din ${fmtDate(p.date)}`} className="aspect-[3/4] w-full object-cover rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[14px] text-muted">Clientul nu ți-a arătat nicio poză.</p>
                  )}
                </div>
              </div>
            )}

            {tab === "notite" && (
              <div className="flex flex-col gap-4">
                <Card>
                  <div className="text-[15px] font-semibold text-text mb-1 inline-flex items-center gap-2">
                    <Send size={16} className="text-volt" /> Recomandare pentru client
                  </div>
                  <p className="text-[13px] text-muted mb-3">Ajunge la client ca notificare.</p>
                  <TextArea label="Mesaj" value={rec} onChange={setRec} rows={3} placeholder="De exemplu: crește la 60 kg la împins, 4 serii de 8" />
                  <div className="mt-3">
                    <Button
                      size="md"
                      onClick={() => {
                        if (rec.trim().length < 3) return;
                        s.sendNotice({ to: c.id, title: `Recomandare de la ${t.firstName}`, body: rec.trim(), kind: "antrenor" });
                        setRec("");
                        toast(`Trimis lui ${c.firstName}`);
                      }}
                    >
                      Trimite
                    </Button>
                  </div>
                </Card>
                <Card>
                  <div className="text-[15px] font-semibold text-text mb-1 inline-flex items-center gap-2">
                    <NotebookPen size={16} className="text-violet-ink" /> Notițe private
                  </div>
                  <p className="text-[13px] text-muted mb-3">Le vezi doar tu.</p>
                  <TextArea label="Notiță nouă" value={note} onChange={setNote} rows={2} placeholder="Observații despre tehnică, accidentări, preferințe" />
                  <div className="mt-3">
                    <Button
                      size="md"
                      variant="secondary"
                      onClick={() => {
                        if (note.trim().length < 2) return;
                        s.addTrainerNote(t.id, c.id, note.trim());
                        setNote("");
                      }}
                    >
                      Salvează notița
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {notes.map((n) => (
                      <div key={n.id} className="rounded-xl bg-surface-2 p-2.5">
                        <div className="text-[12px] text-muted">{fmtDate(dayOf(n.at), { day: "numeric", month: "long" })}</div>
                        <div className="text-[14px] text-text leading-snug">{n.text}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Scroll>
    </>
  );
}
