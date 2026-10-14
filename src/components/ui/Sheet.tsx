import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Panou care urcă de jos (bottom sheet) — se închide cu X, tap pe fundal sau tras în jos. */
export function Sheet({ open, onClose, title, children, footer }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-[520px] max-h-[88vh] bg-surface rounded-t-[28px] border-t border-line flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="pt-3 pb-1 grid place-items-center">
              <div className="w-10 h-1.5 rounded-full bg-line" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="font-display text-[22px] font-bold">{title}</h2>
              <button onClick={onClose} aria-label="Închide" className="w-11 h-11 -mr-2 grid place-items-center rounded-full active:bg-surface-2">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4 text-[15px] leading-relaxed text-muted" onPointerDownCapture={(e) => e.stopPropagation()}>
              {children}
            </div>
            {footer && <div className="px-5 pt-2 safe-bottom border-t border-line">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
