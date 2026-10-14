import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CalendarCheck, Check, Clock, Star } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Avatar, Badge, Card, Scroll, SectionTitle, Stagger, Stars, TextArea, Toggle, TopBar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Sheet } from "../../components/ui/Sheet";
import { toast } from "../../components/ui/Toast";
import { addDays, DAY_ABBR, DAY_NAMES, dayOf, fmtDate, today, weekday } from "../../lib/date";
import { fullName } from "../../lib/derive";
import { lei } from "../../lib/id";
import { avgStars } from "./GymInfo";
import type { Trainer, Booking } from "../../data/types";

export function slotsFor(t: Trainer, date: string, bookings: Booking[]) {
  if (t.absentDates.includes(date)) return [];
  const av = t.availability.filter((a) => a.day === weekday(date));
  const taken = bookings.filter((b) => b.trainerId === t.id && b.date === date && b.status !== "anulată").map((b) => b.time);
  const out: string[] = [];
  av.forEach((a) => {
    for (let h = parseInt(a.from); h < parseInt(a.to); h++) {
      const time = `${String(h).padStart(2, "0")}:00`;
      if (!taken.includes(time)) out.push(time);
    }
  });
  if (date === today()) {
    const now = new Date().getHours();
    return out.filter((x) => parseInt(x) > now);
  }
  return out;
}

