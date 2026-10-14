import { useMemo } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, LogIn, Package, UserCheck, Users, Wallet, Banknote, MessageSquareWarning, Send } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Avatar, Badge, Columns } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { toast } from "../../components/ui/Toast";
import { Panel, Stat, type AdminPageProps } from "./AdminApp";
import { addDays, dayOf, diffDays, fmtDate, relDay, today } from "../../lib/date";
import { fullName, hourProfile, isAtRisk, lastVisit, occupancy, subInfo } from "../../lib/derive";
import { lei } from "../../lib/id";

export function AdminDashboard({ go }: AdminPageProps) {
  const s = useStore();
  const T = today();
  const data = useMemo(() => {
    const infos = s.clients.map((c) => ({ c, info: subInfo(s, c.id) }));
    const active = infos.filter((x) => x.info.active);
    const expiring = infos.filter((x) => x.info.active && x.info.daysLeft <= 7 && !x.info.upcoming).sort((a, b) => a.info.daysLeft - b.info.daysLeft);
    const atRisk = s.clients.filter((c) => isAtRisk(s, c));
    const todaySales = s.sales.filter((x) => dayOf(x.at) === T);
    const todayIncome = todaySales.reduce((a, x) => a + x.total, 0);
    const checkToday = s.checkIns.filter((c) => dayOf(c.at) === T).length;
    const days = Array.from({ length: 14 }, (_, i) => addDays(T, i - 13));
    const revenue = days.map((d) => ({ label: d === T ? "Azi" : String(parseInt(d.slice(8))), value: s.sales.filter((x) => dayOf(x.at) === d).reduce((a, x) => a + x.total, 0) }));
    const prof = hourProfile(s.checkIns.filter((c) => dayOf(c.at) >= addDays(T, -30)));
    const hours = Array.from({ length: 9 }, (_, i) => 6 + i * 2).map((h) => ({ label: `${h}`, value: prof[h] + prof[h + 1] }));
    const yesterday = s.sales.filter((x) => dayOf(x.at) === addDays(T, -1)).reduce((a, x) => a + x.total, 0);
    return { active, expiring, atRisk, todayIncome, checkToday, revenue, hours, yesterday, todaySales };
  }, [s, T]);

  const pending = s.subscriptions.filter((x) => x.status === "în așteptare");
  const lowStock = s.products.filter((p) => p.stock <= p.lowStock);
  const newTickets = s.tickets.filter((t) => t.status === "nouă");
  const trainersPending = s.trainers.filter((t) => t.status === "în așteptare");
  const occ = occupancy(s);
  const diff = data.yesterday ? Math.round(((data.todayIncome - data.yesterday) / data.yesterday) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={<Users size={15} />} label="Clienți activi" value={data.active.length} sub={`din ${s.clients.length} înscriși`} onClick={() => go("clients", "activi")} />
        <Stat icon={<Wallet size={15} />} label="Încasat azi" value={lei(data.todayIncome)} sub={data.yesterday ? `${diff >= 0 ? "+" : ""}${diff}% față de ieri` : undefined} tone="volt" onClick={() => go("finance")} />
        <Stat icon={<LogIn size={15} />} label="Check-in azi" value={data.checkToday} sub={`Acum în sală: ~${occ.people}`} onClick={() => go("desk")} />
        <Stat icon={<CalendarClock size={15} />} label="Expiră în 7 zile" value={data.expiring.length} sub={`${data.atRisk.length} clienți la risc`} tone={data.expiring.length ? "warn" : "default"} onClick={() => go("clients", "expira")} />
      </div>

      {(pending.length > 0 || trainersPending.length > 0 || newTickets.length > 0 || lowStock.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pending.length > 0 && <Alert icon={<Banknote size={18} />} tone="warn" text={`${pending.length} abonamente de încasat la recepție`} onClick={() => go("desk")} />}
          {trainersPending.length > 0 && <Alert icon={<UserCheck size={18} />} tone="violet" text={`${trainersPending.length} antrenor așteaptă aprobarea`} onClick={() => go("trainers")} />}
          {newTickets.length > 0 && <Alert icon={<MessageSquareWarning size={18} />} tone="danger" text={`${newTickets.length} reclamații sau propuneri noi`} onClick={() => go("feedback")} />}
          {lowStock.length > 0 && <Alert icon={<Package size={18} />} tone="warn" text={`${lowStock.length} produse cu stoc mic`} onClick={() => go("stock")} />}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 lg:gap-5">
        <Panel title="Încasări, ultimele 14 zile" action={<Button size="sm" variant="ghost" full={false} iconRight={<ArrowRight size={15} />} onClick={() => go("finance")}>Rapoarte</Button>}>
          <Columns data={data.revenue} height={170} format={(v) => lei(v)} />
        </Panel>
        <Panel title="Vizite pe ore (30 de zile)">
          <Columns data={data.hours} height={170} highlightLast={false} />
          <p className="text-[13px] text-muted mt-2">Orele de vârf sunt seara, între 17 și 20.</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <Panel
          title="Abonamente care expiră"
          action={
            data.expiring.length > 0 && (
              <Button
                size="sm"
                full={false}
                icon={<Send size={15} />}
                onClick={() => {
                  const n = s.sendExpiryReminders();
                  toast(`Am trimis ${n} notificări de reînnoire`);
                }}
              >
                Trimite reminder
              </Button>
            )
          }
        >
          {data.expiring.length ? (
            <div className="flex flex-col divide-y divide-line">
              {data.expiring.slice(0, 6).map(({ c, info }) => (
                <button key={c.id} type="button" onClick={() => go("clients", c.id)} className="flex items-center gap-3 py-2.5 text-left">
                  <Avatar name={fullName(c)} photo={c.photo} size={36} id={c.id} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] text-text font-semibold truncate">{fullName(c)}</span>
                    <span className="block text-[12px] text-muted">expiră pe {fmtDate(info.sub!.end)}</span>
                  </span>
                  <Badge tone={info.daysLeft <= 2 ? "danger" : "warn"}>{info.daysLeft === 1 ? "1 zi" : `${info.daysLeft} zile`}</Badge>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-muted">Niciun abonament nu expiră săptămâna asta.</p>
          )}
        </Panel>

        <Panel title="Clienți la risc (nu au mai venit de 12+ zile)">
          {data.atRisk.length ? (
            <div className="flex flex-col divide-y divide-line">
              {data.atRisk.slice(0, 6).map((c) => {
                const lv = lastVisit(s, c.id);
                return (
                  <div key={c.id} className="flex items-center gap-3 py-2.5">
                    <Avatar name={fullName(c)} photo={c.photo} size={36} id={c.id} />
                    <button type="button" onClick={() => go("clients", c.id)} className="flex-1 min-w-0 text-left">
                      <span className="block text-[15px] text-text font-semibold truncate">{fullName(c)}</span>
                      <span className="block text-[12px] text-muted">{lv ? `ultima vizită acum ${diffDays(T, dayOf(lv))} zile` : "nicio vizită"}</span>
                    </button>
                    <Button
                      size="sm"
                      variant="secondary"
                      full={false}
                      onClick={() => {
                        s.sendNotice({ to: c.id, title: "Ne este dor de tine!", body: "Hai la sală săptămâna asta. Primești bonus 20 de puncte la prima vizită.", kind: "anunț" });
                        toast(`Mesaj trimis lui ${c.firstName}`);
                      }}
                    >
                      Trimite mesaj
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[14px] text-muted">Toți clienții activi vin constant. Foarte bine!</p>
          )}
        </Panel>
      </div>

      <Panel title="Ultimele vânzări de azi" action={<Button size="sm" variant="ghost" full={false} iconRight={<ArrowRight size={15} />} onClick={() => go("desk")}>Casa</Button>}>
        {data.todaySales.length ? (
          <div className="flex flex-col divide-y divide-line">
            {[...data.todaySales]
              .sort((a, b) => b.at.localeCompare(a.at))
              .slice(0, 6)
              .map((x) => (
                <div key={x.id} className="flex items-center gap-3 py-2.5 text-[14px]">
                  <span className="w-12 text-muted tabular shrink-0">{new Date(x.at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="flex-1 min-w-0 text-text truncate">{x.items.map((i) => `${i.qty > 1 ? `${i.qty} × ` : ""}${i.name}`).join(", ")}</span>
                  <Badge>{x.method === "cash" ? "Cash" : x.method === "card-pos" ? "Card" : "Aplicație"}</Badge>
                  <span className="w-20 text-right font-semibold text-text tabular shrink-0">{lei(x.total)}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-[14px] text-muted">Nicio vânzare încă azi ({relDay(T).toLowerCase()}).</p>
        )}
      </Panel>
    </div>
  );
}

function Alert({ icon, text, onClick, tone }: { icon: React.ReactNode; text: string; onClick: () => void; tone: "warn" | "danger" | "violet" }) {
  const c = { warn: "bg-warn-soft text-warn border-warn/30", danger: "bg-danger-soft text-danger border-danger/30", violet: "bg-violet-soft text-violet-ink border-violet/40" }[tone];
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left ${c}`}>
      {icon}
      <span className="flex-1 min-w-0 text-[14px] font-semibold leading-snug">{text}</span>
      <ArrowRight size={16} className="shrink-0" />
    </button>
  );
}

export { AlertTriangle };
