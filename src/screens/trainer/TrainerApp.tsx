import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Clock, Home as HomeIcon, LogOut, ShieldCheck, UserRound, Users } from "lucide-react";
import { useRef, type ComponentType } from "react";
import { useStore } from "../../store/useStore";
import { useTrainerNav } from "../../lib/nav";
import { Avatar, Badge, Card, Scroll, Stagger, TopBar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { fullName } from "../../lib/derive";
import { TrainerToday } from "./TrainerToday";
import { TrainerClients, TrainerClientDetail } from "./TrainerClients";
import { TrainerSchedule } from "./TrainerSchedule";
import { TrainerProfileEdit } from "./TrainerProfileEdit";
import type { Trainer } from "../../data/types";

const TABS = [
  { key: "today", label: "Azi", icon: HomeIcon, C: TrainerToday },
  { key: "clients", label: "Clienți", icon: Users, C: TrainerClients },
  { key: "schedule", label: "Program", icon: CalendarDays, C: TrainerSchedule },
  { key: "profile", label: "Profil", icon: UserRound, C: TrainerProfileEdit },
];
const ROUTES: Record<string, ComponentType<{ params?: Record<string, string> }>> = {
  client: TrainerClientDetail,
};

export function useTrainer(): Trainer {
  const t = useStore((s) => s.trainers.find((x) => x.id === s.session.trainerId));
  const last = useRef<Trainer | undefined>(t);
  if (t) last.current = t;
  return (t ?? last.current) as Trainer;
}

export function TrainerApp() {
  const t = useTrainer();
  const { tab, stack, setTab } = useTrainerNav();
  if (!t) return null;
  if (t.status !== "aprobat") return <Pending t={t} />;
  const top = stack[stack.length - 1];
  const Tab = TABS.find((x) => x.key === tab)?.C ?? TrainerToday;
  const Top = top ? ROUTES[top.name] : null;

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div key={tab} className="absolute inset-0 flex flex-col" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
          <Tab />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {Top && (
          <motion.div key={`${top.name}-${stack.length}`} className="absolute inset-0 z-30 flex flex-col bg-ink" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
            <Top params={top.params} />
          </motion.div>
        )}
      </AnimatePresence>
      <nav className="absolute bottom-0 inset-x-0 z-20 safe-bottom pt-2 px-0.5 bg-ink/92 backdrop-blur-xl border-t border-line" aria-label="Meniu antrenor">
        <div className="flex">
          {TABS.map((x) => {
            const on = x.key === tab;
            return (
              <button key={x.key} type="button" onClick={() => setTab(x.key)} aria-current={on ? "page" : undefined} className="relative flex-1 min-w-0 flex flex-col items-center gap-1 pt-1.5 pb-1">
                {on && <motion.span layoutId="trainer-tab" className="absolute top-0 h-[3px] w-8 rounded-full bg-violet-ink" />}
                <x.icon size={23} className={on ? "text-violet-ink" : "text-faint"} strokeWidth={on ? 2.3 : 1.9} />
                <span className={`text-[11px] leading-none ${on ? "text-text font-semibold" : "text-muted"}`}>{x.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Pending({ t }: { t: Trainer }) {
  const s = useStore();
  return (
    <div className="h-full flex flex-col">
      <TopBar title="Profil de antrenor" />
      <Scroll>
        <Stagger>
          <div className="flex flex-col items-center text-center pt-4">
            <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
              <Clock size={44} className="text-warn" />
            </motion.div>
            <h2 className="font-display font-extrabold text-[24px] text-text mt-4">{t.status === "respins" ? "Profilul nu a fost aprobat" : "Profil trimis spre aprobare"}</h2>
            <p className="text-[15px] text-muted mt-2 leading-relaxed max-w-[32ch]">
              {t.status === "respins" ? "Administratorul nu a aprobat profilul. Discută cu el la recepție." : "Administratorul sălii verifică datele. Primești acces imediat ce aprobă."}
            </p>
          </div>
        </Stagger>
        <Stagger i={1} className="mt-6">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar name={fullName(t)} photo={t.photo} size={56} id={t.id} />
              <div className="min-w-0">
                <div className="font-semibold text-[16px] text-text">{fullName(t)}</div>
                <div className="text-[13px] text-muted truncate">{t.specialties.join(" · ")}</div>
              </div>
              <Badge tone={t.status === "respins" ? "danger" : "warn"} className="ml-auto">
                {t.status === "respins" ? "Respins" : "În așteptare"}
              </Badge>
            </div>
            <p className="text-[14px] text-text mt-3 leading-snug">{t.bio}</p>
          </Card>
        </Stagger>
        <Stagger i={2} className="mt-6 flex flex-col gap-2">
          <p className="text-[13px] text-faint">Demo: poți aproba profilul chiar tu, din panoul de administrare.</p>
          <Button variant="secondary" icon={<ShieldCheck size={18} />} onClick={() => s.enterAs("admin")}>
            Panoul de administrare
          </Button>
          <Button variant="ghost" icon={<LogOut size={18} />} onClick={() => s.logout()}>
            Ieși
          </Button>
        </Stagger>
      </Scroll>
    </div>
  );
}
