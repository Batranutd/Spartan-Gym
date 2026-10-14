import { motion } from "motion/react";
import { Check, Inbox, Send, Trophy, X } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useTrainerNav } from "../../lib/nav";
import { useTrainer } from "./TrainerApp";
import { Avatar, Badge, Card, CountUp, Empty, Scroll, SectionTitle, Stagger, Toggle } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { toast } from "../../components/ui/Toast";
import { dayOf, diffDays, fmtDate, fmtLong, relDay, today } from "../../lib/date";
import { fullName, lastVisit } from "../../lib/derive";

export function TrainerToday() {
  const t = useTrainer();
  const s = useStore();
  const nav = useTrainerNav();
  const T = today();
  const present = !t.absentDates.includes(T);
  const mine = s.bookings.filter((b) => b.trainerId === t.id);
  const todays = mine.filter((b) => b.date === T && b.status !== "anulată").sort((a, b) => a.time.localeCompare(b.time));
  const requests = mine.filter((b) => b.status === "cerută" && b.date >= T).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const clients = s.clients.filter((c) => c.trainerAccess.includes(t.id));
  const toValidate = s.challenges.flatMap((c) => c.entries.filter((e) => e.status === "trimis").map((e) => ({ c, e })));
  const quiet = clients
    .map((c) => ({ c, lv: lastVisit(s, c.id) }))
    .filter((x) => !x.lv || diffDays(T, dayOf(x.lv)) >= 7)
    .slice(0, 4);
  const cl = (id: string) => s.clients.find((c) => c.id === id);

  return (
    <>
      <header className="safe-top px-4 pb-2 shrink-0">
        <div className="flex items-center gap-3 min-h-12">
          <Avatar name={fullName(t)} photo={t.photo} size={46} id={t.id} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-muted truncate">{fmtLong(T)}</p>
            <h1 className="font-display font-extrabold text-[22px] leading-tight truncate text-text">Salut, {t.firstName}</h1>
          </div>
          <Badge tone="violet">Antrenor</Badge>
        </div>
      </header>
      <Scroll>
        <Stagger>
          <Card className="py-1">
            <Toggle
              on={present}
              onChange={(v) => {
                s.updateTrainer(t.id, { absentDates: v ? t.absentDates.filter((d) => d !== T) : [...t.absentDates, T] });
                toast(v ? "Clienții văd că ești la sală azi" : "Ai marcat că lipsești azi");
              }}
              label="Sunt la sală azi"
              description={present ? "Apari ca disponibil în aplicația clienților" : "Clienții văd că lipsești azi"}
            />
          </Card>
        </Stagger>

        <Stagger i={1} className="grid grid-cols-3 gap-2 mt-3">
          {[
            { l: "Ședințe azi", v: todays.length },
            { l: "Clienți cu acces", v: clients.length },
            { l: "De validat", v: toValidate.length },
          ].map((x) => (
            <div key={x.l} className="rounded-2xl bg-surface border border-line p-3 min-w-0">
              <CountUp value={x.v} className="block font-display font-extrabold text-[26px] text-text leading-tight" />
              <span className="block text-[12px] text-muted leading-tight mt-0.5">{x.l}</span>
            </div>
          ))}
        </Stagger>

        <Stagger i={2} className="mt-6">
          <SectionTitle>Programul de azi</SectionTitle>
          {todays.length ? (
            <div className="flex flex-col gap-2">
              {todays.map((b) => {
                const c = cl(b.clientId);
                return (
                  <Card key={b.id}>
                    <div className="flex items-center gap-3">
                      <div className="w-14 text-center shrink-0">
                        <div className="font-display font-extrabold text-[18px] text-text tabular">{b.time}</div>
                      </div>
                      <button type="button" onClick={() => c && nav.push("client", { id: c.id })} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                        <Avatar name={fullName(c)} photo={c?.photo} size={38} id={b.clientId} />
                        <span className="min-w-0">
                          <span className="block text-[15px] font-semibold text-text truncate">{fullName(c)}</span>
                          <span className="block text-[12px] text-muted truncate">{c?.goals.join(", ")}</span>
                        </span>
                      </button>
                      {b.status === "efectuată" ? (
                        <Badge tone="ok">Efectuată</Badge>
                      ) : (
                        <Button size="sm" full={false} variant="secondary" onClick={() => (s.setBookingStatus(b.id, "efectuată"), toast("Ședință marcată ca efectuată"))}>
                          Efectuată
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-[14px] text-muted">Nicio ședință programată azi.</p>
          )}
        </Stagger>

        <Stagger i={3} className="mt-6">
          <SectionTitle>Cereri de programare</SectionTitle>
          {requests.length ? (
            <div className="flex flex-col gap-2">
              {requests.map((b) => {
                const c = cl(b.clientId);
                return (
                  <motion.div key={b.id} layout className="rounded-3xl bg-surface border border-volt/40 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={fullName(c)} photo={c?.photo} size={42} id={b.clientId} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-semibold text-text truncate">{fullName(c)}</div>
                        <div className="text-[13px] text-muted">
                          {relDay(b.date)}, {fmtDate(b.date, { weekday: "long" })}, ora {b.time}
                        </div>
                      </div>
                    </div>
                    {b.note && <p className="text-[14px] text-text mt-2 rounded-xl bg-surface-2 p-2.5 leading-snug">„{b.note}”</p>}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button size="md" variant="secondary" icon={<X size={17} />} onClick={() => (s.setBookingStatus(b.id, "anulată"), toast("Cerere refuzată"))}>
                        Refuză
                      </Button>
                      <Button size="md" icon={<Check size={17} />} onClick={() => (s.setBookingStatus(b.id, "confirmată"), toast("Ședință confirmată"))}>
                        Confirmă
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Empty icon={<Inbox size={22} />} title="Nicio cerere nouă" text="Cererile clienților apar aici. Le confirmi cu o atingere." />
          )}
        </Stagger>

        <Stagger i={4} className="mt-6">
          <SectionTitle>Rezultate de validat</SectionTitle>
          {toValidate.length ? (
            <div className="flex flex-col gap-2">
              {toValidate.map(({ c, e }) => {
                const m = cl(e.clientId);
                return (
                  <Card key={c.id + e.clientId}>
                    <div className="flex items-center gap-3">
                      <Trophy size={20} className="text-violet-ink shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-semibold text-text truncate">{fullName(m)}</div>
                        <div className="text-[13px] text-muted truncate">
                          {c.title}: <b className="text-text tabular">{e.value}</b> {c.unit}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button size="sm" variant="secondary" onClick={() => (s.validateEntry(c.id, e.clientId, false, t.id), toast("Rezultat respins"))}>
                        Respinge
                      </Button>
                      <Button size="sm" onClick={() => (s.validateEntry(c.id, e.clientId, true, t.id), toast(`Validat. ${m?.firstName} a primit ${c.points} de puncte.`))}>
                        L-am văzut, validez
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-[14px] text-muted">Nimic de validat acum.</p>
          )}
        </Stagger>

        {quiet.length > 0 && (
          <Stagger i={5} className="mt-6">
            <SectionTitle>Clienți care n-au mai venit</SectionTitle>
            <Card className="py-1">
              {quiet.map(({ c, lv }, i) => (
                <div key={c.id} className={`flex items-center gap-3 py-2.5 ${i ? "border-t border-line" : ""}`}>
                  <Avatar name={fullName(c)} photo={c.photo} size={36} id={c.id} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] text-text font-semibold truncate">{fullName(c)}</div>
                    <div className="text-[12px] text-muted">{lv ? `Ultima vizită: ${relDay(dayOf(lv))}` : "Nicio vizită încă"}</div>
                  </div>
                  <Button
                    size="sm"
                    full={false}
                    variant="secondary"
                    icon={<Send size={15} />}
                    onClick={() => {
                      s.sendNotice({ to: c.id, title: `Mesaj de la ${t.firstName}`, body: "Mi-a fost dor de tine la sală! Hai săptămâna asta, îți pregătesc un antrenament bun.", kind: "antrenor" });
                      toast(`Mesaj trimis lui ${c.firstName}`);
                    }}
                  >
                    Mesaj
                  </Button>
                </div>
              ))}
            </Card>
          </Stagger>
        )}
      </Scroll>
    </>
  );
}
