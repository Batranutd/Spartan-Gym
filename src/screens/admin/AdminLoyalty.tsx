import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useStore, pointsOf } from "../../store/useStore";
import { Avatar, Badge, Select, Toggle } from "../../components/ui/kit";
import { Button, IconButton } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { NumberBox } from "../../components/ui/NumberBox";
import { Sheet } from "../../components/ui/Sheet";
import { toast } from "../../components/ui/Toast";
import { Panel, Stat, type AdminPageProps } from "./AdminApp";
import { dayOf, fmtDate } from "../../lib/date";
import { fullName } from "../../lib/derive";
import { uid } from "../../lib/id";
import type { PointRules, Reward } from "../../data/types";

const ICONS: { value: Reward["icon"]; label: string }[] = [
  { value: "drop", label: "Băutură" },
  { value: "bar", label: "Gustare" },
  { value: "shaker", label: "Shake" },
  { value: "shirt", label: "Produs" },
  { value: "percent", label: "Reducere" },
  { value: "calendar", label: "Zile gratuite" },
  { value: "trainer", label: "Antrenor" },
];

export function AdminLoyalty(_: AdminPageProps) {
  const s = useStore();
  const [edit, setEdit] = useState<Reward | null>(null);
  const r = s.pointRules;
  const given = s.points.filter((p) => p.delta > 0).reduce((a, p) => a + p.delta, 0);
  const spent = Math.abs(s.points.filter((p) => p.delta < 0).reduce((a, p) => a + p.delta, 0));
  const top = useMemo(() => s.clients.map((c) => ({ c, p: pointsOf(s, c.id) })).sort((a, b) => b.p - a.p).slice(0, 8), [s]);

  const rule = (k: keyof PointRules, label: string, unit = "puncte") => (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex-1 min-w-0 text-[14px] text-text leading-snug">{label}</span>
      <div className="w-36 shrink-0">
        <NumberBox label={label} unit={unit === "puncte" ? "p" : unit} value={r[k]} step={k === "expireMonths" ? 1 : 5} min={0} max={2000} onChange={(v) => s.setPointRules({ [k]: v })} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Puncte acordate" value={given.toLocaleString("ro-RO")} />
        <Stat label="Puncte folosite" value={spent.toLocaleString("ro-RO")} tone="violet" />
        <Stat label="Coduri active" value={s.redemptions.filter((x) => x.status === "activ").length} />
        <Stat label="Valoare aproximativă" value={`${Math.round(given * 0.05).toLocaleString("ro-RO")} lei`} sub="la 1 punct ≈ 0,05 lei" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
        <Panel title="Reguli de punctaj">
          <div className="flex flex-col divide-y divide-line">
            {rule("checkIn", "Check-in la sală (maxim o dată pe zi)")}
            {rule("weekStreak", "Bonus: 3 vizite în aceeași săptămână")}
            {rule("review", "Recenzie (o dată pe lună)")}
            {rule("referral", "Prieten adus care cumpără abonament")}
            {rule("profileComplete", "Profil completat")}
            {rule("expireMonths", "Punctele expiră după", "luni")}
          </div>
          <p className="text-[13px] text-muted mt-2">Se aplică imediat pentru acțiunile noi. Punctele pentru provocări se setează la fiecare provocare.</p>
        </Panel>

        <Panel title="Recompense" action={<Button size="sm" full={false} icon={<Plus size={16} />} onClick={() => setEdit({ id: uid("r-"), name: "", description: "", cost: 100, icon: "drop", active: true })}>Adaugă</Button>}>
          <div className="flex flex-col divide-y divide-line">
            {s.rewards.map((x) => (
              <div key={x.id} className="flex items-center gap-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-text truncate">{x.name}</div>
                  <div className="text-[12px] text-muted truncate">{x.description}</div>
                </div>
                {!x.active && <Badge tone="danger">Ascunsă</Badge>}
                <span className="text-[14px] font-bold text-violet-ink tabular shrink-0">{x.cost} p</span>
                <IconButton label={`Editează ${x.name}`} onClick={() => setEdit(x)}>
                  <Pencil size={16} />
                </IconButton>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
        <Panel title="Coduri folosite de clienți">
          {s.redemptions.length ? (
            <div className="flex flex-col divide-y divide-line">
              {s.redemptions.slice(0, 12).map((x) => {
                const c = s.clients.find((y) => y.id === x.clientId);
                const rw = s.rewards.find((y) => y.id === x.rewardId);
                return (
                  <div key={x.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <span className="font-mono text-[14px] text-text tracking-wider">{x.code}</span>
                    <span className="flex-1 min-w-[140px] text-[14px] text-text truncate">
                      {rw?.name} · {fullName(c)}
                    </span>
                    <span className="text-[12px] text-muted">{fmtDate(dayOf(x.at))}</span>
                    {x.status === "activ" ? (
                      <Button size="sm" full={false} variant="secondary" onClick={() => (s.useRedemption(x.id), toast("Cod marcat ca folosit"))}>
                        Marchează folosit
                      </Button>
                    ) : (
                      <Badge>Folosit</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[14px] text-muted">Încă niciun cod. Clienții își aleg recompensele din aplicație.</p>
          )}
        </Panel>

        <Panel title="Cei mai mulți puncte">
          <div className="flex flex-col divide-y divide-line">
            {top.map(({ c, p }, i) => (
              <div key={c.id} className="flex items-center gap-3 py-2.5">
                <span className="w-5 text-[14px] text-muted tabular">{i + 1}</span>
                <Avatar name={fullName(c)} photo={c.photo} size={32} id={c.id} />
                <span className="flex-1 min-w-0 text-[14px] text-text truncate">{fullName(c)}</span>
                <span className="text-[14px] font-semibold text-text tabular">{p}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.name || "Recompensă nouă"}>
        {edit && (
          <div className="flex flex-col gap-4 pb-2">
            <Field label="Denumire" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <Field label="Descriere scurtă" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cost (puncte)" inputMode="numeric" value={String(edit.cost)} onChange={(e) => setEdit({ ...edit, cost: parseInt(e.target.value) || 0 })} />
              <Select label="Tip" value={edit.icon} onChange={(v) => setEdit({ ...edit, icon: v })} options={ICONS} />
            </div>
            <div className="rounded-2xl bg-surface-2 px-3">
              <Toggle on={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="Vizibilă în aplicație" />
            </div>
            <Button
              onClick={() => {
                if (!edit.name.trim() || !edit.cost) return toast("Completează denumirea și costul", "info");
                s.upsertReward({ ...edit, name: edit.name.trim() });
                setEdit(null);
                toast("Recompensă salvată");
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
