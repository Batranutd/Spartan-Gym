import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Crown, Droplet, Dumbbell, Gift, Percent, Shirt, Sparkles, Target, Ticket, Trophy, UserRound, Zap, Milk, Cookie } from "lucide-react";
import { useStore, pointsOf } from "../../store/useStore";
import { useMe } from "./useMe";
import { Avatar, Badge, Bar, Card, CountUp, Empty, Scroll, Segmented, SectionTitle, Stagger, TopBar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Sheet } from "../../components/ui/Sheet";
import { Field } from "../../components/ui/Field";
import { QR } from "../../components/ui/QR";
import { toast, confirmDialog } from "../../components/ui/Toast";
import { clientCheckIns, fullName, lifetimePoints, monthStart, streakWeeks, tierOf, visitsBetween } from "../../lib/derive";
import { dayOf, diffDays, fmtDate, today } from "../../lib/date";
import type { Challenge, Reward } from "../../data/types";

type View = "clasament" | "provocari" | "recompense";

export function Community() {
  const [view, setView] = useState<View>("clasament");
  return (
    <>
      <TopBar title="Comunitate" />
      <div className="px-4 pb-2 shrink-0">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "clasament", label: "Clasament" },
            { value: "provocari", label: "Provocări" },
            { value: "recompense", label: "Recompense" },
          ]}
        />
      </div>
      <Scroll>
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
            {view === "clasament" ? <Leaderboard /> : view === "provocari" ? <Challenges /> : <Rewards />}
          </motion.div>
        </AnimatePresence>
      </Scroll>
    </>
  );
}

/* ------------------------------ CLASAMENT ------------------------------ */

type Cat = "prezenta" | "constanta" | "puncte";

