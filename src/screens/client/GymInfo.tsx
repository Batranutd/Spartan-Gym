import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronRight, Clock, Dumbbell, ImageIcon, MapPin, MessageSquareWarning, Phone, Star, Wrench, X } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Avatar, Badge, Card, Scroll, SectionTitle, Stars, Stagger, TextArea, TopBar, Bar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Sheet } from "../../components/ui/Sheet";
import { toast } from "../../components/ui/Toast";
import { fullName, occupancy } from "../../lib/derive";
import { dayOf, fmtDate } from "../../lib/date";
import { lei } from "../../lib/id";
import { MUSCLE_GROUPS, type GalleryItem } from "../../data/types";

const SECTIONS = [
  { id: "preturi", label: "Prețuri" },
  { id: "bar", label: "Bar" },
  { id: "dotari", label: "Dotări" },
  { id: "galerie", label: "Galerie" },
  { id: "aparate", label: "Aparate" },
  { id: "antrenori", label: "Antrenori" },
  { id: "recenzii", label: "Recenzii" },
];

export function avgStars(list: { stars: number }[]) {
  return list.length ? list.reduce((a, r) => a + r.stars, 0) / list.length : 0;
}

export function GalleryTile({ g, onClick }: { g: GalleryItem; onClick?: () => void }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={onClick} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-2 border border-line text-left">
      {g.img ? (
        <img src={g.img} alt={g.caption} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center" style={{ background: "linear-gradient(140deg, #1F2229 0%, #282C35 60%, #2B2F45 100%)" }}>
          <ImageIcon size={26} className="text-faint" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-ink via-ink/80 to-transparent">
        <span className="block text-[12px] font-semibold text-text leading-tight line-clamp-2">{g.caption}</span>
      </div>
    </motion.button>
  );
}

export function GymInfo() {
  const s = useStore();
  const me = useMe();
  const nav = useClientNav();
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("preturi");
  const [img, setImg] = useState<GalleryItem | null>(null);
  const [write, setWrite] = useState(false);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const occ = occupancy(s);
  const gymReviews = s.reviews.filter((r) => r.target === "sală");
  const avg = avgStars(gymReviews);
  const approved = s.trainers.filter((t) => t.status === "aprobat");

  const go = (id: string) => {
    setActive(id);
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <TopBar title={s.gym.name} subtitle={s.gym.address} />
      <div className="shrink-0 flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2.5">
        {SECTIONS.map((x) => (
          <button key={x.id} type="button" onClick={() => go(x.id)} className={`shrink-0 h-9 px-3.5 rounded-full text-[14px] font-semibold border ${active === x.id ? "bg-volt text-ink border-volt" : "bg-surface text-text border-line"}`}>
            {x.label}
          </button>
        ))}
      </div>
      <div ref={scroller} className="contents">
        <Scroll className="scroll-pt-2">
          <Stagger>
            <Card>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5 text-[14px] text-text">
                  <MapPin size={18} className="text-volt shrink-0 mt-0.5" />
                  <span className="select-text">{s.gym.address}</span>
                </div>
                <div className="flex items-start gap-2.5 text-[14px] text-text">
                  <Phone size={18} className="text-volt shrink-0 mt-0.5" />
                  <span className="select-text tabular">{s.gym.phone}</span>
                </div>
                <div className="flex items-start gap-2.5 text-[14px]">
                  <Clock size={18} className="text-volt shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    {s.gym.hours.map((h) => (
                      <div key={h.label} className="flex justify-between gap-3">
                        <span className="text-muted">{h.label}</span>
                        <span className="text-text tabular">{h.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-line">
                <div className="flex justify-between text-[14px] mb-1.5">
                  <span className="text-text font-medium">Ocupare acum</span>
                  <span className="text-muted">
                    {occ.label} · ~{occ.people} persoane
                  </span>
                </div>
                <Bar pct={occ.pct} color={occ.label === "Liber" ? "bg-ok" : occ.label === "Moderat" ? "bg-warn" : "bg-danger"} />
              </div>
            </Card>
          </Stagger>

          <section id="sec-preturi" className="mt-7 scroll-mt-2">
            <SectionTitle action={<Button size="sm" full={false} onClick={() => nav.push("plans")}>Cumpără</Button>}>Abonamente</SectionTitle>
            <Card className="py-1">
              {s.plans
                .filter((p) => p.active)
                .map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 py-3 ${i ? "border-t border-line" : ""}`}>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] font-semibold text-text truncate">
                        {p.name} {p.popular && <Badge tone="volt" className="ml-1 align-middle">Popular</Badge>}
                      </span>
                      <span className="block text-[13px] text-muted truncate">{p.perks.slice(0, 2).join(" · ")}</span>
                    </span>
                    <span className="text-[16px] font-bold text-text tabular shrink-0">{lei(p.price)}</span>
                  </div>
                ))}
            </Card>
          </section>

          <section id="sec-bar" className="mt-7 scroll-mt-2">
            <SectionTitle>Bar și accesorii</SectionTitle>
            {(["Băuturi", "Proteine", "Gustări", "Accesorii"] as const).map((cat) => {
              const list = s.products.filter((p) => p.category === cat);
              if (!list.length) return null;
              return (
                <div key={cat} className="mb-3">
                  <div className="text-[13px] font-semibold text-muted uppercase tracking-wider mb-1.5 px-1">{cat}</div>
                  <Card className="py-1">
                    {list.map((p, i) => (
                      <div key={p.id} className={`flex items-center gap-3 py-2.5 ${i ? "border-t border-line" : ""}`}>
                        <span className="flex-1 min-w-0 text-[15px] text-text truncate">{p.name}</span>
                        {p.stock === 0 ? <Badge tone="danger">Epuizat</Badge> : p.stock <= p.lowStock ? <Badge tone="warn">Stoc limitat</Badge> : null}
                        <span className="text-[15px] font-semibold text-text tabular shrink-0 w-16 text-right">{lei(p.price)}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              );
            })}
          </section>

          <section id="sec-dotari" className="mt-7 scroll-mt-2">
            <SectionTitle>Dotări</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {s.gym.facilities.map((f) => (
                <div key={f.key} className={`rounded-2xl border p-3 min-w-0 ${f.on ? "bg-surface border-line" : "bg-transparent border-line border-dashed"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full grid place-items-center shrink-0 ${f.on ? "bg-ok-soft text-ok" : "bg-surface-2 text-faint"}`}>{f.on ? <Check size={14} strokeWidth={3} /> : <X size={14} />}</span>
                    <span className={`text-[14px] font-semibold leading-tight ${f.on ? "text-text" : "text-faint"}`}>{f.label}</span>
                  </div>
                  {f.detail && f.on && <p className="text-[12px] text-muted mt-1.5 leading-snug">{f.detail}</p>}
                </div>
              ))}
            </div>
          </section>

          <section id="sec-galerie" className="mt-7 scroll-mt-2">
            <SectionTitle>Cum arată sala</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {s.gym.gallery.map((g) => (
                <GalleryTile key={g.id} g={g} onClick={() => setImg(g)} />
              ))}
            </div>
            {s.gym.gallery.some((g) => !g.img) && <p className="text-[12px] text-faint mt-2">Pozele reale le încarcă sala din panoul de administrare.</p>}
          </section>

          <section id="sec-aparate" className="mt-7 scroll-mt-2">
            <SectionTitle>Aparate ({s.machines.reduce((a, m) => a + m.count, 0)})</SectionTitle>
            <div className="flex flex-col gap-3">
              {MUSCLE_GROUPS.map((g) => {
                const list = s.machines.filter((m) => m.group === g);
                if (!list.length) return null;
                return (
                  <Card key={g} className="py-2">
                    <div className="text-[13px] font-semibold text-volt uppercase tracking-wider pt-1 pb-1.5">{g}</div>
                    {list.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 py-2 border-t border-line">
                        <Dumbbell size={16} className="text-faint shrink-0" />
                        <span className="flex-1 min-w-0 text-[14px] text-text truncate">{m.name}</span>
                        {m.status !== "funcțional" && (
                          <Badge tone="warn">
                            <Wrench size={12} /> Service
                          </Badge>
                        )}
                        <span className="text-[14px] text-muted tabular shrink-0">× {m.count}</span>
                      </div>
                    ))}
                  </Card>
                );
              })}
            </div>
          </section>

          <section id="sec-antrenori" className="mt-7 scroll-mt-2">
            <SectionTitle>Antrenori</SectionTitle>
            <div className="flex flex-col gap-2">
              {approved.map((t) => {
                const rv = s.reviews.filter((r) => r.target === t.id);
                const from = Math.min(...t.packages.map((p) => (p.sessions ? p.price / p.sessions : p.price)));
                return (
                  <Card key={t.id} onClick={() => nav.push("trainer", { id: t.id })}>
                    <div className="flex items-center gap-3">
                      <Avatar name={fullName(t)} photo={t.photo} size={56} id={t.id} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[16px] text-text truncate">{fullName(t)}</div>
                        <div className="text-[13px] text-muted truncate">{t.specialties.join(" · ")}</div>
                        <div className="flex items-center gap-2 mt-1 text-[13px]">
                          {rv.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-text">
                              <Star size={13} className="text-warn" fill="currentColor" /> {avgStars(rv).toFixed(1).replace(".", ",")}
                            </span>
                          )}
                          <span className="text-muted">de la {Math.round(from)} lei / ședință</span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-faint shrink-0" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          <section id="sec-recenzii" className="mt-7 scroll-mt-2">
            <SectionTitle action={<Button size="sm" full={false} variant="secondary" onClick={() => setWrite(true)}>Scrie o recenzie</Button>}>Recenzii</SectionTitle>
            <Card>
              <div className="flex items-center gap-4">
                <div className="text-center shrink-0">
                  <div className="font-display font-extrabold text-[40px] leading-none text-text tabular">{avg.toFixed(1).replace(".", ",")}</div>
                  <Stars value={Math.round(avg)} size={14} />
                  <div className="text-[12px] text-muted mt-1">{gymReviews.length} recenzii</div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const c = gymReviews.filter((r) => r.stars === n).length;
                    return (
                      <div key={n} className="flex items-center gap-2 text-[12px]">
                        <span className="w-3 text-muted tabular">{n}</span>
                        <Bar pct={gymReviews.length ? c / gymReviews.length : 0} color="bg-warn" className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
            <div className="flex flex-col gap-2 mt-2">
              {gymReviews.slice(0, 5).map((r) => {
                const c = s.clients.find((x) => x.id === r.clientId);
                return (
                  <Card key={r.id}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={fullName(c)} photo={c?.photo} size={34} id={r.clientId} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-text truncate">{c ? `${c.firstName} ${c.lastName[0]}.` : "Membru"}</div>
                        <div className="text-[12px] text-muted">{fmtDate(dayOf(r.at))}</div>
                      </div>
                      <Stars value={r.stars} size={13} />
                    </div>
                    <p className="text-[14px] text-text mt-2 leading-snug">{r.text}</p>
                    {r.reply && (
                      <div className="mt-2 rounded-xl bg-surface-2 p-2.5 text-[13px] text-muted leading-snug">
                        <span className="text-text font-semibold">Răspunsul sălii: </span>
                        {r.reply}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>

          <Card className="mt-7" onClick={() => nav.push("feedback")}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-warn-soft text-warn grid place-items-center shrink-0">
                <MessageSquareWarning size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[16px] text-text">Reclamații și propuneri</div>
                <div className="text-[13px] text-muted">Ajunge direct la administrator</div>
              </div>
              <ChevronRight size={20} className="text-faint shrink-0" />
            </div>
          </Card>
        </Scroll>
      </div>

      <Sheet open={!!img} onClose={() => setImg(null)} title={img?.caption ?? ""}>
        {img && (img.img ? <img src={img.img} alt={img.caption} className="w-full rounded-2xl" /> : <p className="pb-4">Sala nu a încărcat încă poza pentru această zonă.</p>)}
      </Sheet>

      <Sheet open={write} onClose={() => setWrite(false)} title="Recenzia ta">
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex justify-center">
            <Stars value={stars} onChange={setStars} size={34} />
          </div>
          <TextArea label="Ce ți-a plăcut și ce se poate îmbunătăți?" value={text} onChange={setText} placeholder="Scrie câteva cuvinte" />
          <Button
            onClick={() => {
              if (text.trim().length < 3) return toast("Scrie câteva cuvinte", "info");
              s.addReview(me.id, stars, text.trim(), "sală");
              setWrite(false);
              setText("");
              toast("Mulțumim! Ai primit puncte pentru recenzie.");
            }}
          >
            Publică recenzia
          </Button>
        </div>
      </Sheet>
    </>
  );
}
