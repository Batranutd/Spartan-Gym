import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus } from "lucide-react";

interface Props {
  label: string;
  unit: string;
  value: number | null;
  placeholder: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  error?: string | null;
}

/** Câmp numeric mare, cu butoane − / + (țin apăsat ca să meargă repede). Ușor de folosit la orice vârstă. */
export function Stepper({ label, unit, value, placeholder, min, max, step = 1, onChange, error }: Props) {
  const [text, setText] = useState(value?.toString() ?? "");
  const timer = useRef<number | null>(null);
  const valRef = useRef(value ?? placeholder);

  useEffect(() => {
    valRef.current = value ?? placeholder;
    if (document.activeElement?.getAttribute("data-stepper") !== label) setText(value?.toString().replace(".", ",") ?? "");
  }, [value, placeholder, label]);

  const clamp = (v: number) => +Math.min(max, Math.max(min, Math.round(v / step) * step)).toFixed(2);
  const bump = (dir: 1 | -1) => {
    const next = clamp(+(valRef.current + dir * step).toFixed(1));
    valRef.current = next;
    onChange(next);
  };
  const start = (dir: 1 | -1) => {
    bump(dir);
    let delay = 380;
    const loop = () => {
      bump(dir);
      delay = Math.max(50, delay * 0.8);
      timer.current = window.setTimeout(loop, delay);
    };
    timer.current = window.setTimeout(loop, delay);
  };
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const btn = "w-14 h-14 rounded-2xl bg-surface-2 border border-line grid place-items-center active:bg-line select-none touch-none";

  return (
    <div>
      <div className="text-[14px] text-muted mb-2 font-medium">{label}</div>
      <div className={`flex items-center gap-3 rounded-3xl bg-surface border p-2 ${error ? "border-danger" : "border-line"}`}>
        <motion.button type="button" whileTap={{ scale: 0.9 }} className={btn} aria-label={`Scade ${label.toLowerCase()}`} onPointerDown={() => start(-1)} onClick={(e) => e.detail === 0 && bump(-1)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}>
          <Minus size={22} />
        </motion.button>
        <div className="flex-1 flex items-baseline justify-center gap-1.5 overflow-hidden">
          <input
            data-stepper={label}
            inputMode="decimal"
            aria-label={label}
            value={text}
            placeholder={placeholder.toString()}
            onChange={(e) => {
              const t = e.target.value.replace(/[^\d.,]/g, "").slice(0, 5);
              setText(t);
              const n = parseFloat(t.replace(",", "."));
              if (!Number.isNaN(n) && n >= min && n <= max) onChange(n);
            }}
            onBlur={() => {
              const n = parseFloat(text.replace(",", "."));
              if (!Number.isNaN(n)) {
                const c = clamp(n);
                onChange(c);
                setText(c.toString().replace(".", ","));
              }
            }}
            className="w-[3.6ch] bg-transparent text-right font-display font-extrabold text-[34px] outline-none placeholder:text-faint tabular"
          />
          <span className="text-muted text-[16px] w-8">{unit}</span>
        </div>
        <motion.button type="button" whileTap={{ scale: 0.9 }} className={btn} aria-label={`Crește ${label.toLowerCase()}`} onPointerDown={() => start(1)} onClick={(e) => e.detail === 0 && bump(1)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}>
          <Plus size={22} />
        </motion.button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[13px] text-danger mt-1.5">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
