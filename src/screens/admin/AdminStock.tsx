import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Badge, Select } from "../../components/ui/kit";
import { Button, IconButton } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Sheet } from "../../components/ui/Sheet";
import { toast, confirmDialog } from "../../components/ui/Toast";
import { Panel, Stat, type AdminPageProps } from "./AdminApp";
import { lei, uid } from "../../lib/id";
import type { Product, ProductCategory } from "../../data/types";

const CATS: ProductCategory[] = ["Băuturi", "Proteine", "Gustări", "Accesorii"];

export function AdminStock(_: AdminPageProps) {
  const s = useStore();
  const [edit, setEdit] = useState<Product | null>(null);
  const low = s.products.filter((p) => p.stock <= p.lowStock);
  const value = s.products.reduce((a, p) => a + p.stock * p.price, 0);

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Produse" value={s.products.length} />
        <Stat label="Stoc mic" value={low.length} tone={low.length ? "warn" : "default"} />
        <Stat label="Bucăți în stoc" value={s.products.reduce((a, p) => a + p.stock, 0)} />
        <Stat label="Valoare la preț de vânzare" value={lei(value)} />
      </div>

      <Panel title="Produse" action={<Button size="sm" full={false} icon={<Plus size={16} />} onClick={() => setEdit({ id: uid("pr-"), name: "", category: "Băuturi", price: 0, stock: 0, lowStock: 5 })}>Produs nou</Button>}>
        <div className="flex flex-col divide-y divide-line">
          {s.products.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
              <div className="flex-1 min-w-[160px]">
                <div className="text-[15px] font-semibold text-text truncate">{p.name}</div>
                <div className="text-[12px] text-muted">
                  {p.category} · {lei(p.price)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {p.stock === 0 ? <Badge tone="danger">Epuizat</Badge> : p.stock <= p.lowStock ? <Badge tone="warn">Stoc mic</Badge> : null}
                <span className="w-16 text-right text-[15px] font-semibold text-text tabular">{p.stock} buc</span>
                <Button size="sm" full={false} variant="secondary" onClick={() => (s.restock(p.id, 12), toast(`+12 buc ${p.name}`))}>
                  +12
                </Button>
                <IconButton label={`Editează ${p.name}`} onClick={() => setEdit(p)}>
                  <Pencil size={17} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit && s.products.some((p) => p.id === edit.id) ? "Editează produsul" : "Produs nou"}>
        {edit && (
          <div className="flex flex-col gap-4 pb-2">
            <Field label="Denumire" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <Select label="Categorie" value={edit.category} onChange={(v) => setEdit({ ...edit, category: v })} options={CATS.map((c) => ({ value: c, label: c }))} />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Preț (lei)" inputMode="decimal" value={edit.price ? String(edit.price) : ""} placeholder="0" onChange={(e) => setEdit({ ...edit, price: parseFloat(e.target.value.replace(",", ".")) || 0 })} />
              <Field label="Stoc" inputMode="numeric" value={String(edit.stock)} onChange={(e) => setEdit({ ...edit, stock: parseInt(e.target.value) || 0 })} />
              <Field label="Alertă sub" inputMode="numeric" value={String(edit.lowStock)} onChange={(e) => setEdit({ ...edit, lowStock: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex gap-2">
              {s.products.some((p) => p.id === edit.id) && (
                <Button
                  variant="danger"
                  full={false}
                 
                  aria-label="Șterge produsul"
                  icon={<Trash2 size={19} />}
                  onClick={async () => {
                    if (await confirmDialog({ title: "Ștergi produsul?", text: edit.name, ok: "Șterge", danger: true })) {
                      s.deleteProduct(edit.id);
                      setEdit(null);
                    }
                  }}
                />
              )}
              <Button
                onClick={() => {
                  if (!edit.name.trim() || !edit.price) return toast("Completează denumirea și prețul", "info");
                  s.upsertProduct({ ...edit, name: edit.name.trim() });
                  setEdit(null);
                  toast("Produs salvat");
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
