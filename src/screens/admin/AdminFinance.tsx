import { useMemo, useState } from "react";
import { Copy, Info } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Badge, Bar, Columns } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { toast } from "../../components/ui/Toast";
import { Panel, Stat, type AdminPageProps } from "./AdminApp";
import { addDays, dayOf, diffDays, fmtDate, fmtTime, iso, today } from "../../lib/date";
import { lei } from "../../lib/id";
import { fullName } from "../../lib/derive";

type Period = "azi" | "7" | "luna" | "lunaTrecuta";

function range(p: Period): [string, string] {
  const T = today();
  const n = new Date();
  if (p === "azi") return [T, T];
  if (p === "7") return [addDays(T, -6), T];
  if (p === "luna") return [iso(new Date(n.getFullYear(), n.getMonth(), 1)), T];
  return [iso(new Date(n.getFullYear(), n.getMonth() - 1, 1)), iso(new Date(n.getFullYear(), n.getMonth(), 0))];
}

export function AdminFinance(_: AdminPageProps) {
  const s = useStore();
  const [p, setP] = useState<Period>("luna");
  const [from, to] = range(p);
  const sales = useMemo(() => s.sales.filter((x) => dayOf(x.at) >= from && dayOf(x.at) <= to).sort((a, b) => b.at.localeCompare(a.at)), [s.sales, from, to]);
  const total = sales.reduce((a, x) => a + x.total, 0);
  const plans = sales.reduce((a, x) => a + x.items.filter((i) => i.kind === "plan").reduce((b, i) => b + i.qty * i.unitPrice, 0), 0);
  const products = total - plans;
  const by = (m: string) => sales.filter((x) => x.method === m).reduce((a, x) => a + x.total, 0);
  const cash = by("cash");
  const card = by("card-pos");
  const app = by("card-app");
  const nDays = diffDays(to, from) + 1;
  const daily = Array.from({ length: Math.min(nDays, 31) }, (_, i) => addDays(from, i)).map((d) => ({ label: String(parseInt(d.slice(8))), value: s.sales.filter((x) => dayOf(x.at) === d).reduce((a, x) => a + x.total, 0) }));
  const top = useMemo(() => {
    const m = new Map<string, { qty: number; sum: number }>();
    sales.forEach((x) => x.items.forEach((i) => m.set(i.name, { qty: (m.get(i.name)?.qty ?? 0) + i.qty, sum: (m.get(i.name)?.sum ?? 0) + i.qty * i.unitPrice })));
    return [...m.entries()].sort((a, b) => b[1].sum - a[1].sum).slice(0, 8);
  }, [sales]);

  const exportCsv = async () => {
    const rows = [["Data", "Ora", "Produse", "Metodă", "Client", "Total (lei)"], ...sales.map((x) => [dayOf(x.at), fmtTime(x.at), x.items.map((i) => `${i.qty} x ${i.name}`).join("; "), x.method === "cash" ? "cash" : x.method === "card-pos" ? "card POS" : "card aplicație", x.clientId ? fullName(s.clients.find((c) => c.id === x.clientId)) : "", String(x.total)])];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    try {
      await navigator.clipboard.writeText(csv);
      toast(`Am copiat ${sales.length} rânduri. Lipește-le în Excel sau trimite-le contabilului.`);
    } catch {
      toast("Copierea nu e permisă aici. În aplicația finală se descarcă un fișier.", "info");
    }
  };

  const label = { azi: "azi", "7": "în ultimele 7 zile", luna: "luna asta", lunaTrecuta: "luna trecută" }[p];

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Segmented p={p} setP={setP} />
        <Button size="md" variant="secondary" full={false} icon={<Copy size={16} />} onClick={exportCsv} className="sm:ml-auto">
          Copiază pentru contabil
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label={`Încasat ${label}`} value={lei(total)} tone="volt" sub={`${sales.length} tranzacții`} />
        <Stat label="Abonamente" value={lei(plans)} sub={total ? `${Math.round((plans / total) * 100)}% din total` : undefined} />
        <Stat label="Bar și accesorii" value={lei(products)} sub={total ? `${Math.round((products / total) * 100)}% din total` : undefined} />
        <Stat label="Medie pe zi" value={lei(Math.round(total / nDays))} sub={`${nDays} ${nDays === 1 ? "zi" : "zile"}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 lg:gap-5">
        <Panel title="Pe zile">
          {nDays > 1 ? <Columns data={daily} height={180} format={(v) => lei(v)} /> : <p className="text-[14px] text-muted">Alege o perioadă mai lungă ca să vezi graficul pe zile.</p>}
        </Panel>
        <Panel title="Cum s-a plătit">
          <div className="flex flex-col gap-3">
            {[
              { l: "Cash, la recepție", v: cash, c: "bg-ok" },
              { l: "Card, la recepție", v: card, c: "bg-violet-ink" },
              { l: "Card, în aplicație", v: app, c: "bg-volt" },
            ].map((m) => (
              <div key={m.l}>
                <div className="flex justify-between gap-2 text-[14px]">
                  <span className="text-text">{m.l}</span>
                  <span className="text-text font-semibold tabular">{lei(m.v)}</span>
                </div>
                <Bar pct={total ? m.v / total : 0} color={m.c} className="h-2 mt-1.5" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 rounded-2xl bg-surface-2 p-3 text-[13px] text-muted leading-snug">
            <Info size={16} className="shrink-0 mt-0.5" />
            Evidență internă. Pentru plățile cash și card la recepție se emite în continuare bonul fiscal din casa de marcat.
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4 lg:gap-5">
        <Panel title="Cele mai vândute">
          <div className="flex flex-col divide-y divide-line">
            {top.map(([name, v], i) => (
              <div key={name} className="flex items-center gap-3 py-2.5 text-[14px]">
                <span className="w-5 text-muted tabular">{i + 1}</span>
                <span className="flex-1 min-w-0 text-text truncate">{name}</span>
                <span className="text-muted tabular shrink-0">{v.qty} buc</span>
                <span className="w-20 text-right font-semibold text-text tabular shrink-0">{lei(v.sum)}</span>
              </div>
            ))}
            {!top.length && <p className="text-[14px] text-muted">Nicio vânzare în perioada aleasă.</p>}
          </div>
        </Panel>
        <Panel title="Toate tranzacțiile">
          <div className="flex flex-col divide-y divide-line max-h-[460px] overflow-y-auto">
            {sales.slice(0, 120).map((x) => (
              <div key={x.id} className="grid grid-cols-[64px_minmax(0,1fr)_auto] sm:grid-cols-[90px_minmax(0,1fr)_auto_90px] gap-3 items-center py-2.5 text-[14px]">
                <span className="text-muted tabular leading-tight">
                  {fmtDate(dayOf(x.at))}
                  <span className="block text-[12px]">{fmtTime(x.at)}</span>
                </span>
                <span className="text-text truncate">{x.items.map((i) => `${i.qty > 1 ? `${i.qty} × ` : ""}${i.name}`).join(", ")}</span>
                <span className="hidden sm:block">
                  <Badge>{x.method === "cash" ? "Cash" : x.method === "card-pos" ? "Card" : "Aplicație"}</Badge>
                </span>
                <span className="text-right font-semibold text-text tabular">{lei(x.total)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Segmented({ p, setP }: { p: Period; setP: (p: Period) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {(
        [
          ["azi", "Azi"],
          ["7", "7 zile"],
          ["luna", "Luna asta"],
          ["lunaTrecuta", "Luna trecută"],
        ] as [Period, string][]
      ).map(([k, l]) => (
        <button key={k} type="button" onClick={() => setP(k)} className={`shrink-0 h-10 px-4 rounded-full text-[14px] font-semibold border ${p === k ? "bg-volt text-ink border-volt" : "bg-surface text-text border-line"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}
