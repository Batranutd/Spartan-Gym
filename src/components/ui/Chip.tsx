import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

interface Props {
  label: string;
  selected: boolean;
  onToggle: () => void;
  tone?: "volt" | "violet";
}

export function Chip({ label, selected, onToggle, tone = "volt" }: Props) {
  const on = tone === "volt" ? "bg-volt text-ink border-volt" : "bg-violet text-white border-violet";
  return (
    <motion.button
      type="button"
      layout
      whileTap={{ scale: 0.94 }}
      onClick={onToggle}
      aria-pressed={selected}
      className={`h-11 px-4 rounded-full border text-[15px] inline-flex items-center gap-1.5 transition-colors ${
        selected ? `${on} font-semibold` : "bg-surface-2 border-line text-text"
      }`}
    >
      <AnimatePresence initial={false}>
        {selected && (
          <motion.span
            initial={{ width: 0, opacity: 0, scale: 0.4 }}
            animate={{ width: 16, opacity: 1, scale: 1 }}
            exit={{ width: 0, opacity: 0, scale: 0.4 }}
            className="inline-flex"
          >
            <Check size={16} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
      {label}
    </motion.button>
  );
}

export function ChipGroup({
  options,
  value,
  onChange,
  max,
  tone,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
  tone?: "volt" | "violet";
}) {
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter((x) => x !== o));
    else if (!max || value.length < max) onChange([...value, o]);
    else onChange([...value.slice(1), o]); // la limită, cel mai vechi iese
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} label={o} selected={value.includes(o)} onToggle={() => toggle(o)} tone={tone} />
      ))}
    </div>
  );
}
