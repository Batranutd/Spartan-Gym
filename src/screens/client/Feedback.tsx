import { useState } from "react";
import { MessageSquareWarning } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Badge, Card, Empty, Scroll, Segmented, SectionTitle, TextArea, TopBar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { toast } from "../../components/ui/Toast";
import { dayOf, fmtDate } from "../../lib/date";

export function Feedback() {
  const me = useMe();
  const nav = useClientNav();
  const s = useStore();
  const [kind, setKind] = useState<"propunere" | "reclamație">("propunere");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const mine = s.tickets.filter((t) => t.clientId === me.id);

  const send = () => {
    if (subject.trim().length < 3 || text.trim().length < 5) return toast("Completează subiectul și mesajul", "info");
    s.addTicket(me.id, kind, subject.trim(), text.trim());
    setSubject("");
    setText("");
    toast("Mesajul a ajuns la administrator. Mulțumim!");
  };

  return (
    <>
      <TopBar title="Reclamații și propuneri" onBack={nav.pop} />
      <Scroll>
        <Card>
          <div className="flex flex-col gap-4">
            <Segmented
              value={kind}
              onChange={setKind}
              options={[
                { value: "propunere", label: "Propunere" },
                { value: "reclamație", label: "Reclamație" },
              ]}
            />
            <Field label="Subiect" placeholder={kind === "propunere" ? "De exemplu: mai multe gantere" : "De exemplu: apă rece la dușuri"} value={subject} onChange={(e) => setSubject(e.target.value)} />
            <TextArea label="Mesaj" value={text} onChange={setText} placeholder="Descrie pe scurt" />
            <Button onClick={send}>Trimite</Button>
          </div>
        </Card>

        <SectionTitle className="mt-6">Mesajele mele</SectionTitle>
        {mine.length ? (
          <div className="flex flex-col gap-2">
            {mine.map((t) => (
              <Card key={t.id}>
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] text-text">{t.subject}</div>
                    <div className="text-[12px] text-muted">
                      {t.kind === "propunere" ? "Propunere" : "Reclamație"} · {fmtDate(dayOf(t.at))}
                    </div>
                  </div>
                  <Badge tone={t.status === "rezolvată" ? "ok" : t.status === "în lucru" ? "warn" : "neutral"}>{t.status === "nouă" ? "Trimisă" : t.status === "în lucru" ? "În lucru" : "Rezolvată"}</Badge>
                </div>
                <p className="text-[14px] text-text mt-2 leading-snug">{t.text}</p>
                {t.reply && (
                  <div className="mt-2 rounded-xl bg-surface-2 p-2.5 text-[13px] text-muted leading-snug">
                    <span className="text-text font-semibold">Răspuns: </span>
                    {t.reply}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Empty icon={<MessageSquareWarning size={22} />} title="Niciun mesaj trimis" text="Orice idee sau problemă ajunge direct la administratorul sălii." />
        )}
      </Scroll>
    </>
  );
}
