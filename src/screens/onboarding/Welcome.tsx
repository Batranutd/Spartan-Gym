import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, CalendarCheck, Dumbbell, Salad, Trophy, UserCog } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";
import { Hero3D } from "../../components/three/Hero3D";
import { useStore } from "../../store/useStore";

const features = [
  { icon: CalendarCheck, label: "Abonament" },
  { icon: Dumbbell, label: "Progres" },
  { icon: Salad, label: "Nutriție" },
  { icon: BadgeCheck, label: "Antrenori" },
  { icon: Trophy, label: "Recompense" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Welcome() {
  const setStep = useStore((s) => s.setStep);
  const gym = useStore((s) => s.gym);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <motion.header className="safe-top px-5 flex items-center justify-between shrink-0" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
        <div className="pt-2">
          <Logo />
        </div>
        <button type="button" onClick={() => setStep("staff")} className="mt-2 h-10 pl-3 pr-3.5 rounded-full bg-surface-2 border border-line inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted">
          <UserCog size={16} />
          Personal sală
        </button>
      </motion.header>

      <motion.div className="flex-1 min-h-[170px] -mx-2" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease, delay: 0.1 }}>
        <Hero3D />
      </motion.div>

      <div className="px-5 safe-bottom shrink-0">
        <motion.h1 className="font-display font-extrabold text-[38px] leading-[1.02] text-text" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.25 }}>
          Sala ta,
          <br />
          <span className="text-volt">în buzunar.</span>
        </motion.h1>
        <motion.p className="text-muted text-[16px] mt-3 leading-relaxed" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.35 }}>
          Tot ce ține de antrenamentul tău la {gym.name}, într-un singur loc.
        </motion.p>

        <div className="flex flex-wrap gap-2 mt-4">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease, delay: 0.45 + i * 0.07 }}
              className="h-9 pl-2.5 pr-3.5 rounded-full bg-surface-2 border border-line inline-flex items-center gap-1.5 text-[14px] text-text"
            >
              <f.icon size={16} className="text-volt" />
              {f.label}
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-6 flex flex-col gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.75 }}>
          <Button iconRight={<ArrowRight size={20} />} onClick={() => setStep("account")}>
            Creează cont
          </Button>
          <Button variant="secondary" onClick={() => setStep("login")}>
            Am deja cont
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