export function TrainerProfile({ params }: { params?: Record<string, string> }) {
  const me = useMe();
  const nav = useClientNav();
  const s = useStore();
  const t = s.trainers.find((x) => x.id === params?.id);
  const [book, setBook] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [rev, setRev] = useState(false);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const days = useMemo(() => (t ? Array.from({ length: 14 }, (_, i) => addDays(today(), i)).filter((d) => slotsFor(t, d, s.bookings).length) : []), [t, s.bookings]);
  if (!t) return null;
  const reviews = s.reviews.filter((r) => r.target === t.id);
  const hasAccess = me.trainerAccess.includes(t.id);
  const myBookings = s.bookings.filter((b) => b.trainerId === t.id && b.clientId === me.id && b.date >= today() && b.status !== "anulată");

  return (
    <>
      <TopBar title={fullName(t)} onBack={nav.pop} />
      <Scroll>
        <Stagger>
          <div className="flex flex-col items-center text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
              <Avatar name={fullName(t)} photo={t.photo} size={104} id={t.id} />
            </motion.div>
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {t.specialties.map((x) => (
                <Badge key={x} tone="volt">
                  {x}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[14px]">
              <span className="text-text">
                <b className="tabular">{t.yearsExp}</b> <span className="text-muted">ani experiență</span>
              </span>
              {reviews.length > 0 && (
                <span className="inline-flex items-center gap-1 text-text">
                  <Star size={14} className="text-warn" fill="currentColor" />
                  <b>{avgStars(reviews).toFixed(1).replace(".", ",")}</b> <span className="text-muted">({reviews.length})</span>
                </span>
              )}
            </div>
          </div>
        </Stagger>

        <Stagger i={1} className="mt-5">
          <Card>
            <p className="text-[15px] text-text leading-relaxed">{t.bio}</p>
            <div className="mt-3 pt-3 border-t border-line">
              <div className="text-[13px] font-semibold text-muted mb-1">Istoric în sport</div>
              <p className="text-[14px] text-text leading-relaxed">{t.history}</p>
            </div>
          </Card>
        </Stagger>

        {myBookings.length > 0 && (
          <Stagger i={2} className="mt-3">
            {myBookings.map((b) => (
              <div key={b.id} className="rounded-2xl bg-volt-soft border border-volt/30 p-3 flex items-center gap-3 mb-2">
                <CalendarCheck size={20} className="text-volt shrink-0" />
                <span className="flex-1 text-[14px] text-text">
                  {fmtDate(b.date, { weekday: "long", day: "numeric", month: "long" })}, ora {b.time}
                </span>
                <Badge tone={b.status === "confirmată" ? "ok" : "warn"}>{b.status === "confirmată" ? "Confirmată" : "Așteaptă"}</Badge>
              </div>
            ))}
          </Stagger>
        )}

        <Stagger i={3} className="mt-6">
          <SectionTitle>Pachete și prețuri</SectionTitle>
          <div className="flex flex-col gap-2">
            {t.packages.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-[16px] text-text">{p.name}</div>
                    <div className="text-[13px] text-muted">{p.sessions ? `${p.sessions} ${p.sessions === 1 ? "ședință" : "ședințe"}` : "Lunar"}</div>
                  </div>
                  <div className="font-display font-extrabold text-[20px] text-text tabular shrink-0">{lei(p.price)}</div>
                </div>
                <ul className="mt-2 flex flex-col gap-1">
                  {p.includes.map((x) => (
                    <li key={x} className="flex items-center gap-2 text-[14px] text-text">
                      <Check size={15} className="text-volt shrink-0" />
                      {x}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Stagger>

        <Stagger i={4} className="mt-6">
          <SectionTitle>Când e la sală</SectionTitle>
          <Card className="py-1">
            {DAY_NAMES.map((d, i) => {
              const av = t.availability.filter((a) => a.day === i);
              return (
                <div key={d} className={`flex items-center justify-between gap-3 py-2.5 ${i ? "border-t border-line" : ""}`}>
                  <span className="text-[14px] text-text">{d}</span>
                  <span className={`text-[14px] tabular ${av.length ? "text-text font-semibold" : "text-faint"}`}>{av.length ? av.map((a) => `${a.from}–${a.to}`).join(", ") : "Liber"}</span>
                </div>
              );
            })}
          </Card>
          {t.absentDates.filter((d) => d >= today()).length > 0 && <p className="text-[13px] text-warn mt-2">Lipsește: {t.absentDates.filter((d) => d >= today()).map((d) => fmtDate(d)).join(", ")}</p>}
        </Stagger>

        {t.evolutionPhotos.length > 0 && (
          <Stagger i={5} className="mt-6">
            <SectionTitle>Evoluția antrenorului</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {t.evolutionPhotos.map((p, i) => (
                <img key={i} src={p} alt="" className="aspect-[3/4] w-full object-cover rounded-2xl" />
              ))}
            </div>
          </Stagger>
        )}

        <Stagger i={6} className="mt-6">
          <Card>
            <Toggle
              on={hasAccess}
              onChange={(v) => {
                s.setTrainerAccess(me.id, t.id, v);
                toast(v ? `${t.firstName} îți poate vedea antrenamentele, nutriția și progresul` : "Acces retras");
              }}
              label="Îmi poate vedea datele"
              description="Antrenamente, serii, nutriție și progres. Pozele rămân după setarea fiecăreia."
            />
          </Card>
        </Stagger>

        <Stagger i={7} className="mt-6">
          <SectionTitle action={<Button size="sm" full={false} variant="secondary" onClick={() => setRev(true)}>Scrie</Button>}>Recenzii</SectionTitle>
          {reviews.length ? (
            <div className="flex flex-col gap-2">
              {reviews.map((r) => {
                const c = s.clients.find((x) => x.id === r.clientId);
                return (
                  <Card key={r.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-text truncate">{c ? `${c.firstName} ${c.lastName[0]}.` : "Membru"}</span>
                      <Stars value={r.stars} size={13} />
                    </div>
                    <p className="text-[14px] text-text mt-1.5 leading-snug">{r.text}</p>
                    <div className="text-[12px] text-muted mt-1">{fmtDate(dayOf(r.at))}</div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-[14px] text-muted">Încă nu are recenzii.</p>
          )}
        </Stagger>
      </Scroll>

      <div className="absolute bottom-0 inset-x-0 px-4 pt-3 safe-bottom bg-ink/95 backdrop-blur-md border-t border-line z-20">
        <Button icon={<CalendarCheck size={20} />} onClick={() => setBook(true)}>
          Programează o ședință
        </Button>
      </div>

      <Sheet
        open={book}
        onClose={() => setBook(false)}
        title="Alege ziua și ora"
        footer={
          <Button
            disabled={!date || !time}
            onClick={() => {
              if (!date || !time) return;
              s.requestBooking({ trainerId: t.id, clientId: me.id, date, time, note: note.trim() || undefined });
              toast(`Cerere trimisă. ${t.firstName} confirmă în curând.`);
              setBook(false);
              setDate(null);
              setTime(null);
              setNote("");
            }}
          >
            {date && time ? `Trimite cererea pentru ${time}` : "Alege ora"}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {days.map((d) => (
              <button key={d} type="button" onClick={() => { setDate(d); setTime(null); }} className={`shrink-0 w-16 h-[72px] rounded-2xl flex flex-col items-center justify-center border ${date === d ? "bg-volt text-ink border-volt" : "bg-surface-2 text-text border-line"}`}>
                <span className={`text-[12px] font-semibold ${date === d ? "text-ink" : "text-muted"}`}>{DAY_ABBR[weekday(d)]}</span>
                <span className="font-display font-extrabold text-[22px] leading-tight">{parseInt(d.slice(8))}</span>
              </button>
            ))}
          </div>
          {date ? (
            <div className="grid grid-cols-4 gap-2">
              {slotsFor(t, date, s.bookings).map((h) => (
                <button key={h} type="button" onClick={() => setTime(h)} className={`h-11 rounded-xl text-[15px] font-semibold tabular ${time === h ? "bg-volt text-ink" : "bg-surface-2 text-text border border-line"}`}>
                  {h}
                </button>
              ))}
            </div>
          ) : (
            <p className="inline-flex items-center gap-1.5">
              <Clock size={15} /> Alege o zi ca să vezi orele libere.
            </p>
          )}
          <TextArea label="Mesaj pentru antrenor (opțional)" value={note} onChange={setNote} rows={2} placeholder="De exemplu: vreau să lucrăm la genuflexiuni" />
          <p className="text-[13px] text-faint -mt-2">Programarea îi dă antrenorului acces la datele tale. Îl poți retrage oricând.</p>
        </div>
      </Sheet>

      <Sheet open={rev} onClose={() => setRev(false)} title={`Recenzie pentru ${t.firstName}`}>
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex justify-center">
            <Stars value={stars} onChange={setStars} size={34} />
          </div>
          <TextArea label="Părerea ta" value={text} onChange={setText} placeholder="Cum a fost antrenamentul?" />
          <Button
            onClick={() => {
              if (text.trim().length < 3) return toast("Scrie câteva cuvinte", "info");
              s.addReview(me.id, stars, text.trim(), t.id);
              setRev(false);
              setText("");
              toast("Mulțumim pentru recenzie!");
            }}
          >
            Publică
          </Button>
        </div>
      </Sheet>
    </>
  );
}
