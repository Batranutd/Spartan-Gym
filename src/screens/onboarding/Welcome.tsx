import { motion } from "motion/react";
import { ArrowRight, CalendarCheck, Dumbbell, Salad, Trophy } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";
import { Hero3D } from "../../components/three/Hero3D";
import { brand } from "../../brand";
import { useApp } from "../../store/useApp";

const features = [
  { icon: CalendarCheck, label: "Abonament" },
  { icon: Dumbbell, label: "Progres" },
  { icon: Salad, label: "Nutriție" },
  { icon: Trophy, label: "Recompense" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Welcome() {
  const setStep = useApp((s) => s.setStep);
  const hasAccount = useApp((s) => !!s.account);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <motion.header
        className="safe-top px-5 flex items-center justify-between shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="pt-2">
          <Logo />
        </div>
        <span className="pt-2 text-[13px] text-muted">{brand.city}</span>
      </motion.header>

      <motion.div
        className="flex-1 min-h-[220px] -mx-2"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.1 }}
      >
        <Hero3D />
      </motion.div>

      <div className="px-5 safe-bottom shrink-0">
        <motion.h1
          className="font-display font-extrabold text-[40px] leading-[1.02]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.25 }}
        >
          Sala ta,
          <br />
          <span className="text-volt">în buzunar.</span>
        </motion.h1>
        <motion.p
          className="text-muted text-[17px] mt-3 leading-relaxed"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.35 }}
        >
          Tot ce ține de antrenamentul tău la {brand.gymName}, într-un singur loc.
        </motion.p>

        <div className="flex flex-wrap gap-2 mt-5">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease, delay: 0.45 + i * 0.07 }}
              className="shrink-0 h-10 pl-3 pr-4 rounded-full bg-surface-2 border border-line inline-flex items-center gap-2 text-[14px]"
            >
              <f.icon size={17} className="text-volt" />
              {f.label}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-7 flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.7 }}
        >
          <Button iconRight={<ArrowRight size={20} />} onClick={() => setStep("account")}>
            Creează cont
          </Button>
          <Button variant="secondary" onClick={() => setStep("login")}>
            {hasAccount ? "Intră în cont" : "Am deja cont"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
