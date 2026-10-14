import { useMemo, useState } from "react";
import { Send, Timer } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Avatar, Badge, Segmented, TextArea } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { NumberBox } from "../../components/ui/NumberBox";
import { toast } from "../../components/ui/Toast";
import { Panel, type AdminPageProps } from "./AdminApp";
import { dayOf, fmtDate, fmtTime } from "../../lib/date";
import { fullName, isAtRisk, subInfo } from "../../lib/derive";

type Aud = "toti" | "expira" | "risc" | "unul";

const TEMPLATES = [
  { t: "Program de sărbători", b: "De Crăciun sala e deschisă între 10:00 și 16:00. La mulți ani!" },
  { t: "Aparat nou", b: "Am adus un aparat nou în zona de forță. Vino să-l încerci!" },
  { t: "Ofertă", b: "Săptămâna asta, abonamentul de 3 luni are 10% reducere la recepție." },
  { t: "Mentenanță", b: "Mâine dimineață dușurile sunt închise între 7 și 9 pentru reparații." },
];

export function AdminNotify(_: AdminPageProps) {
  const s = useStore();
  const [aud, setAud] = useState<Aud>("toti");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [q, setQ] = useState("");
  const [one, setOne] = useState<string | null>(null);

  const targets = useMemo(() => {
    if (aud === "toti") return s.clients;
    if (aud === "expira")
      return s.clients.filter((c) => {
        const i = subInfo(s, c.id);
        return i.active && i.daysLeft <= 7;
      });
    if (aud === "risc") return s.clients.filter((c) => isAtRisk(s, c));
    return s.clients.filter((c) => c.id === one);
  }, [s, aud, one]);

  const send = () => {
    if (title.trim().length < 3 || body.trim().length < 3) return toast("Completează titlul și mesajul", "info");
    if (!targets.length) return toast("Nu există destinatari", "info");
    if (aud === "toti") s.sendNotice({ to: "toți", title: title.trim(), body: body.trim(), kind: "anunț" });
    else targets.forEach((c) => s.sendNotice({ to: c.id, title: title.trim(), body: body.trim(), kind: aud === "expira" ? "abonament" : "anunț" }));
    toast(`Trimis către ${targets.length} ${targets.length === 1 ? "client" : "clienți"}`);
    setTitle("");
    setBody("");
  };

  const history = [...s.notices].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 14);
  const matches = q.length >= 2 ? s.clients.filter((c) => fullName(c).toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4 lg:gap-5">
      <div className="flex flex-col gap-4 lg:gap-5 min-w-0">
        <Panel title="Mesaj nou">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {(
                [
                  ["toti", "Toți clienții"],
                  ["expira", "Expiră în 7 zile"],
                  ["risc", "La risc"],
                  ["unul", "Un client"],
                ] as [Aud, string][]
              ).map(([k, l]) => (
                <button key={k} type="button" onClick={() => setAud(k)} className={`shrink-0 h-10 px-4 rounded-full text-[14px] font-semibold border ${aud === k ? "bg-volt text-ink border-volt" : "bg-surface-2 text-text border-line"}`}>
                  {l}
                </button>
              ))}
            </div>
            {aud === "unul" && (
              <div>
                <Field label="Caută clientul" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nume" />
                <div className="flex flex-col mt-1">
                  {matches.map((c) => (
                    <button key={c.id} type="button" onClick={() => (setOne(c.id), setQ(fullName(c)))} className={`flex items-center gap-3 py-2 px-2 rounded-xl text-left ${one === c.id ? "bg-volt-soft" : ""}`}>
                      <Avatar name={fullName(c)} photo={c.photo} size={32} id={c.id} />
                      <span className="text-[14px] text-text">{fullName(c)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[14px] text-muted">
              Destinatari: <b className="text-text">{targets.length}</b>
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.t} type="button" onClick={() => (setTitle(t.t), setBody(t.b))} className="h-9 px-3 rounded-full bg-surface-3 text-[13px] font-semibold text-text">
                  {t.t}
                </button>
              ))}
            </div>
            <Field label="Titlu" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Scurt și clar" />
            <TextArea label="Mesaj" value={body} onChange={setBody} placeholder="Ce trebuie să știe clienții" />
            <Button icon={<Send size={18} />} onClick={send}>
              Trimite notificarea
            </Button>
          </div>
        </Panel>

        <Panel title="Reamintire automată de reînnoire">
          <div className="flex items-center gap-3">
            <Timer size={20} className="text-volt shrink-0" />
            <p className="flex-1 text-[14px] text-text leading-snug">Clientul primește notificare cu atâtea zile înainte să-i expire abonamentul.</p>
            <div className="w-32 shrink-0">
              <NumberBox label="zile înainte" unit="zile" value={s.pointRules.autoReminderDays} min={1} max={14} onChange={(v) => s.setPointRules({ autoReminderDays: v })} />
            </div>
          </div>
          <div className="mt-3">
            <Button size="md" variant="secondary" onClick={() => toast(`Am trimis ${s.sendExpiryReminders()} reamintiri acum`)}>
              Trimite reamintirile acum
            </Button>
          </div>
        </Panel>
      </div>

      <Panel title="Trimise recent">
        <div className="flex flex-col divide-y divide-line">
          {history.map((n) => {
            const c = n.to === "toți" ? null : s.clients.find((x) => x.id === n.to);
            return (
              <div key={n.id} className="py-3">
                <div className="flex items-start gap-2">
                  <span className="flex-1 min-w-0 text-[15px] font-semibold text-text">{n.title}</span>
                  <span className="text-[12px] text-muted tabular shrink-0">
                    {fmtDate(dayOf(n.at))}, {fmtTime(n.at)}
                  </span>
                </div>
                <p className="text-[13px] text-muted mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                <div className="mt-1.5 flex gap-1.5">
                  <Badge tone={n.to === "toți" ? "volt" : "neutral"}>{n.to === "toți" ? "Toți clienții" : fullName(c)}</Badge>
                  {n.to !== "toți" && n.readBy.includes(n.to) && <Badge tone="ok">Citit</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

export { Segmented };
