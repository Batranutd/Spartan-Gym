import { useState } from "react";
import { Check, Pencil, Plus } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Badge, TextArea, Toggle } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Sheet } from "../../components/ui/Sheet";
import { toast } from "../../components/ui/Toast";
import { Panel, type AdminPageProps } from "./AdminApp";
import { lei, uid } from "../../lib/id";
import type { Plan } from "../../data/types";

export function AdminPlans(_: AdminPageProps) {
  const s = useStore();
  const [edit, setEdit] = useState<Plan | null>(null);
  const [perks, setPerks] = useState("");
  const sold = (id: string) => s.subscriptions.filter((x) => x.planId === id && x.status === "activ").length;

  const open = (p: Plan) => {
    setEdit(p);
    setPerks(p.perks.join("\n"));
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <Panel title="Abonamente" action={<Button size="sm" full={false} icon={<Plus size={16} />} onClick={() => open({ id: uid("p-"), name: "", durationDays: 30, price: 0, perks: [], active: true })}>Abonament nou</Button>}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {s.plans.map((p) => (
            <div key={p.id} className={`rounded-2xl border p-4 ${p.active ? "bg-surface-2 border-line" : "bg-transparent border-dashed border-line"}`}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[18px] text-text">{p.name}</div>
                  <div className="text-[13px] text-muted">{p.durationDays === 1 ? "o zi" : `${p.durationDays} de zile`}</div>
                </div>
                <div className="font-display font-extrabold text-[22px] text-text tabular">{lei(p.price)}</div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {p.popular && <Badge tone="volt">Recomandat</Badge>}
                {!p.active && <Badge tone="danger">Ascuns</Badge>}
                <Badge>{sold(p.id)} vândute</Badge>
              </div>
              <ul className="mt-3 flex flex-col gap-1">
                {p.perks.map((k) => (
                  <li key={k} className="flex items-center gap-2 text-[13px] text-text">
                    <Check size={14} className="text-volt shrink-0" />
                    {k}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <Button size="sm" variant="secondary" icon={<Pencil size={15} />} onClick={() => open(p)}>
                  Editează
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-muted mt-3">Modificările de preț se aplică doar abonamentelor noi. Cele deja plătite rămân la prețul de atunci.</p>
      </Panel>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.name || "Abonament nou"}>
        {edit && (
          <div className="flex flex-col gap-4 pb-2">
            <Field label="Denumire" placeholder="De exemplu: 1 lună" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valabilitate (zile)" inputMode="numeric" value={String(edit.durationDays)} onChange={(e) => setEdit({ ...edit, durationDays: parseInt(e.target.value) || 1 })} />
              <Field label="Preț (lei)" inputMode="numeric" value={edit.price ? String(edit.price) : ""} placeholder="0" onChange={(e) => setEdit({ ...edit, price: parseInt(e.target.value) || 0 })} />
            </div>
            <TextArea label="Ce include (câte un rând)" value={perks} onChange={setPerks} rows={4} />
            <div className="rounded-2xl bg-surface-2 px-3">
              <Toggle on={!!edit.popular} onChange={(v) => setEdit({ ...edit, popular: v })} label="Recomandat" description="Apare evidențiat în aplicație" />
              <Toggle on={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="Vizibil în aplicație" />
            </div>
            <Button
              onClick={() => {
                if (!edit.name.trim() || !edit.price) return toast("Completează denumirea și prețul", "info");
                s.upsertPlan({ ...edit, name: edit.name.trim(), perks: perks.split("\n").map((x) => x.trim()).filter(Boolean) });
                setEdit(null);
                toast("Abonament salvat");
              }}
            >
              Salvează
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
