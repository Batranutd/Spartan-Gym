import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, LogOut, Plus, ShieldCheck, Star, Trash2, User } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useTrainer } from "./TrainerApp";
import { Avatar, Card, Scroll, SectionTitle, Stars, TextArea, TopBar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { ChipGroup } from "../../components/ui/Chip";
import { Stepper } from "../../components/ui/Stepper";
import { toast } from "../../components/ui/Toast";
import { PackageEditor, SPECIALTIES } from "../onboarding/Staff";
import { fileToDataUrl, fileToSquareDataUrl } from "../../lib/image";
import { dayOf, fmtDate } from "../../lib/date";
import { fullName } from "../../lib/derive";
import { avgStars } from "../client/GymInfo";
import type { TrainerPackage } from "../../data/types";

export function TrainerProfileEdit() {
  const t = useTrainer();
  const s = useStore();
  const photoRef = useRef<HTMLInputElement>(null);
  const evoRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ photo: t.photo, bio: t.bio, history: t.history, yearsExp: t.yearsExp as number | null, specialties: t.specialties, packages: t.packages, evolutionPhotos: t.evolutionPhotos });
  const reviews = s.reviews.filter((r) => r.target === t.id);

  const save = () => {
    s.updateTrainer(t.id, { ...f, yearsExp: f.yearsExp ?? 0, packages: f.packages.filter((p) => p.name.trim() && p.price > 0).map((p) => ({ ...p, includes: p.includes.filter(Boolean) })) });
    toast("Profilul public a fost actualizat");
  };

  return (
    <>
      <TopBar title="Profilul meu public" />
      <Scroll>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => photoRef.current?.click()} className="relative shrink-0" aria-label="Schimbă poza">
              <Avatar name={fullName(t)} photo={f.photo} size={84} id={t.id} />
              <span className="absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-volt text-ink grid place-items-center border-4 border-ink">
                <Camera size={15} />
              </span>
            </motion.button>
            <input ref={photoRef} type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")} accept="image/*" hidden onChange={async (e) => e.target.files?.[0] && setF({ ...f, photo: await fileToSquareDataUrl(e.target.files[0]) })} />
            <div className="min-w-0">
              <div className="font-display font-extrabold text-[20px] text-text truncate">{fullName(t)}</div>
              <div className="text-[13px] text-muted truncate">{t.email}</div>
              {reviews.length > 0 && (
                <div className="text-[13px] text-text mt-1 inline-flex items-center gap-1">
                  <Star size={13} className="text-warn" fill="currentColor" /> {avgStars(reviews).toFixed(1).replace(".", ",")} din {reviews.length} recenzii
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Specializări</div>
            <ChipGroup options={SPECIALTIES} value={f.specialties} onChange={(v) => setF({ ...f, specialties: v })} max={4} />
          </div>
          <Stepper label="Ani de experiență" unit="ani" value={f.yearsExp} placeholder={3} min={0} max={50} onChange={(v) => setF({ ...f, yearsExp: v })} />
          <TextArea label="Descriere pentru clienți" value={f.bio} onChange={(v) => setF({ ...f, bio: v })} />
          <TextArea label="Istoric în acest sport" value={f.history} onChange={(v) => setF({ ...f, history: v })} />

          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Poze cu evoluția ta</div>
            <div className="grid grid-cols-3 gap-2">
              {f.evolutionPhotos.map((p, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button type="button" aria-label="Șterge poza" onClick={() => setF({ ...f, evolutionPhotos: f.evolutionPhotos.filter((_, k) => k !== i) })} className="absolute top-1 right-1 w-8 h-8 rounded-full bg-ink/80 text-text grid place-items-center">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {f.evolutionPhotos.length < 6 && (
                <button type="button" onClick={() => evoRef.current?.click()} className="aspect-[3/4] rounded-2xl border border-dashed border-line-strong grid place-items-center text-volt" aria-label="Adaugă poză">
                  <Plus size={24} />
                </button>
              )}
            </div>
            <input ref={evoRef} type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")} accept="image/*" hidden onChange={async (e) => e.target.files?.[0] && setF({ ...f, evolutionPhotos: [...f.evolutionPhotos, await fileToDataUrl(e.target.files[0], 700, 0.75)] })} />
          </div>

          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Pachete și prețuri</div>
            <div className="flex flex-col gap-3">
              {f.packages.map((p, i) => (
                <PackageEditor key={p.id} p={p} onChange={(np) => setF({ ...f, packages: f.packages.map((x, k) => (k === i ? np : x)) })} onDelete={f.packages.length > 1 ? () => setF({ ...f, packages: f.packages.filter((_, k) => k !== i) }) : undefined} />
              ))}
              <Button variant="secondary" icon={<Plus size={18} />} onClick={() => setF({ ...f, packages: [...f.packages, { id: `pk-${Date.now()}`, name: "", price: 0, sessions: 1, includes: [] } as TrainerPackage] })}>
                Adaugă pachet
              </Button>
            </div>
          </div>
          <Button onClick={save}>Salvează profilul</Button>

          <div>
            <SectionTitle>Recenziile mele</SectionTitle>
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
              <p className="text-[14px] text-muted">Încă nu ai recenzii.</p>
            )}
          </div>

          <Card>
            <div className="text-[15px] font-semibold text-text">Mod demo</div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button size="md" variant="secondary" icon={<ShieldCheck size={18} />} onClick={() => s.enterAs("admin")}>
                Admin
              </Button>
              <Button size="md" variant="secondary" icon={<User size={18} />} onClick={() => s.logout()}>
                Client
              </Button>
            </div>
          </Card>
          <Button variant="outline" icon={<LogOut size={19} />} onClick={() => s.logout()}>
            Ieși din cont
          </Button>
        </div>
      </Scroll>
    </>
  );
}
