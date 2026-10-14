import { useState } from "react";
import { Check, Plus, Trophy, X } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Avatar, Badge, TextArea, Toggle } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Sheet } from "../../components/ui/Sheet";
import { toast } from "../../components/ui/Toast";
import { Panel, type AdminPageProps } from "./AdminApp";
import { addDays, fmtDate, today } from "../../lib/date";
import { fullName } from "../../lib/derive";
import { uid } from "../../lib/id";
import type { Challenge } from "../../data/types";

export function AdminChallenges(_: AdminPageProps) {
  const s = useStore();
  const [edit, setEdit] = useState<Challenge | null>(null);
  const pending = s.challenges.flatMap((c) => c.entries.filter((e) => e.status === "trimis").map((e) => ({ c, e })));
  const by = (id?: string) => (id === "admin" ? "recepție" : s.trainers.find((t) => t.id === id)?.firstName ?? "");

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <Panel title={`De validat (${pending.length})`}>
        {pending.length ? (
          <div className="flex flex-col divide-y divide-line">
            {pending.map(({ c, e }) => {
              const cl = s.clients.find((x) => x.id === e.clientId);
              return (
                <div key={c.id + e.clientId} className="flex flex-wrap items-center gap-3 py-3">
                  <Avatar name={fullName(cl)} photo={cl?.photo} size={36} id={e.clientId} />
                  <div className="flex-1 min-w-[160px]">
                    <div className="text-[15px] font-semibold text-text">{fullName(cl)}</div>
                    <div className="text-[13px] text-muted">
                      {c.title}: <b className="text-text tabular">{e.value}</b> {c.unit}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" full={false} variant="secondary" icon={<X size={15} />} onClick={() => (s.validateEntry(c.id, e.clientId, false, "admin"), toast("Respins"))}>
                      Respinge
                    </Button>
                    <Button size="sm" full={false} icon={<Check size={15} />} onClick={() => (s.validateEntry(c.id, e.clientId, true, "admin"), toast(`Validat, +${c.points} puncte`))}>
                      Validează
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[14px] text-muted">Nimic de validat. Rezultatele trimise de clienți apar aici și la antrenori.</p>
        )}
      </Panel>

      <Panel
        title="Provocări"
        action={
          <Button size="sm" full={false} icon={<Plus size={16} />} onClick={() => setEdit({ id: uid("ch-"), title: "", description: "", unit: "repetări", higherIsBetter: true, start: today(), end: addDays(today(), 14), points: 100, entries: [] })}>
            Provocare nouă
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {s.challenges.map((c) => {
            const done = c.end < today();
            const ranked = c.entries.filter((e) => e.status === "validat").sort((a, b) => (c.higherIsBetter ? b.value - a.value : a.value - b.value));
            return (
              <div key={c.id} className="rounded-2xl bg-surface-2 border border-line p-4">
                <div className="flex items-start gap-3">
                  <Trophy size={20} className="text-violet-ink shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[16px] text-text">{c.title}</div>
                    <div className="text-[13px] text-muted">
                      {fmtDate(c.start)} – {fmtDate(c.end)} · {c.points} puncte
                    </div>
                  </div>
                  <Badge tone={done ? "neutral" : "ok"}>{done ? "Încheiată" : "Activă"}</Badge>
                </div>
                <div className="mt-3 text-[13px] text-muted">{c.entries.length} înscriși · {ranked.length} validați</div>
                {ranked.slice(0, 3).map((e, i) => (
                  <div key={e.clientId} className="flex items-center gap-2 mt-1.5 text-[14px]">
                    <span className="w-5 text-muted tabular">{i + 1}.</span>
                    <span className="flex-1 min-w-0 text-text truncate">{fullName(s.clients.find((x) => x.id === e.clientId))}</span>
                    <span className="text-text font-semibold tabular">
                      {e.value} {c.unit}
                    </span>
                    <span className="text-[12px] text-faint hidden sm:inline">({by(e.validatedBy)})</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Panel>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title="Provocare nouă">
        {edit && (
          <div className="flex flex-col gap-4 pb-2">
            <Field label="Titlu" placeholder="De exemplu: flotări maxime" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            <TextArea label="Regulament" value={edit.description} onChange={(v) => setEdit({ ...edit, description: v })} rows={3} placeholder="Cum se face proba și cine o validează" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Unitate" value={edit.unit} onChange={(e) => setEdit({ ...edit, unit: e.target.value })} />
              <Field label="Puncte" inputMode="numeric" value={String(edit.points)} onChange={(e) => setEdit({ ...edit, points: parseInt(e.target.value) || 0 })} />
              <Field label="Începe" type="date" value={edit.start} onChange={(e) => setEdit({ ...edit, start: e.target.value })} />
              <Field label="Se termină" type="date" value={edit.end} onChange={(e) => setEdit({ ...edit, end: e.target.value })} />
            </div>
            <div className="rounded-2xl bg-surface-2 px-3">
              <Toggle on={edit.higherIsBetter} onChange={(v) => setEdit({ ...edit, higherIsBetter: v })} label="Câștigă valoarea cea mai mare" description="Dezactivează pentru timp, unde câștigă cel mai rapid" />
            </div>
            <Button
              onClick={() => {
                if (edit.title.trim().length < 3) return toast("Scrie un titlu", "info");
                s.upsertChallenge({ ...edit, title: edit.title.trim() });
                setEdit(null);
                toast("Provocare publicată. Clienții au primit notificare.");
              }}
            >
              Publică provocarea
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
