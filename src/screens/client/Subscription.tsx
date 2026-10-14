import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, Check, CreditCard, Lock, Percent, Receipt, Store as StoreIcon } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Badge, Card, CountUp, Divider, Ring, Row, Scroll, SectionTitle, Stagger, Toggle, TopBar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Sheet } from "../../components/ui/Sheet";
import { Field } from "../../components/ui/Field";
import { toast } from "../../components/ui/Toast";
import { subInfo } from "../../lib/derive";
import { fmtDate, fmtLong } from "../../lib/date";
import { lei } from "../../lib/id";
import type { Plan } from "../../data/types";

const methodLabel = { "card-app": "Card, în aplicație", cash: "Cash, la recepție", "card-pos": "Card, la recepție" } as const;

export function SubscriptionScreen() {
  const me = useMe();
  const nav = useClientNav();
  const s = useStore();
  const info = useMemo(() => subInfo(s, me.id), [s, me.id]);
  const mine = s.subscriptions.filter((x) => x.clientId === me.id).sort((a, b) => b.start.localeCompare(a.start));
  const plan = info.sub ? s.plans.find((p) => p.id === info.sub!.planId) : null;

  return (
    <>
      <TopBar title="Abonamentul meu" onBack={nav.pop} />
      <Scroll>
        <Stagger>
          <div className="flex flex-col items-center text-center py-2">
            <Ring pct={info.pct} size={190} stroke={16} color={info.state === "expiră curând" ? "var(--color-warn)" : "var(--color-volt)"}>
              <div>
                <CountUp value={info.daysLeft} className="font-display font-extrabold text-[52px] leading-none text-text" />
                <div className="text-[14px] text-muted mt-1">{info.daysLeft === 1 ? "zi rămasă" : "zile rămase"}</div>
              </div>
            </Ring>
            <div className="font-display font-bold text-[22px] mt-5 text-text">{plan ? `Abonament ${plan.name}` : "Niciun abonament activ"}</div>
            {info.sub && (
              <p className="text-[15px] text-muted mt-1">
                {fmtLong(info.sub.start)} – {fmtLong(info.sub.end)}
              </p>
            )}
            {info.upcoming && (
              <div className="mt-3">
                <Badge tone="violet">Urmează: {s.plans.find((p) => p.id === info.upcoming!.planId)?.name}, din {fmtDate(info.upcoming.start)}</Badge>
              </div>
            )}
          </div>
        </Stagger>

        {info.pending && (
          <Stagger i={1} className="mt-3">
            <Card tone="raised">
              <div className="flex gap-3">
                <StoreIcon size={22} className="text-warn shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-semibold text-[15px] text-text">De plătit la recepție</div>
                  <p className="text-[14px] text-muted mt-0.5 leading-snug">
                    {s.plans.find((p) => p.id === info.pending!.planId)?.name}, {lei(info.pending.pricePaid)}. Se activează când plătești, cash sau cu cardul.
                  </p>
                </div>
              </div>
            </Card>
          </Stagger>
        )}

        <Stagger i={2} className="mt-5">
          <Button onClick={() => nav.push("plans")}>{info.active ? "Prelungește abonamentul" : "Alege un abonament"}</Button>
        </Stagger>

        <Stagger i={3} className="mt-7">
          <SectionTitle>Istoric plăți</SectionTitle>
          {mine.length ? (
            <Card className="py-1">
              {mine.map((x, i) => {
                const p = s.plans.find((pp) => pp.id === x.planId);
                return (
                  <div key={x.id}>
                    {i > 0 && <Divider />}
                    <Row
                      icon={<span className="w-10 h-10 rounded-xl bg-surface-3 grid place-items-center text-muted shrink-0"><Receipt size={18} /></span>}
                      title={p?.name ?? "Abonament"}
                      subtitle={`${fmtDate(x.start)} – ${fmtDate(x.end)} · ${x.status === "în așteptare" ? "neplătit" : methodLabel[x.method]}`}
                      right={<span className="text-[15px] font-semibold text-text tabular shrink-0">{lei(x.pricePaid)}</span>}
                    />
                  </div>
                );
              })}
            </Card>
          ) : (
            <p className="text-[14px] text-muted">Nicio plată încă.</p>
          )}
        </Stagger>
      </Scroll>
    </>
  );
}

