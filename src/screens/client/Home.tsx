import { useMemo } from "react";
import { motion } from "motion/react";
import { Bell, CalendarClock, ChevronRight, Dumbbell, Flame, Megaphone, QrCode, Sparkles, Users, Zap } from "lucide-react";
import { useStore, pointsOf } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Avatar, Badge, Bar, Card, CountUp, LinkButton, Ring, Scroll, SectionTitle, Stagger, ease } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { clientCheckIns, monthStart, occupancy, streakWeeks, subInfo, visitsBetween } from "../../lib/derive";
import { DAY_NAMES, dayOf, fmtDate, fmtLong, today, weekday } from "../../lib/date";
import { targetFor } from "../../lib/nutrition";

export function Home() {
  const me = useMe();
  const s = useStore();
  const nav = useClientNav();
  const info = useMemo(() => subInfo(s, me.id), [s, me.id]);
  const checks = useMemo(() => clientCheckIns(s, me.id), [s, me.id]);
  const visitsMonth = visitsBetween(checks, monthStart());
  const streak = streakWeeks(checks);
  const pts = pointsOf(s, me.id);
  const occ = occupancy(s);
  const checkedToday = checks.some((c) => dayOf(c.at) === today());
  const planToday = me.weekPlan[weekday()] ?? [];
  const logToday = s.workouts.find((w) => w.clientId === me.id && w.date === today());
  const unread = s.notices.filter((n) => (n.to === me.id || n.to === "toți") && !n.readBy.includes(me.id)).length;
  const foodsToday = s.foods.filter((f) => f.clientId === me.id && f.date === today());
  const kcal = foodsToday.reduce((a, f) => a + f.kcal, 0);
  const target = targetFor(me);
  const announcements = s.notices.filter((n) => n.to === "toți").slice(-2).reverse();
  const hasHistory = s.workouts.some((w) => w.clientId === me.id && w.date < today());
  const plan = info.sub ? s.plans.find((p) => p.id === info.sub!.planId) : null;
  const hour = new Date().getHours();
  const hello = hour < 11 ? "Bună dimineața" : hour < 18 ? "Salut" : "Bună seara";

  const stateTone = info.state === "activ" ? "ok" : info.state === "expiră curând" ? "warn" : "danger";

  return (
    <>
      <header className="safe-top px-4 pb-2 shrink-0">
        <div className="flex items-center gap-3 min-h-12">
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => nav.push("profile")} aria-label="Profilul meu" className="rounded-full">
            <Avatar name={`${me.firstName} ${me.lastName}`} photo={me.photo} size={46} id={me.id} />
          </motion.button>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-muted truncate">{fmtLong(today())}</p>
            <h1 className="font-display font-extrabold text-[22px] leading-tight truncate text-text">
              {hello}, {me.firstName}
            </h1>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => nav.push("notifications")} aria-label={`Notificări${unread ? `, ${unread} necitite` : ""}`} className="relative w-11 h-11 rounded-full bg-surface-2 border border-line grid place-items-center text-text">
            <Bell size={21} />
            {unread > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-volt text-ink text-[11px] font-bold grid place-items-center">
                {unread}
              </motion.span>
            )}
          </motion.button>
        </div>
      </header>

      <Scroll>
        {/* Abonamentul */}
        <Stagger i={0}>
          <div className="relative rounded-[28px] overflow-hidden border border-line bg-surface p-4">
            <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-volt/10 blur-3xl" aria-hidden />
            <div className="relative flex items-center gap-4">
              <Ring pct={info.pct} size={108} stroke={10} color={info.state === "expiră curând" ? "var(--color-warn)" : "var(--color-volt)"}>
                {info.active ? (
                  <div>
                    <CountUp value={info.daysLeft} className="font-display font-extrabold text-[34px] leading-none text-text" />
                    <div className="text-[12px] text-muted mt-1">{info.daysLeft === 1 ? "zi rămasă" : "zile rămase"}</div>
                  </div>
                ) : (
                  <CalendarClock size={34} className="text-faint" />
                )}
              </Ring>
              <div className="flex-1 min-w-0">
                <Badge tone={info.sub ? stateTone : "neutral"}>{info.pending && !info.active ? "De plătit la recepție" : info.state === "fără abonament" ? "Fără abonament" : info.state === "activ" ? "Activ" : info.state === "expiră curând" ? "Expiră curând" : "Expirat"}</Badge>
                <div className="font-display font-bold text-[18px] mt-2 leading-tight text-text text-balance">{plan ? `Abonament ${plan.name}` : "Niciun abonament activ"}</div>
                {info.sub ? (
                  <p className="text-[13px] text-muted mt-1 leading-snug">
                    {info.active ? "Valabil până pe" : "A expirat pe"} <span className="text-text font-semibold">{fmtDate(info.sub.end, { day: "numeric", month: "long" })}</span>
                  </p>
                ) : (
                  <p className="text-[13px] text-muted mt-1 leading-snug">Plătești din aplicație sau la recepție.</p>
                )}
              </div>
            </div>
            {info.active && info.sub && (
              <div className="relative mt-4">
                <Bar pct={1 - info.pct} className="h-1.5" color="bg-muted" />
                <div className="flex justify-between text-[12px] text-muted mt-1.5 tabular">
                  <span>{fmtDate(info.sub.start)}</span>
                  <span>Azi</span>
                  <span>{fmtDate(info.sub.end)}</span>
                </div>
              </div>
            )}
            <div className="relative grid grid-cols-2 gap-2 mt-4">
              {info.active ? (
                <Button size="md" icon={<QrCode size={19} />} onClick={() => nav.push("checkin")}>
                  {checkedToday ? "Cod QR" : "Check-in"}
                </Button>
              ) : (
                <Button size="md" onClick={() => nav.push("plans")}>
                  Abonamente
                </Button>
              )}
              <Button size="md" variant="secondary" onClick={() => nav.push("subscription")}>
                {info.active ? "Detalii" : "Istoric"}
              </Button>
            </div>
          </div>
        </Stagger>

        {/* Statistici */}
        <Stagger i={1} className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: "Vizite luna asta", v: visitsMonth, icon: <Dumbbell size={16} className="text-volt" /> },
            { label: "Săptămâni la rând", v: streak, icon: <Flame size={16} className="text-warn" /> },
            { label: "Puncte", v: pts, icon: <Zap size={16} className="text-violet-ink" /> },
          ].map((x, i) => (
            <motion.button
              key={x.label}
              whileTap={{ scale: 0.96 }}
              onClick={() => (i === 2 ? nav.setTab("community") : nav.setTab("workout"))}
              className="rounded-2xl bg-surface border border-line p-3 text-left min-w-0 flex flex-col items-start justify-start"
            >
              {x.icon}
              <CountUp value={x.v} className="block font-display font-extrabold text-[24px] leading-tight mt-1.5 text-text" />
              <span className="block text-[12px] text-muted leading-tight mt-0.5">{x.label}</span>
            </motion.button>
          ))}
        </Stagger>

        {/* Antrenamentul de azi */}
        <Stagger i={2} className="mt-6">
          <SectionTitle action={<LinkButton onClick={() => nav.setTab("workout")}>Deschide</LinkButton>}>Azi, {DAY_NAMES[weekday()].toLowerCase()}</SectionTitle>
          <Card onClick={() => nav.setTab("workout")}>
            {planToday.length || logToday?.groups.length ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-volt-soft text-volt grid place-items-center shrink-0">
                  <Dumbbell size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[16px] text-text truncate">{(logToday?.groups.length ? logToday.groups : planToday).join(" + ")}</div>
                  <div className="text-[13px] text-muted mt-0.5">{logToday?.done ? "Antrenament terminat. Bravo!" : logToday?.exercises.length ? `${logToday.exercises.length} exerciții notate` : "Atinge ca să începi"}</div>
                </div>
                {logToday?.done ? <Badge tone="ok">Gata</Badge> : <ChevronRight size={20} className="text-faint shrink-0" />}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-3 text-muted grid place-items-center shrink-0">
                  <Sparkles size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[16px] text-text">Zi de odihnă</div>
                  <div className="text-[13px] text-muted mt-0.5">Recuperarea face parte din progres.</div>
                </div>
              </div>
            )}
          </Card>
        </Stagger>

        {/* Ocupare */}
        <Stagger i={3} className="mt-3">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-3 grid place-items-center shrink-0 text-text">
                <Users size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[16px] text-text">Sala acum</span>
                  <Badge tone={occ.label === "Liber" ? "ok" : occ.label === "Moderat" ? "warn" : "danger"}>{occ.label}</Badge>
                </div>
                <div className="mt-2">
                  <Bar pct={occ.pct} color={occ.label === "Liber" ? "bg-ok" : occ.label === "Moderat" ? "bg-warn" : "bg-danger"} />
                </div>
                <div className="text-[12px] text-muted mt-1.5">Aproximativ {occ.people} persoane. Cel mai liber: 10:00–15:00.</div>
              </div>
            </div>
          </Card>
        </Stagger>

        {/* Nutriție */}
        <Stagger i={4} className="mt-6">
          <SectionTitle action={<LinkButton onClick={() => nav.setTab("nutrition")}>Jurnal</LinkButton>}>Nutriția de azi</SectionTitle>
          <Card onClick={() => nav.setTab("nutrition")}>
            <div className="flex items-center gap-4">
              <Ring pct={kcal / target.kcal} size={74} stroke={8} color="var(--color-violet-ink)">
                <span className="text-[13px] font-bold text-text tabular">{Math.round((kcal / target.kcal) * 100)}%</span>
              </Ring>
              <div className="flex-1 min-w-0">
                <div className="text-text">
                  <span className="font-display font-extrabold text-[24px] tabular">{kcal}</span>
                  <span className="text-[14px] text-muted"> / {target.kcal} kcal</span>
                </div>
                <div className="text-[13px] text-muted mt-1">
                  {foodsToday.length ? `Proteine ${Math.round(foodsToday.reduce((a, f) => a + f.p, 0))} din ${target.p} g` : "Scanează primul aliment al zilei"}
                </div>
              </div>
              <ChevronRight size={20} className="text-faint shrink-0" />
            </div>
          </Card>
        </Stagger>

        {/* Anunțuri */}
        {announcements.length > 0 && (
          <Stagger i={5} className="mt-6">
            <SectionTitle>Anunțuri de la sală</SectionTitle>
            <div className="flex flex-col gap-2">
              {announcements.map((n) => (
                <Card key={n.id}>
                  <div className="flex gap-3">
                    <Megaphone size={20} className="text-volt shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-semibold text-[15px] text-text">{n.title}</div>
                      <p className="text-[14px] text-muted mt-0.5 leading-snug">{n.body}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Stagger>
        )}

        {!hasHistory && (
          <Stagger i={6} className="mt-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, ease }} className="rounded-3xl border border-dashed border-line-strong p-4">
              <div className="font-semibold text-[15px] text-text">Vrei să vezi aplicația cu date?</div>
              <p className="text-[14px] text-muted mt-1 leading-snug">Adăugăm 4 săptămâni de antrenamente, cântăriri și mesele de azi, ca exemplu. Le poți șterge resetând demo-ul.</p>
              <div className="mt-3">
                <Button size="sm" variant="secondary" full={false} onClick={() => s.fillDemoHistory(me.id)}>
                  Completează cu date demo
                </Button>
              </div>
            </motion.div>
          </Stagger>
        )}
      </Scroll>
    </>
  );
}
