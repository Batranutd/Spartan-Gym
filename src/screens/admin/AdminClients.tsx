import { useMemo, useState } from "react";
import { Bell, CalendarPlus, CheckCircle2, LogIn, Search, Zap } from "lucide-react";
import { useStore, pointsOf } from "../../store/useStore";
import { Avatar, Badge, Segmented, Select, TextArea } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { toast } from "../../components/ui/Toast";
import { Drawer, Panel, type AdminPageProps } from "./AdminApp";
import { addDays, dayOf, diffDays, fmtDate, fmtLong, startOfWeek, today, DAY_SHORT } from "../../lib/date";
import { clientCheckIns, fullName, isAtRisk, lastVisit, subInfo, visitsBetween, monthStart } from "../../lib/derive";
import { lei } from "../../lib/id";
import type { Client, PayMethod } from "../../data/types";

type Filter = "toti" | "activi" | "expira" | "expirati" | "risc";

export function AdminClients({ param }: AdminPageProps) {
  const s = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>(param === "activi" || param === "expira" ? (param as Filter) : "toti");
  const [open, setOpen] = useState<string | null>(param && param.startsWith("c-") ? param : null);

  const rows = useMemo(
    () =>
      s.clients
        .map((c) => ({ c, info: subInfo(s, c.id), lv: lastVisit(s, c.id), risk: isAtRisk(s, c), pts: pointsOf(s, c.id) }))
        .filter((r) => {
          if (q && !`${fullName(r.c)} ${r.c.email} ${r.c.memberId} ${r.c.phone}`.toLowerCase().includes(q.toLowerCase())) return false;
          if (filter === "activi") return r.info.active;
          if (filter === "expira") return r.info.active && r.info.daysLeft <= 7;
          if (filter === "expirati") return !r.info.active;
          if (filter === "risc") return r.risk;
          return true;
        })
        .sort((a, b) => (filter === "expira" ? a.info.daysLeft - b.info.daysLeft : a.c.lastName.localeCompare(b.c.lastName))),
    [s, q, filter],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <Field className="flex-1" label="Caută client" prefix={<Search size={18} />} placeholder="Nume, e-mail, telefon sau ID" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
        {(
          [
            ["toti", "Toți"],
            ["activi", "Activi"],
            ["expira", "Expiră în 7 zile"],
            ["expirati", "Fără abonament"],
            ["risc", "La risc"],
          ] as [Filter, string][]
        ).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`shrink-0 h-10 px-4 rounded-full text-[14px] font-semibold border ${filter === k ? "bg-volt text-ink border-volt" : "bg-surface text-text border-line"}`}>
            {l}
          </button>
        ))}
      </div>

      <Panel title={`${rows.length} clienți`}>
        <div className="hidden md:grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_80px] gap-3 px-2 pb-2 text-[12px] font-semibold text-muted uppercase tracking-wider border-b border-line">
          <span>Client</span>
          <span>Abonament</span>
          <span>Ultima vizită</span>
          <span>Stare</span>
          <span className="text-right">Puncte</span>
        </div>
        <div className="flex flex-col divide-y divide-line">
          {rows.map(({ c, info, lv, risk, pts }) => {
            const plan = info.sub ? s.plans.find((p) => p.id === info.sub!.planId) : null;
            return (
              <button key={c.id} type="button" onClick={() => setOpen(c.id)} className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_80px] gap-3 items-center px-2 py-3 text-left hover:bg-surface-2 rounded-xl">
                <span className="flex items-center gap-3 min-w-0">
                  <Avatar name={fullName(c)} photo={c.photo} size={38} id={c.id} />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-text truncate">{fullName(c)}</span>
                    <span className="block text-[12px] text-muted truncate">
                      {c.memberId} · {c.phone.replace("+40", "0")}
                    </span>
                  </span>
                </span>
                <span className="hidden md:block text-[14px] text-text truncate">
                  {plan?.name ?? "–"}
                  {info.active && <span className="block text-[12px] text-muted">până pe {fmtDate(info.sub!.end)}</span>}
                </span>
                <span className="hidden md:block text-[14px] text-muted">{lv ? `${diffDays(today(), dayOf(lv))} zile în urmă` : "–"}</span>
                <span className="flex md:block justify-end">
                  {info.pending && !info.active ? (
                    <Badge tone="warn">De încasat</Badge>
                  ) : !info.active ? (
                    <Badge tone="danger">Expirat</Badge>
                  ) : risk ? (
                    <Badge tone="violet">La risc</Badge>
                  ) : info.daysLeft <= 7 ? (
                    <Badge tone="warn">{info.daysLeft} zile</Badge>
                  ) : (
                    <Badge tone="ok">{info.daysLeft} zile</Badge>
                  )}
                </span>
                <span className="hidden md:block text-right text-[14px] font-semibold text-text tabular">{pts}</span>
              </button>
            );
          })}
          {!rows.length && <p className="text-[14px] text-muted py-6 text-center">Niciun client pentru filtrul ales.</p>}
        </div>
      </Panel>

      <ClientDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

