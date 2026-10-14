import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Avatar, Badge, Segmented, Stars, TextArea } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { toast } from "../../components/ui/Toast";
import { Panel, Stat, type AdminPageProps } from "./AdminApp";
import { dayOf, fmtDate } from "../../lib/date";
import { fullName } from "../../lib/derive";
import { avgStars } from "../client/GymInfo";
import type { Ticket } from "../../data/types";

export function AdminFeedback(_: AdminPageProps) {
  const s = useStore();
  const [tab, setTab] = useState<"tickets" | "reviews">("tickets");
  const [st, setSt] = useState<"toate" | Ticket["status"]>("toate");
  const [reply, setReply] = useState<Record<string, string>>({});
  const gymRev = s.reviews.filter((r) => r.target === "sală");
  const tickets = s.tickets.filter((t) => st === "toate" || t.status === st);

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Nota sălii" value={avgStars(gymRev).toFixed(1).replace(".", ",")} sub={`${gymRev.length} recenzii`} tone="warn" />
        <Stat label="Reclamații noi" value={s.tickets.filter((t) => t.status === "nouă" && t.kind === "reclamație").length} tone="danger" />
        <Stat label="Propuneri noi" value={s.tickets.filter((t) => t.status === "nouă" && t.kind === "propunere").length} tone="violet" />
        <Stat label="Rezolvate" value={s.tickets.filter((t) => t.status === "rezolvată").length} />
      </div>
      <div className="max-w-[420px]">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "tickets", label: "Reclamații și propuneri" },
            { value: "reviews", label: "Recenzii" },
          ]}
        />
      </div>

      {tab === "tickets" ? (
        <Panel title="Mesaje de la clienți">
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {(["toate", "nouă", "în lucru", "rezolvată"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setSt(k)} className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-semibold border ${st === k ? "bg-volt text-ink border-volt" : "bg-surface-2 text-text border-line"}`}>
                {k === "toate" ? "Toate" : k === "nouă" ? "Noi" : k === "în lucru" ? "În lucru" : "Rezolvate"}
              </button>
            ))}
          </div>
          <div className="flex flex-col divide-y divide-line">
            {tickets.map((t) => {
              const c = s.clients.find((x) => x.id === t.clientId);
              return (
                <div key={t.id} className="py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={t.kind === "reclamație" ? "danger" : "violet"}>{t.kind === "reclamație" ? "Reclamație" : "Propunere"}</Badge>
                      <span className="text-[15px] font-semibold text-text">{t.subject}</span>
                    </div>
                    <p className="text-[14px] text-text mt-1.5 leading-snug">{t.text}</p>
                    <div className="flex items-center gap-2 mt-2 text-[12px] text-muted">
                      <Avatar name={fullName(c)} photo={c?.photo} size={22} id={t.clientId} />
                      {fullName(c)} · {fmtDate(dayOf(t.at), { day: "numeric", month: "long" })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex gap-1.5">
                      {(["nouă", "în lucru", "rezolvată"] as const).map((k) => (
                        <button key={k} type="button" onClick={() => s.updateTicket(t.id, k)} className={`flex-1 h-9 rounded-xl text-[13px] font-semibold border ${t.status === k ? (k === "rezolvată" ? "bg-ok text-ink border-ok" : k === "în lucru" ? "bg-warn text-ink border-warn" : "bg-text text-ink border-text") : "bg-surface-2 text-text border-line"}`}>
                          {k === "nouă" ? "Nouă" : k === "în lucru" ? "În lucru" : "Rezolvată"}
                        </button>
                      ))}
                    </div>
                    {t.reply ? (
                      <p className="text-[13px] text-muted rounded-xl bg-surface-2 p-2.5 leading-snug">
                        <span className="text-text font-semibold">Răspunsul tău: </span>
                        {t.reply}
                      </p>
                    ) : (
                      <>
                        <TextArea label="Răspuns pentru client" rows={2} value={reply[t.id] ?? ""} onChange={(v) => setReply({ ...reply, [t.id]: v })} placeholder="Clientul îl primește ca notificare" />
                        <Button
                          size="sm"
                          onClick={() => {
                            const r = (reply[t.id] ?? "").trim();
                            if (r.length < 3) return;
                            s.updateTicket(t.id, t.status === "nouă" ? "în lucru" : t.status, r);
                            toast("Răspuns trimis clientului");
                          }}
                        >
                          Trimite răspunsul
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {!tickets.length && <p className="text-[14px] text-muted py-4">Nimic aici.</p>}
          </div>
        </Panel>
      ) : (
        <Panel title="Recenzii">
          <div className="flex flex-col divide-y divide-line">
            {s.reviews.map((r) => {
              const c = s.clients.find((x) => x.id === r.clientId);
              const t = r.target === "sală" ? null : s.trainers.find((x) => x.id === r.target);
              return (
                <div key={r.id} className="py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars value={r.stars} size={14} />
                      <Badge tone={t ? "violet" : "neutral"}>{t ? `Antrenor: ${t.firstName}` : "Sala"}</Badge>
                    </div>
                    <p className="text-[14px] text-text mt-1.5 leading-snug">{r.text}</p>
                    <div className="text-[12px] text-muted mt-1.5">
                      {fullName(c)} · {fmtDate(dayOf(r.at), { day: "numeric", month: "long" })}
                    </div>
                  </div>
                  <div className="min-w-0">
                    {r.reply ? (
                      <p className="text-[13px] text-muted rounded-xl bg-surface-2 p-2.5 leading-snug">
                        <span className="text-text font-semibold">Răspuns public: </span>
                        {r.reply}
                      </p>
                    ) : r.target === "sală" ? (
                      <div className="flex flex-col gap-2">
                        <TextArea label="Răspuns public" rows={2} value={reply[r.id] ?? ""} onChange={(v) => setReply({ ...reply, [r.id]: v })} placeholder="Apare sub recenzie, în aplicație" />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const x = (reply[r.id] ?? "").trim();
                            if (x.length < 3) return;
                            s.replyReview(r.id, x);
                            toast("Răspuns publicat");
                          }}
                        >
                          Publică răspunsul
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