function Leaderboard() {
  const me = useMe();
  const s = useStore();
  const [cat, setCat] = useState<Cat>("prezenta");
  const rows = useMemo(() => {
    const ms = monthStart();
    const mStartIso = new Date(ms).toISOString();
    return s.clients
      .filter((c) => c.leaderboardOptIn || c.id === me.id)
      .map((c) => {
        const ch = clientCheckIns(s, c.id);
        const v =
          cat === "prezenta"
            ? visitsBetween(ch, ms)
            : cat === "constanta"
              ? streakWeeks(ch)
              : s.points.filter((p) => p.clientId === c.id && p.delta > 0 && p.at >= mStartIso).reduce((a, p) => a + p.delta, 0);
        return { c, v };
      })
      .sort((a, b) => b.v - a.v || a.c.firstName.localeCompare(b.c.firstName));
  }, [s, cat, me.id]);
  const unitFor = (v: number) => (cat === "prezenta" ? (v === 1 ? "vizită" : "vizite") : cat === "constanta" ? "săpt." : v === 1 ? "punct" : "puncte");
  const myRank = rows.findIndex((r) => r.c.id === me.id) + 1;
  const top = rows.slice(0, 3);
  const order = [top[1], top[0], top[2]];
  const heights = [96, 128, 76];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {[
          { k: "prezenta" as Cat, l: "Prezență luna asta", i: <CalendarDays size={15} /> },
          { k: "constanta" as Cat, l: "Constanță", i: <Sparkles size={15} /> },
          { k: "puncte" as Cat, l: "Progres în puncte", i: <Zap size={15} /> },
        ].map((x) => (
          <button key={x.k} type="button" onClick={() => setCat(x.k)} className={`shrink-0 h-10 px-3.5 rounded-full inline-flex items-center gap-1.5 text-[14px] font-semibold border ${cat === x.k ? "bg-text text-ink border-text" : "bg-surface text-text border-line"}`}>
            {x.i}
            {x.l}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 mt-6 mb-2">
        {order.map((r, i) =>
          r ? (
            <div key={r.c.id + cat} className="flex-1 min-w-0 max-w-[118px] flex flex-col items-center">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="relative">
                {i === 1 && <Crown size={22} className="absolute -top-6 left-1/2 -translate-x-1/2 text-warn" />}
                <Avatar name={fullName(r.c)} photo={r.c.photo} size={i === 1 ? 60 : 50} id={r.c.id} ring={r.c.id === me.id} />
              </motion.div>
              <div className="text-[13px] font-semibold text-text mt-1.5 truncate max-w-full">{r.c.id === me.id ? "Tu" : r.c.firstName}</div>
              <div className="text-[12px] text-muted tabular">
                {r.v} {unitFor(r.v)}
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: heights[i] }}
                transition={{ duration: 0.7, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full mt-2 rounded-t-2xl grid place-items-start justify-center pt-2 ${i === 1 ? "bg-volt text-ink" : "bg-surface-2 text-text border border-line border-b-0"}`}
              >
                <span className="font-display font-extrabold text-[22px]">{i === 1 ? 1 : i === 0 ? 2 : 3}</span>
              </motion.div>
            </div>
          ) : null,
        )}
      </div>

      {myRank > 0 && (
        <div className="rounded-2xl bg-volt-soft border border-volt/30 p-3 flex items-center gap-3 mt-3">
          <span className="font-display font-extrabold text-[20px] text-volt w-9 text-center tabular">{myRank}</span>
          <span className="flex-1 text-[15px] text-text font-semibold">Locul tău</span>
          <span className="text-[14px] text-text tabular">
            {rows[myRank - 1].v} {unitFor(rows[myRank - 1].v)}
          </span>
        </div>
      )}

      <div className="mt-3 rounded-3xl bg-surface border border-line">
        {rows.slice(3, 15).map((r, i) => (
          <motion.div key={r.c.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.02 * i }} className={`flex items-center gap-3 px-3 py-2.5 ${i ? "border-t border-line" : ""} ${r.c.id === me.id ? "bg-volt-soft" : ""}`}>
            <span className="w-7 text-center text-[14px] font-semibold text-muted tabular">{i + 4}</span>
            <Avatar name={fullName(r.c)} photo={r.c.photo} size={36} id={r.c.id} />
            <span className="flex-1 min-w-0 text-[15px] text-text truncate">{r.c.id === me.id ? "Tu" : `${r.c.firstName} ${r.c.lastName[0]}.`}</span>
            <span className="text-[14px] font-semibold text-text tabular">{r.v}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-[13px] text-faint mt-3 leading-snug">În clasament apar doar membrii care au ales asta. Poți ieși oricând din Profil, la Confidențialitate.</p>
    </div>
  );
}

/* ------------------------------ PROVOCĂRI ------------------------------ */

function Challenges() {
  const me = useMe();
  const s = useStore();
  const [submit, setSubmit] = useState<Challenge | null>(null);
  const [val, setVal] = useState("");
  const active = s.challenges.filter((c) => c.end >= today());
  const visitsMonth = visitsBetween(clientCheckIns(s, me.id), monthStart());

  return (
    <div className="flex flex-col gap-3">
      {active.length === 0 && <Empty icon={<Target size={22} />} title="Nicio provocare acum" text="Sala anunță provocările noi prin notificări." />}
      {active.map((c, i) => {
        const auto = c.id === "ch-oct";
        const mine = c.entries.find((e) => e.clientId === me.id);
        const ranked = auto
          ? []
          : c.entries
              .filter((e) => e.status === "validat")
              .sort((a, b) => (c.higherIsBetter ? b.value - a.value : a.value - b.value))
              .slice(0, 3);
        const daysLeft = diffDays(c.end, today());
        return (
          <Stagger key={c.id} i={i}>
            <div className="rounded-3xl bg-surface border border-line p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-soft text-violet-ink grid place-items-center shrink-0">
                  <Trophy size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[18px] text-text leading-tight">{c.title}</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge tone="violet">
                      <Zap size={12} /> {c.points} puncte
                    </Badge>
                    <Badge>{daysLeft === 0 ? "Ultima zi" : `Încă ${daysLeft} zile`}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-[14px] text-muted mt-3 leading-snug">{c.description}</p>

              {auto ? (
                <div className="mt-3">
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span className="text-text font-medium">Progresul tău</span>
                    <span className="text-muted tabular">{visitsMonth}/16 vizite</span>
                  </div>
                  <Bar pct={visitsMonth / 16} color="bg-violet-ink" />
                </div>
              ) : (
                <>
                  {ranked.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {ranked.map((e, k) => {
                        const cl = s.clients.find((x) => x.id === e.clientId);
                        return (
                          <div key={e.clientId} className="flex items-center gap-2 text-[14px]">
                            <span className={`w-6 h-6 rounded-full grid place-items-center text-[12px] font-bold ${k === 0 ? "bg-warn text-ink" : "bg-surface-3 text-text"}`}>{k + 1}</span>
                            <span className="flex-1 min-w-0 text-text truncate">{e.clientId === me.id ? "Tu" : cl ? `${cl.firstName} ${cl.lastName[0]}.` : "Membru"}</span>
                            <span className="text-text font-semibold tabular">
                              {e.value} {c.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-4">
                    {!mine ? (
                      <Button size="md" onClick={() => (s.joinChallenge(c.id, me.id), toast(`Te-ai înscris la „${c.title}”`))}>
                        Mă înscriu
                      </Button>
                    ) : mine.status === "înscris" || mine.status === "respins" ? (
                      <div className="flex flex-col gap-2">
                        {mine.status === "respins" && <p className="text-[14px] text-warn">Ultimul rezultat nu a fost validat. Încearcă din nou.</p>}
                        <Button
                          size="md"
                          variant="violet"
                          onClick={() => {
                            setVal("");
                            setSubmit(c);
                          }}
                        >
                          Trimite rezultatul
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2.5">
                        <span className="flex-1 text-[14px] text-text">
                          Rezultatul tău: <b className="tabular">{mine.value}</b> {c.unit}
                        </span>
                        <Badge tone={mine.status === "validat" ? "ok" : "warn"}>{mine.status === "validat" ? "Validat" : "Se verifică"}</Badge>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Stagger>
        );
      })}

      <Sheet open={!!submit} onClose={() => setSubmit(null)} title={submit?.title ?? ""}>
        {submit && (
          <div className="flex flex-col gap-4 pb-2">
            <p>Rezultatul se validează de un antrenor sau la recepție. Fă proba sub ochii lor.</p>
            <Field label={`Rezultat (${submit.unit})`} inputMode="numeric" placeholder="0" value={val} onChange={(e) => setVal(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            <Button
              onClick={() => {
                const n = parseInt(val);
                if (!n) return;
                s.submitChallenge(submit.id, me.id, n);
                setSubmit(null);
                toast("Trimis spre validare");
              }}
            >
              Trimite spre validare
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ------------------------------ RECOMPENSE ------------------------------ */

const rewardIcon: Record<Reward["icon"], JSX.Element> = {
  drop: <Droplet size={22} />,
  bar: <Cookie size={22} />,
  shaker: <Milk size={22} />,
  shirt: <Shirt size={22} />,
  percent: <Percent size={22} />,
  calendar: <CalendarDays size={22} />,
  trainer: <UserRound size={22} />,
};

function Rewards() {
  const me = useMe();
  const s = useStore();
  const bal = pointsOf(s, me.id);
  const life = lifetimePoints(s, me.id);
  const tier = tierOf(life);
  const [code, setCode] = useState<{ code: string; name: string } | null>(null);
  const mine = s.redemptions.filter((r) => r.clientId === me.id);
  const history = s.points.filter((p) => p.clientId === me.id).slice(-8).reverse();
  const r = s.pointRules;

  const redeem = async (rw: Reward) => {
    if (bal < rw.cost) return toast(`Îți mai trebuie ${rw.cost - bal} de puncte`, "info");
    if (!(await confirmDialog({ title: rw.name, text: `Folosești ${rw.cost} de puncte. Primești un cod pe care îl arăți la recepție.`, ok: "Folosește" }))) return;
    const c = s.redeem(me.id, rw.id);
    if (c) setCode({ code: c, name: rw.name });
  };

  return (
    <div>
      <Stagger>
        <div className="relative rounded-[28px] overflow-hidden bg-violet p-5 text-white">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" aria-hidden />
          <div className="absolute right-6 bottom-4 w-20 h-20 rounded-full bg-white/10" aria-hidden />
          <div className="relative">
            <div className="text-[14px] text-white/85 font-medium">Punctele tale</div>
            <CountUp value={bal} className="block font-display font-extrabold text-[44px] leading-tight text-white" />
            <div className="flex items-center gap-2 mt-1">
              <span className="h-7 px-2.5 rounded-full text-[13px] font-bold grid place-items-center" style={{ background: tier.color, color: "#0E0F12" }}>
                {tier.name}
              </span>
              {tier.next && <span className="text-[13px] text-white/90">încă {tier.next - life} până la nivelul următor</span>}
            </div>
            {tier.next && (
              <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${(life / tier.next) * 100}%` }} transition={{ duration: 1 }} />
              </div>
            )}
          </div>
        </div>
      </Stagger>

      <Stagger i={1} className="mt-5">
        <SectionTitle>Cum câștigi puncte</SectionTitle>
        <Card className="py-2">
          {[
            { i: <Dumbbell size={17} />, t: "Fiecare vizită la sală", p: r.checkIn },
            { i: <CalendarDays size={17} />, t: "3 vizite în aceeași săptămână", p: r.weekStreak },
            { i: <Trophy size={17} />, t: "Provocare validată", p: "50–150" },
            { i: <Sparkles size={17} />, t: "Recenzie (o dată pe lună)", p: r.review },
            { i: <Gift size={17} />, t: "Aduci un prieten care își face abonament", p: r.referral },
          ].map((x, k) => (
            <div key={k} className={`flex items-center gap-3 py-2.5 ${k ? "border-t border-line" : ""}`}>
              <span className="w-9 h-9 rounded-xl bg-surface-2 grid place-items-center text-volt shrink-0">{x.i}</span>
              <span className="flex-1 min-w-0 text-[14px] text-text leading-snug">{x.t}</span>
              <span className="text-[14px] font-bold text-violet-ink tabular shrink-0">+{x.p}</span>
            </div>
          ))}
        </Card>
        <p className="text-[12px] text-faint mt-2">Punctele expiră după {r.expireMonths} luni. Nu au valoare bănească.</p>
      </Stagger>

      <Stagger i={2} className="mt-6">
        <SectionTitle>Recompense</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {s.rewards
            .filter((x) => x.active)
            .map((rw) => {
              const can = bal >= rw.cost;
              return (
                <motion.button key={rw.id} whileTap={{ scale: 0.96 }} onClick={() => redeem(rw)} className={`rounded-3xl p-3.5 text-left border flex flex-col min-w-0 ${can ? "bg-surface border-violet/60" : "bg-surface border-line"}`}>
                  <span className={`w-11 h-11 rounded-2xl grid place-items-center ${can ? "bg-violet text-white" : "bg-surface-3 text-muted"}`}>{rewardIcon[rw.icon]}</span>
                  <span className="font-semibold text-[15px] text-text mt-2.5 leading-snug">{rw.name}</span>
                  <span className="text-[12px] text-muted leading-snug mt-0.5 flex-1">{rw.description}</span>
                  <span className={`mt-2 text-[14px] font-bold tabular ${can ? "text-violet-ink" : "text-faint"}`}>{rw.cost} puncte</span>
                  {!can && (
                    <div className="mt-1.5">
                      <Bar pct={bal / rw.cost} color="bg-violet-ink" className="h-1" />
                    </div>
                  )}
                </motion.button>
              );
            })}
        </div>
      </Stagger>

      {mine.length > 0 && (
        <Stagger i={3} className="mt-6">
          <SectionTitle>Codurile mele</SectionTitle>
          <div className="flex flex-col gap-2">
            {mine.map((m) => {
              const rw = s.rewards.find((x) => x.id === m.rewardId);
              return (
                <button key={m.id} type="button" onClick={() => m.status === "activ" && setCode({ code: m.code, name: rw?.name ?? "" })} className="flex items-center gap-3 rounded-2xl bg-surface border border-line p-3 text-left">
                  <Ticket size={20} className="text-violet-ink shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] text-text font-semibold truncate">{rw?.name}</span>
                    <span className="block text-[13px] text-muted tabular">
                      {m.code} · {fmtDate(dayOf(m.at))}
                    </span>
                  </span>
                  <Badge tone={m.status === "activ" ? "ok" : "neutral"}>{m.status === "activ" ? "Activ" : "Folosit"}</Badge>
                </button>
              );
            })}
          </div>
        </Stagger>
      )}

      <Stagger i={4} className="mt-6">
        <SectionTitle>Istoric puncte</SectionTitle>
        <Card className="py-1">
          {history.map((p, k) => (
            <div key={p.id} className={`flex items-center gap-3 py-2.5 ${k ? "border-t border-line" : ""}`}>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] text-text truncate">{p.reason}</span>
                <span className="block text-[12px] text-muted">{fmtDate(dayOf(p.at))}</span>
              </span>
              <span className={`text-[15px] font-bold tabular ${p.delta > 0 ? "text-ok" : "text-danger"}`}>
                {p.delta > 0 ? "+" : ""}
                {p.delta}
              </span>
            </div>
          ))}
        </Card>
      </Stagger>

      <Sheet open={!!code} onClose={() => setCode(null)} title={code?.name ?? ""}>
        {code && (
          <div className="flex flex-col items-center text-center pb-3">
            <QR value={`SPARTAN-REWARD:${code.code}`} size={190} />
            <div className="font-display font-extrabold text-[34px] tracking-[0.2em] text-text mt-4">{code.code}</div>
            <p className="mt-2">Arată codul la recepție. Se poate folosi o singură dată.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
