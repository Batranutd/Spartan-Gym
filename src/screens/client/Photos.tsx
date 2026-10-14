import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, Globe, Lock, Search, Trash2, Users } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Avatar, Badge, CheckMark, Empty, Scroll, Segmented, SectionTitle, Stagger, TopBar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Sheet } from "../../components/ui/Sheet";
import { Field } from "../../components/ui/Field";
import { toast, confirmDialog } from "../../components/ui/Toast";
import { fileToDataUrl } from "../../lib/image";
import { fmtDate } from "../../lib/date";
import { fullName } from "../../lib/derive";
import type { ProgressPhoto, Visibility } from "../../data/types";

const visIcon = { privat: <Lock size={13} />, public: <Globe size={13} />, selectat: <Users size={13} /> };
const visLabel = { privat: "Privată", public: "Publică", selectat: "Doar pentru unii" };

export function Photos() {
  const me = useMe();
  const nav = useClientNav();
  const s = useStore();
  const photos = s.photos.filter((p) => p.clientId === me.id).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [open, setOpen] = useState<ProgressPhoto | null>(null);
  const [split, setSplit] = useState(50);

  const onFile = async (f?: File) => {
    if (!f) return;
    try {
      setDraft(await fileToDataUrl(f, 900, 0.78));
      setCaption("");
    } catch {
      toast("Poza nu a putut fi încărcată", "error");
    }
  };

  const first = photos[0];
  const last = photos[photos.length - 1];

  return (
    <>
      <TopBar title="Poze de evoluție" onBack={nav.pop} />
      <Scroll>
        <p className="text-[14px] text-muted leading-snug mb-4">Pozele sunt private până alegi tu altfel. Le poți face publice sau le poți arăta doar anumitor persoane.</p>

        {photos.length >= 2 && (
          <Stagger>
            <SectionTitle>Înainte și acum</SectionTitle>
            <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-surface-2 select-none">
              <img src={last.img} alt="Poza cea mai nouă" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                <img src={first.img} alt="Prima poză" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="absolute top-0 bottom-0 w-[3px] bg-volt" style={{ left: `calc(${split}% - 1.5px)` }} aria-hidden />
              <span className="absolute top-3 left-3 h-7 px-2.5 rounded-full bg-ink/80 text-text text-[12px] font-semibold grid place-items-center">{fmtDate(first.date)}</span>
              <span className="absolute top-3 right-3 h-7 px-2.5 rounded-full bg-ink/80 text-text text-[12px] font-semibold grid place-items-center">{fmtDate(last.date)}</span>
              <input type="range" min={0} max={100} value={split} onChange={(e) => setSplit(+e.target.value)} aria-label="Compară pozele" className="absolute inset-x-0 bottom-3 mx-auto w-[85%] accent-[#D4FF3A]" />
            </div>
          </Stagger>
        )}

        <SectionTitle className="mt-6" action={<Button size="sm" full={false} icon={<Camera size={16} />} onClick={() => fileRef.current?.click()}>Adaugă</Button>}>
          Toate pozele
        </SectionTitle>
        <input ref={fileRef} type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")} accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        {photos.length ? (
          <div className="grid grid-cols-3 gap-2">
            {[...photos].reverse().map((p, i) => (
              <motion.button key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} onClick={() => setOpen(p)} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2">
                <img src={p.img} alt={p.caption || `Poză din ${fmtDate(p.date)}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1.5 left-1.5 h-6 px-2 rounded-full bg-ink/85 text-text text-[11px] font-semibold inline-flex items-center gap-1">
                  {visIcon[p.visibility]} {fmtDate(p.date)}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <Empty icon={<Camera size={22} />} title="Fă prima poză" text="Aceeași lumină, aceeași poziție, o dată la două săptămâni. Așa se vede cel mai bine progresul." action={<Button size="sm" full={false} onClick={() => fileRef.current?.click()}>Adaugă o poză</Button>} />
        )}
      </Scroll>

      <Sheet open={!!draft} onClose={() => setDraft(null)} title="Poză nouă">
        {draft && (
          <div className="flex flex-col gap-4 pb-2">
            <img src={draft} alt="" className="w-full max-h-[46vh] object-contain rounded-2xl bg-surface-2" />
            <Field label="Notiță (opțional)" placeholder="De exemplu: săptămâna 6" value={caption} onChange={(e) => setCaption(e.target.value)} />
            <p className="text-[13px] text-muted inline-flex items-center gap-1.5">
              <Lock size={14} /> Se salvează privată. Poți schimba după.
            </p>
            <Button
              onClick={() => {
                s.addPhoto(me.id, draft, caption.trim());
                setDraft(null);
                toast("Poza a fost salvată");
              }}
            >
              Salvează
            </Button>
          </div>
        )}
      </Sheet>

      <PhotoSheet photo={open} onClose={() => setOpen(null)} />
    </>
  );
}

function PhotoSheet({ photo, onClose }: { photo: ProgressPhoto | null; onClose: () => void }) {
  const s = useStore();
  const me = useMe();
  const [vis, setVis] = useState<Visibility>("privat");
  const [allowed, setAllowed] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [lastId, setLastId] = useState<string | null>(null);
  if (photo && photo.id !== lastId) {
    setLastId(photo.id);
    setVis(photo.visibility);
    setAllowed(photo.allowed);
  }
  const people = useMemo(
    () => [
      ...s.trainers.filter((t) => t.status === "aprobat").map((t) => ({ id: t.id, name: fullName(t), sub: "Antrenor", photo: t.photo })),
      ...s.clients.filter((c) => c.id !== me.id).map((c) => ({ id: c.id, name: fullName(c), sub: "Membru", photo: c.photo })),
    ],
    [s.trainers, s.clients, me.id],
  );
  const list = people.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || allowed.includes(p.id)).slice(0, 30);

  return (
    <Sheet
      open={!!photo}
      onClose={onClose}
      title={photo ? `Poza din ${fmtDate(photo.date, { day: "numeric", month: "long" })}` : ""}
      footer={
        <div className="flex gap-2">
          <Button
            variant="danger"
            full={false}
           
            aria-label="Șterge poza"
            icon={<Trash2 size={20} />}
            onClick={async () => {
              if (photo && (await confirmDialog({ title: "Ștergi poza?", text: "Nu o mai poți recupera.", ok: "Șterge", danger: true }))) {
                s.deletePhoto(photo.id);
                onClose();
              }
            }}
          />
          <Button
            onClick={() => {
              if (photo) s.updatePhoto(photo.id, vis, vis === "selectat" ? allowed : []);
              toast(vis === "privat" ? "Poza e privată" : vis === "public" ? "Poza e publică pentru membrii sălii" : `Poza e vizibilă pentru ${allowed.length} persoane`);
              onClose();
            }}
          >
            Salvează
          </Button>
        </div>
      }
    >
      {photo && (
        <div className="flex flex-col gap-4">
          <img src={photo.img} alt="" className="w-full max-h-[40vh] object-contain rounded-2xl bg-surface-2" />
          {photo.caption && <p className="text-[15px] text-text">{photo.caption}</p>}
          <div>
            <div className="text-[14px] text-muted mb-2 font-medium">Cine o poate vedea</div>
            <Segmented
              value={vis}
              onChange={setVis}
              options={[
                { value: "privat", label: "Doar eu" },
                { value: "selectat", label: "Aleg eu" },
                { value: "public", label: "Toți" },
              ]}
            />
            <p className="text-[13px] text-muted mt-2">{vis === "public" ? "O văd toți membrii și antrenorii sălii." : vis === "privat" ? "N-o vede nimeni în afară de tine." : `${allowed.length} persoane alese.`}</p>
          </div>
          {vis === "selectat" && (
            <div>
              <Field label="Caută o persoană" prefix={<Search size={18} />} placeholder="Nume" value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="mt-2 flex flex-col">
                {list.map((p) => {
                  const on = allowed.includes(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => setAllowed(on ? allowed.filter((x) => x !== p.id) : [...allowed, p.id])} className="flex items-center gap-3 py-2.5 text-left">
                      <Avatar name={p.name} photo={p.photo} size={38} id={p.id} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[15px] text-text font-medium truncate">{p.name}</span>
                        <span className="block text-[12px] text-muted">{p.sub}</span>
                      </span>
                      {p.sub === "Antrenor" && <Badge tone="violet">Antrenor</Badge>}
                      <CheckMark on={on} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="text-[13px] text-muted inline-flex items-center gap-1.5">
            Acum: {visIcon[photo.visibility]} {visLabel[photo.visibility]}
          </div>
        </div>
      )}
    </Sheet>
  );
}
