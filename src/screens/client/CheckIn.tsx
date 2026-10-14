import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, ScanLine, Zap } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Scroll, TopBar } from "../../components/ui/kit";
import { QR } from "../../components/ui/QR";
import { Button } from "../../components/ui/Button";
import { toast } from "../../components/ui/Toast";
import { dayOf, fmtTime, today } from "../../lib/date";

export function CheckInScreen() {
  const me = useMe();
  const nav = useClientNav();
  const checkIn = useStore((s) => s.checkIns);
  const doCheckIn = useStore((s) => s.checkIn);
  const todays = checkIn.find((c) => c.clientId === me.id && dayOf(c.at) === today());
  const [done, setDone] = useState<null | { points: number; message: string }>(null);

  const simulate = () => {
    const r = doCheckIn(me.id, "qr");
    if (r.ok) setDone({ points: r.points ?? 0, message: r.message });
    else toast(r.message, "error");
  };

  return (
    <>
      <TopBar title="Check-in" onBack={nav.pop} />
      <Scroll>
        <div className="flex flex-col items-center text-center pt-2">
          <p className="text-[15px] text-muted max-w-[30ch] leading-snug">Arată codul la recepție sau scanează-l la intrare.</p>
          <div className="relative mt-6">
            <motion.div className="absolute -inset-4 rounded-[32px] border-2 border-volt/50" animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.98, 1.02, 0.98] }} transition={{ duration: 2.4, repeat: Infinity }} aria-hidden />
            <motion.div initial={{ scale: 0.85, rotate: -4, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}>
              <QR value={`SPARTAN:${me.memberId}`} size={232} />
            </motion.div>
          </div>
          <div className="mt-7 font-display font-extrabold text-[22px] text-text">
            {me.firstName} {me.lastName}
          </div>
          <div className="text-[15px] text-muted tabular mt-0.5">ID membru {me.memberId}</div>

          <AnimatePresence mode="wait">
            {done || todays ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mt-6 w-full rounded-3xl bg-volt-soft border border-volt/30 p-4 flex items-center gap-3 text-left">
                <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                  <CheckCircle2 size={34} className="text-volt" />
                </motion.span>
                <div className="min-w-0">
                  <div className="font-semibold text-[16px] text-text">{done ? done.message : "Ai făcut check-in azi"}</div>
                  <div className="text-[14px] text-muted mt-0.5">
                    {done ? (
                      <span className="inline-flex items-center gap-1">
                        <Zap size={14} className="text-violet-ink" /> +{done.points} puncte
                      </span>
                    ) : (
                      `La ora ${fmtTime(todays!.at)}`
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="demo" className="mt-6 w-full">
                <Button icon={<ScanLine size={20} />} onClick={simulate}>
                  Simulează scanarea la recepție
                </Button>
                <p className="text-[13px] text-faint mt-2">Doar în demo. În sală, codul se scanează la intrare.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 w-full rounded-2xl bg-surface border border-line p-3.5 flex gap-3 text-left">
            <Info size={18} className="text-muted shrink-0 mt-0.5" />
            <p className="text-[14px] text-muted leading-snug">Fiecare vizită îți aduce puncte. La a treia vizită dintr-o săptămână primești bonus.</p>
          </div>
        </div>
      </Scroll>
    </>
  );
}
