import { useState } from "react";
import { motion } from "motion/react";
import { Check, Star, X } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Avatar, Badge } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { toast, confirmDialog } from "../../components/ui/Toast";
import { Drawer, Panel, type AdminPageProps } from "./AdminApp";
import { DAY_ABBR, dayOf, fmtDate, today } from "../../lib/date";
import { fullName } from "../../lib/derive";
import { lei } from "../../lib/id";
import { avgStars } from "../client/GymInfo";
import type { Trainer } from "../../data/types";

export function AdminTrainers(_: AdminPageProps) {
  const s = useStore();
  const [open, setOpen] = useState<Trainer | null>(null);
  const pending = s.trainers.filter((t) => t.status === "în așteptare");
  const active = s.trainers.filter((t) => t.status === "aprobat");

  const decide = async (t: Trainer, ok: boolean) => {
    if (!ok && !(await confirmDialog({ title: `Respingi profilul lui ${t.firstName}?`, text: "Antrenorul nu va apărea în aplicația clienților.", ok: "Respinge", danger: true }))) return;
    s.setTrainerStatus(t.id, ok ? "aprobat" : "respins");
    toast(ok ? `${t.firstName} apare acum în aplicație` : "Profil respins");
    setOpen(null);
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <Panel title={`Așteaptă aprobarea (${pending.length})`}>
        {pending.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {pending.map((t) => (
              <motion.div key={t.id} layout className="rounded-2xl bg-surface-2 border border-violet/40 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={fullName(t)} photo={t.photo} size={52} id={t.id} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[16px] text-text">{fullName(t)}</div>
                    <div className="text-[13px] text-muted truncate">
                      {t.specialties.join(" · ")} · {t.yearsExp} ani
                    </div>
                    <div className="text-[12px] text-faint">Trimis pe {fmtDate(dayOf(t.createdAt), { day: "numeric", month: "long" })}</div>
                  </div>
                </div>
                <p className="text-[14px] text-text mt-3 leading-snug line-clamp-3">{t.bio}</p>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Button size="sm" variant="secondary" onClick={() => setOpen(t)}>
                    Detalii
                  </Button>
                  <Button size="sm" variant="danger" icon={<X size={15} />} onClick={() => decide(t, false)}>
                    Respinge
                  </Button>
                  <Button size="sm" icon={<Check size={15} />} onClick={() => decide(t, true)}>
                    Aprobă
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-muted">Nicio cerere nouă. Antrenorii se înscriu din aplicație, la „Personal sală”.</p>
        )}
      </Panel>

      <Panel title={`Antrenori activi (${active.length})`}>
        <div className="flex flex-col divide-y divide-line">
          {active.map((t) => {
            const rv = s.reviews.filter((r) => r.target === t.id);
            const clients = s.clients.filter((c) => c.trainerAccess.includes(t.id)).length;
            const upcoming = s.bookings.filter((b) => b.trainerId === t.id && b.date >= today() && b.status !== "anulată").length;
            const present = !t.absentDates.includes(today());
            return (
              <button key={t.id} type="button" onClick={() => setOpen(t)} className="flex flex-wrap items-center gap-3 py-3 text-left">
                <Avatar name={fullName(t)} photo={t.photo} size={44} id={t.id} />
                <div className="flex-1 min-w-[160px]">
                  <div className="text-[15px] font-semibold text-text">{fullName(t)}</div>
                  <div className="text-[13px] text-muted truncate">{t.specialties.join(" · ")}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={present ? "ok" : "danger"}>{present ? "La sală azi" : "Lipsește azi"}</Badge>
                  <Badge>{clients} clienți</Badge>
                  <Badge>{upcoming} programări</Badge>
                  {rv.length > 0 && (
                    <Badge tone="warn">
                      <Star size={12} fill="currentColor" /> {avgStars(rv).toFixed(1).replace(".", ",")}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? fullName(open) : ""}>
        {open && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={fullName(open)} photo={open.photo} size={72} id={open.id} />
              <div className="min-w-0">
                <div className="text-[14px] text-muted truncate">{open.email}</div>
                <div className="text-[14px] text-text tabular">{open.phone.replace("+40", "0")}</div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {open.specialties.map((x) => (
                    <Badge key={x} tone="volt">
                      {x}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-surface border border-line p-4">
              <div className="text-[13px] text-muted">Descriere</div>
              <p className="text-[14px] text-text mt-1 leading-relaxed">{open.bio}</p>
              <div className="text-[13px] text-muted mt-3">Istoric ({open.yearsExp} ani)</div>
              <p className="text-[14px] text-text mt-1 leading-relaxed">{open.history || "–"}</p>
            </div>
            <div className="rounded-2xl bg-surface border border-line p-4">
              <div className="text-[13px] text-muted mb-2">Pachete</div>
              {open.packages.map((p) => (
                <div key={p.id} className="flex justify-between gap-2 py-1.5 text-[14px]">
                  <span className="text-text">{p.name}</span>
                  <span className="text-text font-semibold tabular">{lei(p.price)}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-surface border border-line p-4">
              <div className="text-[13px] text-muted mb-2">Disponibilitate</div>
              <div className="flex flex-wrap gap-1.5">
                {open.availability.map((a) => (
                  <Badge key={a.day}>
                    {DAY_ABBR[a.day]} {a.from}–{a.to}
                  </Badge>
                ))}
              </div>
            </div>
            {open.evolutionPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {open.evolutionPhotos.map((p, i) => (
                  <img key={i} src={p} alt="" className="aspect-[3/4] w-full object-cover rounded-2xl" />
                ))}
              </div>
            )}
            {open.status === "în așteptare" ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="danger" onClick={() => decide(open, false)}>
                  Respinge
                </Button>
                <Button onClick={() => decide(open, true)}>Aprobă</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => decide(open, false)}>
                Scoate din aplicație
              </Button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