function fmtCard(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function PlansScreen() {
  const me = useMe();
  const nav = useClientNav();
  const s = useStore();
  const info = subInfo(s, me.id);
  const [sel, setSel] = useState<Plan | null>(null);
  const [step, setStep] = useState<"choose" | "card" | "done">("choose");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: `${me.firstName} ${me.lastName}`.toUpperCase() });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const discount = s.redemptions.find((r) => r.clientId === me.id && r.rewardId === "r-10" && r.status === "activ");
  const [useDiscount, setUseDiscount] = useState(!!discount);
  const pct = discount && useDiscount ? 10 : 0;
  const price = sel ? Math.round(sel.price * (1 - pct / 100)) : 0;

  const open = (p: Plan) => {
    setSel(p);
    setStep("choose");
    setErr(null);
  };

  const payCard = async () => {
    const digits = card.number.replace(/\s/g, "");
    if (digits.length < 16) return setErr("Numărul cardului are 16 cifre.");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp)) return setErr("Data expirării, de forma LL/AA.");
    if (!/^\d{3}$/.test(card.cvc)) return setErr("Codul CVC are 3 cifre.");
    setErr(null);
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1300));
    s.buyPlan(me.id, sel!.id, "card-app", pct);
    if (pct && discount) s.useRedemption(discount.id);
    setBusy(false);
    setStep("done");
  };

  const payDesk = () => {
    s.buyPlan(me.id, sel!.id, "recepție", pct);
    if (pct && discount) s.useRedemption(discount.id);
    setSel(null);
    toast("Rezervat. Plătește la recepție și se activează pe loc.");
    nav.pop();
  };

  return (
    <>
      <TopBar title="Abonamente" subtitle={info.active ? "Noul abonament începe după cel actual" : undefined} onBack={nav.pop} />
      <Scroll>
        <div className="flex flex-col gap-3">
          {s.plans
            .filter((p) => p.active)
            .map((p, i) => (
              <Stagger key={p.id} i={i}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => open(p)}
                  className={`relative w-full text-left rounded-3xl p-4 border ${p.popular ? "border-volt bg-surface" : "border-line bg-surface"}`}
                >
                  {p.popular && <span className="absolute -top-2.5 right-4 h-6 px-2.5 rounded-full bg-volt text-ink text-[12px] font-bold grid place-items-center">Cel mai ales</span>}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display font-bold text-[20px] text-text">{p.name}</div>
                      <div className="text-[13px] text-muted mt-0.5">{p.durationDays === 1 ? "Valabil o zi" : `Valabil ${p.durationDays} de zile`}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-extrabold text-[26px] leading-none text-text tabular">{p.price}</div>
                      <div className="text-[13px] text-muted">lei</div>
                    </div>
                  </div>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {p.perks.map((k) => (
                      <li key={k} className="flex items-center gap-2 text-[14px] text-text">
                        <Check size={16} className="text-volt shrink-0" />
                        {k}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              </Stagger>
            ))}
        </div>
      </Scroll>

      <Sheet open={!!sel} onClose={() => !busy && setSel(null)} title={step === "done" ? "Plată reușită" : sel ? `Abonament ${sel.name}` : ""}>
        <AnimatePresence mode="wait">
          {step === "choose" && sel && (
            <motion.div key="c" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-3 pb-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] text-muted">De plată</span>
                <span className="font-display font-extrabold text-[28px] text-text tabular">{lei(price)}</span>
              </div>
              {discount && (
                <div className="rounded-2xl bg-violet-soft px-3">
                  <Toggle on={useDiscount} onChange={setUseDiscount} label="Folosește reducerea de 10%" description="Recompensa ta din puncte" />
                </div>
              )}
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep("card")} className="flex items-center gap-3 rounded-2xl bg-surface-2 border border-line p-4 text-left">
                <span className="w-11 h-11 rounded-xl bg-volt text-ink grid place-items-center shrink-0">
                  <CreditCard size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-[16px] text-text">Plătesc acum cu cardul</span>
                  <span className="block text-[13px] text-muted">Se activează imediat</span>
                </span>
              </motion.button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={payDesk} className="flex items-center gap-3 rounded-2xl bg-surface-2 border border-line p-4 text-left">
                <span className="w-11 h-11 rounded-xl bg-surface-3 text-text grid place-items-center shrink-0">
                  <Banknote size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-[16px] text-text">Plătesc la recepție</span>
                  <span className="block text-[13px] text-muted">Cash sau card, data viitoare când vii</span>
                </span>
              </motion.button>
            </motion.div>
          )}
          {step === "card" && sel && (
            <motion.div key="k" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4 pb-2">
              <Field label="Numărul cardului" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: fmtCard(e.target.value) })} prefix={<CreditCard size={19} />} />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Expiră"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="LL/AA"
                  value={card.exp}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setCard({ ...card, exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
                  }}
                />
                <Field label="CVC" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 3) })} />
              </div>
              <Field label="Numele de pe card" autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} />
              {err && <p className="text-[14px] text-danger">{err}</p>}
              <div className="flex gap-2 items-start rounded-2xl bg-surface-2 p-3 text-[13px] text-muted leading-snug">
                <Lock size={16} className="shrink-0 mt-0.5 text-muted" />
                Demo: nu se face nicio plată. În aplicația reală plata trece printr-un procesator securizat, iar datele cardului nu se salvează în aplicație.
              </div>
              <Button onClick={payCard} disabled={busy} icon={busy ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-5 h-5 rounded-full border-2 border-ink border-t-transparent" /> : <Lock size={18} />}>
                {busy ? "Se procesează" : `Plătește ${lei(price)}`}
              </Button>
              <Button variant="ghost" onClick={() => setStep("choose")}>
                Altă metodă
              </Button>
            </motion.div>
          )}
          {step === "done" && (
            <motion.div key="d" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pb-3">
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }} className="w-20 h-20 rounded-full bg-volt text-ink grid place-items-center">
                <Check size={40} strokeWidth={3} />
              </motion.div>
              <p className="text-[16px] text-text mt-4">Abonamentul e activ. Spor la antrenament!</p>
              {pct > 0 && (
                <p className="text-[14px] text-violet-ink mt-1 inline-flex items-center gap-1">
                  <Percent size={14} /> Reducerea de 10% a fost aplicată
                </p>
              )}
              <div className="w-full mt-5">
                <Button
                  onClick={() => {
                    setSel(null);
                    nav.pop();
                  }}
                >
                  Gata
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>
    </>
  );
}
