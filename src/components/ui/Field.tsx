import { AnimatePresence, motion } from "motion/react";
import { useId, type InputHTMLAttributes, type ReactNode } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label: string;
  error?: string | null;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function Field({ label, error, hint, prefix, suffix, className = "", ...rest }: Props) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[14px] text-muted mb-2 font-medium">
        {label}
      </label>
      <div
        className={`flex items-center h-14 rounded-2xl bg-surface-2 border transition-colors ${
          error ? "border-danger" : "border-line focus-within:border-volt"
        }`}
      >
        {prefix && <span className="pl-4 pr-1 text-muted shrink-0">{prefix}</span>}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className="flex-1 min-w-0 h-full bg-transparent px-4 outline-none placeholder:text-faint"
          {...rest}
        />
        {suffix && <span className="pr-3 pl-1 text-muted shrink-0">{suffix}</span>}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="err"
            id={`${id}-err`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[13px] text-danger mt-1.5"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="hint" id={`${id}-hint`} className="text-[13px] text-faint mt-1.5">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
