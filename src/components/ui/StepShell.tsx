import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack: () => void;
  footer: ReactNode;
  children: ReactNode;
}

export function StepShell({ step, total, title, subtitle, onBack, footer, children }: Props) {
  return (
    <div className="h-full flex flex-col">
      <header className="safe-top px-5 pb-3 shrink-0">
        <div className="flex items-center gap-3 h-12">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            aria-label="Înapoi"
            className="w-11 h-11 -ml-2 rounded-full grid place-items-center text-text active:bg-surface-2"
          >
            <ChevronLeft size={26} />
          </motion.button>
          <div className="flex-1 flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
            {Array.from({ length: total }, (_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full bg-line overflow-hidden">
                <motion.div
                  className="h-full bg-volt rounded-full"
                  initial={false}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i === step - 1 ? 0.15 : 0 }}
                />
              </div>
            ))}
          </div>
          <span className="text-[13px] text-muted tabular w-10 text-right">
            {step}/{total}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[30px] leading-tight font-extrabold mt-2"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="text-muted text-[16px] mt-2 leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
        <div className="mt-7">{children}</div>
      </main>

      <footer className="safe-bottom px-5 pt-3 shrink-0 bg-gradient-to-t from-ink via-ink to-ink/0">{footer}</footer>
    </div>
  );
}

/** Animație de intrare în cascadă pentru elementele unui pas */
export function Stagger({ children, i = 0 }: { children: ReactNode; i?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
