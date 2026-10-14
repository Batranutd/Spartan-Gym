import { useRef, useState } from "react";
import { Camera, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Select, Toggle } from "../../components/ui/kit";
import { Button, IconButton } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Sheet } from "../../components/ui/Sheet";
import { toast, confirmDialog } from "../../components/ui/Toast";
import { Panel, type AdminPageProps } from "./AdminApp";
import { GalleryTile } from "../client/GymInfo";
import { fileToDataUrl } from "../../lib/image";
import { uid } from "../../lib/id";
import { MUSCLE_GROUPS, type Machine, type MuscleGroup } from "../../data/types";

export function AdminGym(_: AdminPageProps) {
  const s = useStore();
  const g = s.gym;
  const [info, setInfo] = useState({ name: g.name, address: g.address, phone: g.phone, email: g.email, capacity: String(g.capacity) });
  const [hours, setHours] = useState(g.hours);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [exText, setExText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [slot, setSlot] = useState<string | null>(null);

  const upload = async (f?: File) => {
    if (!f || !slot) return;
    try {
      const img = await fileToDataUrl(f, 1100, 0.78);
      s.updateGym({ gallery: g.gallery.map((x) => (x.id === slot ? { ...x, img } : x)) });
      toast("Poza a fost publicată în aplicație");
    } catch {
      toast("Poza nu a putut fi încărcată", "error");
    }
    setSlot(null);
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
        <Panel title="Date de contact">
          <div className="flex flex-col gap-3">
            <Field label="Numele sălii" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
            <Field label="Adresă" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telefon" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
              <Field label="Capacitate (persoane)" inputMode="numeric" value={info.capacity} onChange={(e) => setInfo({ ...info, capacity: e.target.value.replace(/\D/g, "") })} />
            </div>
            <Field label="E-mail" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
            <Button
              size="md"
              onClick={() => {
                s.updateGym({ name: info.name.trim() || g.name, address: info.address.trim(), phone: info.phone.trim(), email: info.email.trim(), capacity: parseInt(info.capacity) || g.capacity });
                toast("Datele sălii au fost salvate");
              }}
            >
              Salvează
            </Button>
          </div>
        </Panel>

        <Panel title="Program">
          <div className="flex flex-col gap-3">
            {hours.map((h, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <Field label="Zile" value={h.label} onChange={(e) => setHours(hours.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />
                <Field label="Ore" value={h.value} onChange={(e) => setHours(hours.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))} />
              </div>
            ))}
            <Button size="md" onClick={() => (s.updateGym({ hours }), toast("Programul a fost salvat"))}>
              Salvează programul
            </Button>
          </div>
        </Panel>
      </div>

      <Panel title="Dotări afișate clienților">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {g.facilities.map((f) => (
            <div key={f.key} className="border-b border-line">
              <Toggle on={f.on} onChange={(v) => s.updateGym({ facilities: g.facilities.map((x) => (x.key === f.key ? { ...x, on: v } : x)) })} label={f.label} description={f.detail} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Poze reale cu sala"
        action={
          <Button size="sm" full={false} variant="secondary" icon={<Plus size={16} />} onClick={() => s.updateGym({ gallery: [...g.gallery, { id: uid("g"), img: null, caption: "Zonă nouă", zone: "Altele" }] })}>
            Zonă nouă
          </Button>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {g.gallery.map((x) => (
            <div key={x.id} className="flex flex-col gap-2 min-w-0">
              <GalleryTile
                g={x}
                onClick={() => {
                  setSlot(x.id);
                  fileRef.current?.click();
                }}
              />
              <input
                aria-label="Descrierea pozei"
                value={x.caption}
                onChange={(e) => s.updateGym({ gallery: g.gallery.map((y) => (y.id === x.id ? { ...y, caption: e.target.value } : y)) })}
                className="h-10 rounded-xl bg-surface-2 border border-line px-3 text-[14px] text-text outline-none focus:border-volt min-w-0"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Camera size={15} />}
                  onClick={() => {
                    setSlot(x.id);
                    fileRef.current?.click();
                  }}
                >
                  {x.img ? "Schimbă" : "Încarcă"}
                </Button>
                <IconButton label="Șterge zona" onClick={() => s.updateGym({ gallery: g.gallery.filter((y) => y.id !== x.id) })} className="text-faint">
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
        <input ref={fileRef} type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")} accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
      </Panel>

      <Panel
        title={`Aparate (${s.machines.reduce((a, m) => a + m.count, 0)})`}
        action={
          <Button
            size="sm"
            full={false}
            icon={<Plus size={16} />}
            onClick={() => {
              setMachine({ id: uid("m-"), name: "", group: "Piept", count: 1, status: "funcțional", exercises: [] });
              setExText("");
            }}
          >
            Aparat nou
          </Button>
        }
      >
        <div className="flex flex-col divide-y divide-line">
          {s.machines.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <div className="flex-1 min-w-[160px]">
                <div className="text-[15px] font-semibold text-text">{m.name}</div>
                <div className="text-[12px] text-muted truncate">
                  {m.group} · {m.exercises.join(", ")}
                </div>
              </div>
              <span className="text-[14px] text-muted tabular">× {m.count}</span>
              <button
                type="button"
                onClick={() => s.upsertMachine({ ...m, status: m.status === "funcțional" ? "în mentenanță" : "funcțional" })}
                className={`h-9 px-3 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 ${m.status === "funcțional" ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}
              >
                {m.status === "funcțional" ? "Funcțional" : (
                  <>
                    <Wrench size={13} /> În mentenanță
                  </>
                )}
              </button>
              <IconButton
                label={`Editează ${m.name}`}
                onClick={() => {
                  setMachine(m);
                  setExText(m.exercises.join(", "));
                }}
              >
                <Pencil size={16} />
              </IconButton>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-muted mt-2">Atinge starea ca s-o schimbi. Aparatele în mentenanță apar marcate la clienți și nu pot fi alese la antrenament.</p>
      </Panel>

      <Sheet open={!!machine} onClose={() => setMachine(null)} title={machine?.name || "Aparat nou"}>
        {machine && (
          <div className="flex flex-col gap-4 pb-2">
            <Field label="Denumire" value={machine.name} onChange={(e) => setMachine({ ...machine, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Grupa" value={machine.group} onChange={(v) => setMachine({ ...machine, group: v as MuscleGroup })} options={MUSCLE_GROUPS.map((x) => ({ value: x, label: x }))} />
              <Field label="Bucăți" inputMode="numeric" value={String(machine.count)} onChange={(e) => setMachine({ ...machine, count: parseInt(e.target.value) || 1 })} />
            </div>
            <Field label="Exerciții (separate prin virgulă)" value={exText} onChange={(e) => setExText(e.target.value)} placeholder="Împins cu bara, Împins cu gantere" />
            <div className="flex gap-2">
              {s.machines.some((x) => x.id === machine.id) && (
                <Button
                  variant="danger"
                  full={false}
                 
                  aria-label="Șterge aparatul"
                  icon={<Trash2 size={19} />}
                  onClick={async () => {
                    if (await confirmDialog({ title: "Ștergi aparatul?", text: machine.name, ok: "Șterge", danger: true })) {
                      s.deleteMachine(machine.id);
                      setMachine(null);
                    }
                  }}
                />
              )}
              <Button
                onClick={() => {
                  const exercises = exText.split(",").map((x) => x.trim()).filter(Boolean);
                  if (!machine.name.trim() || !exercises.length) return toast("Completează denumirea și cel puțin un exercițiu", "info");
                  s.upsertMachine({ ...machine, name: machine.name.trim(), exercises });
                  setMachine(null);
                  toast("Aparat salvat");
                }}
              >
                Salvează
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