export function ClientDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const s = useStore();
  const c = s.clients.find((x) => x.id === id) ?? null;
  return (
    <Drawer open={!!c} onClose={onClose} title={c ? fullName(c) : ""}>
      {c && <ClientDetail c={c} />}
    </Drawer>
  );
}

function ClientDetail({ c }: { c: Client }) {
  const s = useStore();
  const [tab, setTab] = useState<"abonament" | "prezenta" | "profil">("abonament");
  const [plan, setPlan] = useState(s.plans.find((p) => p.popular)?.id ?? s.plans[0].id);
  const [method, setMethod] = useState<PayMethod>("cash");
  const [pts, setPts] = useState("");
  const [reason, setReason] = useState("Bonus de la sală");
  const [msg, setMsg] = useState("");
  const info = subInfo(s, c.id);
  const subs = s.subscriptions.filter((x) => x.clientId === c.id).sort((a, b) => b.start.localeCompare(a.start));
  const checks = clientCheckIns(s, c.id);
  const paid = subs.filter((x) => x.status === "activ").reduce((a, x) => a + x.pricePaid, 0);
  const wk0 = addDays(startOfWeek(), -7 * 7);
  const visitedDays = new Set(checks.map((x) => dayOf(x.at)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={fullName(c)} photo={c.photo} size={64} id={c.id} />
        <div className="min-w-0">
          <div className="text-[14px] text-muted truncate">{c.email}</div>
          <div className="text-[14px] text-text tabular">{c.phone.replace("+40", "0")}</div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge>{c.memberId}</Badge>
            <Badge tone="violet">
              <Zap size={12} /> {pointsOf(s, c.id)} puncte
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          size="md"
          icon={<LogIn size={17} />}
          onClick={() => {
            const r = s.checkIn(c.id, "recepție");
            toast(r.ok ? `Check-in făcut pentru ${c.firstName}` : r.message, r.ok ? "ok" : "error");
          }}
        >
          Check-in
        </Button>
        <Button size="md" variant="secondary" icon={<CalendarPlus size={17} />} onClick={() => setTab("abonament")}>
          Abonament
        </Button>
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "abonament", label: "Abonament" },
          { value: "prezenta", label: "Prezență" },
          { value: "profil", label: "Profil" },
        ]}
      />

      {tab === "abonament" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-surface border border-line p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] text-muted">Stare</span>
              <Badge tone={info.active ? (info.daysLeft <= 7 ? "warn" : "ok") : "danger"}>{info.active ? `Activ, încă ${info.daysLeft} zile` : "Fără abonament activ"}</Badge>
            </div>
            {info.sub && (
              <div className="text-[14px] text-text mt-2">
                {s.plans.find((p) => p.id === info.sub!.planId)?.name}: {fmtLong(info.sub.start)} – {fmtLong(info.sub.end)}
              </div>
            )}
            <div className="text-[13px] text-muted mt-1">Total plătit până acum: {lei(paid)}</div>
          </div>

          {info.pending && (
            <div className="rounded-2xl bg-warn-soft border border-warn/30 p-4">
              <div className="text-[15px] font-semibold text-text">
                De încasat: {s.plans.find((p) => p.id === info.pending!.planId)?.name}, {lei(info.pending.pricePaid)}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button size="md" onClick={() => (s.confirmPending(info.pending!.id, "cash"), toast("Încasat cash, abonament activat"))}>
                  Încasat cash
                </Button>
                <Button size="md" variant="secondary" onClick={() => (s.confirmPending(info.pending!.id, "card-pos"), toast("Încasat cu cardul, abonament activat"))}>
                  Încasat card
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-surface border border-line p-4 flex flex-col gap-3">
            <div className="text-[15px] font-semibold text-text">{info.active ? "Prelungește abonamentul" : "Vinde abonament"}</div>
            <Select label="Abonament" value={plan} onChange={setPlan} options={s.plans.filter((p) => p.active).map((p) => ({ value: p.id, label: `${p.name} · ${lei(p.price)}` }))} />
            <Segmented
              value={method}
              onChange={setMethod}
              options={[
                { value: "cash", label: "Cash" },
                { value: "card-pos", label: "Card" },
              ]}
            />
            <Button
              onClick={() => {
                s.sellPlanAtDesk(c.id, plan, method);
                toast("Abonament adăugat și încasare înregistrată");
              }}
            >
              Încasează {lei(s.plans.find((p) => p.id === plan)?.price ?? 0)}
            </Button>
          </div>

          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Istoric abonamente</div>
            <div className="flex flex-col divide-y divide-line rounded-2xl bg-surface border border-line px-3">
              {subs.map((x) => (
                <div key={x.id} className="flex items-center gap-2 py-2.5 text-[14px]">
                  <span className="flex-1 min-w-0">
                    <span className="block text-text truncate">{s.plans.find((p) => p.id === x.planId)?.name}</span>
                    <span className="block text-[12px] text-muted">
                      {fmtDate(x.start)} – {fmtDate(x.end)} · {x.status === "în așteptare" ? "neîncasat" : x.method === "cash" ? "cash" : x.method === "card-pos" ? "card la recepție" : "card în aplicație"}
                    </span>
                  </span>
                  <span className="font-semibold text-text tabular">{lei(x.pricePaid)}</span>
                </div>
              ))}
              {!subs.length && <p className="text-[14px] text-muted py-3">Niciun abonament.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "prezenta" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Luna asta", v: visitsBetween(checks, monthStart()) },
              { l: "30 de zile", v: visitsBetween(checks, addDays(today(), -29)) },
              { l: "Total", v: checks.length },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl bg-surface border border-line p-3">
                <div className="font-display font-extrabold text-[24px] text-text tabular">{x.v}</div>
                <div className="text-[12px] text-muted">{x.l}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-surface border border-line p-4">
            <div className="text-[15px] font-semibold text-text mb-3">Zilele în care a venit (8 săptămâni)</div>
            <div className="grid grid-cols-[24px_repeat(8,minmax(0,1fr))] gap-1.5 items-center">
              {DAY_SHORT.map((d, di) => (
                <div key={d} className="contents">
                  <span className="text-[11px] text-muted">{d}</span>
                  {Array.from({ length: 8 }, (_, w) => {
                    const day = addDays(wk0, w * 7 + di);
                    const on = visitedDays.has(day);
                    const future = day > today();
                    return <span key={w} title={`${fmtDate(day)}${on ? ": a venit" : ""}`} className={`aspect-square rounded-[5px] ${future ? "bg-transparent border border-line" : on ? "bg-volt" : "bg-surface-3"}`} />;
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[12px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-volt" /> A venit
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-surface-3" /> Nu a venit
              </span>
            </div>
          </div>
          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Ultimele vizite</div>
            <div className="flex flex-col divide-y divide-line rounded-2xl bg-surface border border-line px-3">
              {[...checks]
                .sort((a, b) => b.at.localeCompare(a.at))
                .slice(0, 8)
                .map((x) => (
                  <div key={x.id} className="flex justify-between gap-2 py-2.5 text-[14px]">
                    <span className="text-text">{fmtDate(dayOf(x.at), { weekday: "short", day: "numeric", month: "short" })}</span>
                    <span className="text-muted tabular">
                      {new Date(x.at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })} · {x.via === "qr" ? "QR" : x.via}
                    </span>
                  </div>
                ))}
              {!checks.length && <p className="text-[14px] text-muted py-3">Nicio vizită.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "profil" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-surface border border-line p-4 grid grid-cols-2 gap-y-2 gap-x-3 text-[14px]">
            {[
              ["Vârstă", c.age ? `${c.age} ani` : "–"],
              ["Înălțime", c.heightCm ? `${c.heightCm} cm` : "–"],
              ["Greutate", c.weightKg ? `${String(c.weightKg).replace(".", ",")} kg` : "–"],
              ["Membru din", fmtDate(dayOf(c.createdAt), { month: "short", year: "numeric" })],
              ["Obiectiv", c.goals.join(", ") || "–"],
              ["Antrenori", c.trainerAccess.map((t) => s.trainers.find((x) => x.id === t)?.firstName).join(", ") || "–"],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <div className="text-[12px] text-muted">{k}</div>
                <div className="text-text truncate">{v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-surface border border-line p-4 text-[13px] text-muted leading-relaxed">
            <CheckCircle2 size={14} className="inline text-ok mr-1" />
            Termeni și GDPR acceptate {c.gdprAcceptedAt ? `pe ${fmtDate(dayOf(c.gdprAcceptedAt), { day: "numeric", month: "long", year: "numeric" })}` : ""}. Datele de corp, nutriția și pozele sunt private și nu se văd în panoul de administrare.
          </div>

          <div className="rounded-2xl bg-surface border border-line p-4 flex flex-col gap-3">
            <div className="text-[15px] font-semibold text-text inline-flex items-center gap-2">
              <Zap size={16} className="text-violet-ink" /> Puncte de fidelitate
            </div>
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
              <Field label="Puncte" inputMode="numeric" placeholder="50" value={pts} onChange={(e) => setPts(e.target.value.replace(/[^\d-]/g, ""))} />
              <Field label="Motiv" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <Button
              size="md"
              variant="violet"
              onClick={() => {
                const n = parseInt(pts);
                if (!n) return;
                s.addPoints(c.id, n, reason || "Ajustare de la sală");
                setPts("");
                toast(`${n > 0 ? "Adăugat" : "Scăzut"} ${Math.abs(n)} puncte`);
              }}
            >
              Aplică
            </Button>
          </div>

          <div className="rounded-2xl bg-surface border border-line p-4 flex flex-col gap-3">
            <div className="text-[15px] font-semibold text-text inline-flex items-center gap-2">
              <Bell size={16} className="text-volt" /> Notificare către client
            </div>
            <TextArea label="Mesaj" value={msg} onChange={setMsg} rows={2} placeholder="De exemplu: ți-ai uitat prosopul la recepție" />
            <Button
              size="md"
              onClick={() => {
                if (msg.trim().length < 3) return;
                s.sendNotice({ to: c.id, title: "Mesaj de la sală", body: msg.trim(), kind: "anunț" });
                setMsg("");
                toast("Notificare trimisă");
              }}
            >
              Trimite
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
