import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, FileText, Loader2, MapPin, Megaphone, ShieldCheck } from "lucide-react";
import { StepShell, Stagger } from "../../components/ui/StepShell";
import { Button } from "../../components/ui/Button";
import { Sheet } from "../../components/ui/Sheet";
import { GdprText, LocationText, TermsText } from "../../lib/legal";
import { useApp, type LocationConsent } from "../../store/useApp";

function Check3D({ on }: { on: boolean }) {
  return (
    <motion.span
      className={`w-8 h-8 rounded-[10px] grid place-items-center border-2 shrink-0 ${on ? "bg-volt border-volt text-ink" : "border-line"}`}
      animate={{ scale: on ? [1, 1.18, 1] : 1, rotate: on ? [0, -8, 0] : 0 }}
      transition={{ duration: 0.35 }}
    >
      <AnimatePresence>
        {on && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check size={20} strokeWidth={3.2} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

function ConsentCard({
  icon,
  title,
  desc,
  required,
  on,
  onToggle,
  onRead,
  invalid,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  required?: boolean;
  on: boolean;
  onToggle: () => void;
  onRead?: () => void;
  invalid?: boolean;
}) {
  return (
    <motion.div
      animate={invalid ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-3xl bg-surface border p-4 transition-colors ${on ? "border-volt/50" : invalid ? "border-danger" : "border-line"}`}
    >
      <button type="button" onClick={onToggle} className="w-full flex items-start gap-3.5 text-left" aria-pressed={on}>
        <span className="w-11 h-11 rounded-2xl bg-surface-2 grid place-items-center text-volt shrink-0">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[16px]">{title}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${required ? "bg-volt-soft text-volt" : "bg-surface-2 text-muted"}`}>
              {required ? "Obligatoriu" : "Opțional"}
            </span>
          </span>
          <span className="block text-muted text-[14px] mt-1 leading-snug">{desc}</span>
        </span>
        <Check3D on={on} />
      </button>
      {onRead && (
        <button type="button" onClick={onRead} className="mt-3 ml-[58px] text-[14px] text-volt font-medium underline underline-offset-4">
          Citește tot textul
        </button>
      )}
    </motion.div>
  );
}

export function Consents() {
  const { consents, saveConsents, setStep } = useApp();
  const [terms, setTerms] = useState(!!consents.termsAcceptedAt);
  const [gdpr, setGdpr] = useState(!!consents.gdprAcceptedAt);
  const [marketing, setMarketing] = useState(consents.marketing);
  const [loc, setLoc] = useState<LocationConsent | null>(consents.location);
  const [locBusy, setLocBusy] = useState(false);
  const [sheet, setSheet] = useState<null | "terms" | "gdpr" | "loc">(null);
  const [tried, setTried] = useState(0);

  const askLocation = () => {
    if (!("geolocation" in navigator)) return setLoc("denied");
    setLocBusy(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setLoc("granted");
        setLocBusy(false);
      },
      () => {
        setLoc("denied");
        setLocBusy(false);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  };

  const submit = () => {
    if (!terms || !gdpr) return setTried((t) => t + 1);
    const now = new Date().toISOString();
    saveConsents({
      termsAcceptedAt: consents.termsAcceptedAt ?? now,
      gdprAcceptedAt: consents.gdprAcceptedAt ?? now,
      marketing,
      location: loc ?? "skipped",
    });
    setStep("body");
  };

  const missing = tried > 0 && (!terms || !gdpr);

  return (
    <StepShell
      step={2}
      total={4}
      title="Acordurile tale"
      subtitle="Pe scurt și clar. Le poți revedea oricând din setări."
      onBack={() => setStep("account")}
      footer={
        <>
          <AnimatePresence>
            {missing && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-danger text-[14px] text-center mb-3">
                Bifează termenii și acordul GDPR ca să continui.
              </motion.p>
            )}
          </AnimatePresence>
          <Button iconRight={<ArrowRight size={20} />} onClick={submit}>
            Continuă
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Stagger i={0}>
          <ConsentCard
            key={`t${tried}`}
            icon={<FileText size={22} />}
            title="Termeni și condiții"
            desc="Regulile de folosire a aplicației, a abonamentului și a punctelor."
            required
            on={terms}
            invalid={tried > 0 && !terms}
            onToggle={() => setTerms((v) => !v)}
            onRead={() => setSheet("terms")}
          />
        </Stagger>
        <Stagger i={1}>
          <ConsentCard
            key={`g${tried}`}
            icon={<ShieldCheck size={22} />}
            title="Protecția datelor (GDPR)"
            desc="Datele despre corp și pozele tale sunt private. Tu decizi cine le vede."
            required
            on={gdpr}
            invalid={tried > 0 && !gdpr}
            onToggle={() => setGdpr((v) => !v)}
            onRead={() => setSheet("gdpr")}
          />
        </Stagger>

        <Stagger i={2}>
          <div className={`rounded-3xl bg-surface border p-4 ${loc === "granted" ? "border-volt/50" : "border-line"}`}>
            <div className="flex items-start gap-3.5">
              <span className="w-11 h-11 rounded-2xl bg-surface-2 grid place-items-center text-volt shrink-0">
                <MapPin size={22} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[16px]">Locația</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-2 text-muted">Doar cât folosești aplicația</span>
                </div>
                <p className="text-muted text-[14px] mt-1 leading-snug">Pentru check-in rapid când ajungi la sală și ca să vezi cât e de aglomerat.</p>
                <button type="button" onClick={() => setSheet("loc")} className="mt-2 text-[14px] text-volt font-medium underline underline-offset-4">
                  Cum folosim locația
                </button>
              </div>
            </div>
            <div className="mt-4">
              <AnimatePresence mode="wait" initial={false}>
                {loc === "granted" ? (
                  <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-12 rounded-2xl bg-volt-soft text-volt flex items-center justify-center gap-2 font-medium">
                    <Check size={18} strokeWidth={3} /> Locația e activă
                  </motion.div>
                ) : loc === "denied" ? (
                  <motion.p key="no" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[14px] text-muted bg-surface-2 rounded-2xl p-3 leading-snug">
                    Locația nu a fost permisă. Nicio problemă: faci check-in cu codul QR. O poți activa oricând din setările telefonului.
                  </motion.p>
                ) : (
                  <motion.div key="ask" className="grid grid-cols-[1fr_auto] gap-2">
                    <Button full variant="secondary" className="h-12 text-[16px]" onClick={askLocation} icon={locBusy ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}>
                      Permite locația
                    </Button>
                    <Button full={false} variant="ghost" className="h-12 text-[15px] px-4" onClick={() => setLoc("skipped")}>
                      {loc === "skipped" ? "Sărit" : "Nu acum"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Stagger>

        <Stagger i={3}>
          <ConsentCard
            icon={<Megaphone size={22} />}
            title="Oferte și noutăți"
            desc="Promoții, provocări noi și anunțuri de la sală. Fără spam."
            on={marketing}
            onToggle={() => setMarketing((v) => !v)}
          />
        </Stagger>
      </div>

      <Sheet
        open={sheet === "terms"}
        onClose={() => setSheet(null)}
        title="Termeni și condiții"
        footer={
          <Button
            onClick={() => {
              setTerms(true);
              setSheet(null);
            }}
          >
            Am citit și accept
          </Button>
        }
      >
        {TermsText}
      </Sheet>
      <Sheet
        open={sheet === "gdpr"}
        onClose={() => setSheet(null)}
        title="Protecția datelor"
        footer={
          <Button
            onClick={() => {
              setGdpr(true);
              setSheet(null);
            }}
          >
            Am citit și accept
          </Button>
        }
      >
        {GdprText}
      </Sheet>
      <Sheet open={sheet === "loc"} onClose={() => setSheet(null)} title="Cum folosim locația">
        {LocationText}
      </Sheet>
    </StepShell>
  );
}
