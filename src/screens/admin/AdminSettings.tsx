import { useState } from "react";
import { Check, RotateCcw, User, Users } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { toast, confirmDialog } from "../../components/ui/Toast";
import { Panel, type AdminPageProps } from "./AdminApp";

// Accente verificate: toate au contrast de peste 9:1 cu textul închis de pe butoane
const ACCENTS = [
  { c: "#D4FF3A", n: "Volt" },
  { c: "#FF8A3D", n: "Portocaliu" },
  { c: "#4FD8FF", n: "Cyan" },
  { c: "#FF6FAE", n: "Roz" },
  { c: "#7CF29A", n: "Verde" },
  { c: "#FFD23F", n: "Galben" },
];

export function AdminSettings(_: AdminPageProps) {
  const s = useStore();
  const [pin, setPin] = useState("");
  const me = s.clients.find((c) => !c.isDemoSeed);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
      <Panel title="Culoarea sălii">
        <p className="text-[14px] text-muted mb-3 leading-snug">Aplicația e white-label: fiecare sală își alege culoarea de accent. Se schimbă imediat în aplicația clienților și în panou.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {ACCENTS.map((a) => {
            const on = (s.gym.accent ?? "#D4FF3A").toLowerCase() === a.c.toLowerCase();
            return (
              <button key={a.c} type="button" onClick={() => s.updateGym({ accent: a.c })} className={`rounded-2xl p-2 border flex flex-col items-center gap-1.5 ${on ? "border-text" : "border-line"}`} aria-pressed={on}>
                <span className="w-10 h-10 rounded-full grid place-items-center" style={{ background: a.c }}>
                  {on && <Check size={18} color="#0E0F12" strokeWidth={3} />}
                </span>
                <span className="text-[12px] text-text">{a.n}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Cod PIN administrator">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-end">
          <Field label="PIN nou (4 cifre)" inputMode="numeric" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          <Button
            full={false}
            onClick={() => {
              if (pin.length !== 4) return toast("PIN-ul are 4 cifre", "info");
              s.updateGym({ adminPin: pin });
              setPin("");
              toast("PIN schimbat");
            }}
          >
            Salvează
          </Button>
        </div>
        <p className="text-[13px] text-muted mt-2">În versiunea finală, fiecare membru al personalului are cont propriu, iar recepționerul vede doar check-in-ul și casa.</p>
      </Panel>

      <Panel title="Mod demo">
        <p className="text-[14px] text-muted mb-3 leading-snug">Treci rapid între roluri ca să vezi același flux din ambele părți. Datele sunt comune.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="secondary" icon={<User size={18} />} onClick={() => (me ? s.enterAs("client", me.id) : s.logout())}>
            Vezi ca client
          </Button>
          <Button variant="secondary" icon={<Users size={18} />} onClick={() => s.enterAs("trainer", "t-mihai")}>
            Vezi ca antrenor
          </Button>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (await confirmDialog({ title: "Resetezi demo-ul?", text: "Se șterg toate datele, inclusiv conturile create, și se generează din nou datele exemplu.", ok: "Resetează", danger: true })) s.resetAll();
          }}
          className="mt-3 h-10 inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted"
        >
          <RotateCcw size={16} /> Resetează demo-ul
        </button>
      </Panel>

      <Panel title="Despre date">
        <ul className="flex flex-col gap-2 text-[14px] text-text leading-snug list-disc pl-5">
          <li>În demo, datele stau doar în acest browser. Versiunea finală le ține pe server, cu copii de siguranță zilnice.</li>
          <li>Administratorul nu vede greutatea, nutriția sau pozele clienților. Le văd doar antrenorii cărora clientul le dă acces.</li>
          <li>Plățile cu cardul trec printr-un procesator autorizat. Aplicația nu păstrează datele cardului.</li>
        </ul>
      </Panel>
    </div>
  );
}
