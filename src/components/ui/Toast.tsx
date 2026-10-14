import { create } from "zustand";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";

type Kind = "ok" | "info" | "error";
interface ToastState {
  items: { id: number; text: string; kind: Kind }[];
  push: (text: string, kind?: Kind) => void;
  drop: (id: number) => void;
  confirm: null | { title: string; text: string; ok: string; danger?: boolean; resolve: (v: boolean) => void };
  ask: (o: { title: string; text: string; ok: string; danger?: boolean }) => Promise<boolean>;
  close: (v: boolean) => void;
}

export const useToast = create<ToastState>((set, get) => ({
  items: [],
  push: (text, kind = "ok") => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items.slice(-2), { id, text, kind }] }));
    setTimeout(() => get().drop(id), 3200);
  },
  drop: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  confirm: null,
  ask: (o) => new Promise<boolean>((resolve) => set({ confirm: { ...o, resolve } })),
  close: (v) => {
    get().confirm?.resolve(v);
    set({ confirm: null });
  },
}));

export const toast = (text: string, kind?: Kind) => useToast.getState().push(text, kind);
export const confirmDialog = (o: { title: string; text: string; ok: string; danger?: boolean }) => useToast.getState().ask(o);

const icons: Record<Kind, ReactNode> = {
  ok: <CheckCircle2 size={20} className="text-volt shrink-0" />,
  info: <Info size={20} className="text-violet-ink shrink-0" />,
  error: <AlertTriangle size={20} className="text-danger shrink-0" />,
};

export function ToastHost() {
  const { items, confirm, close } = useToast();
  useEffect(() => {
    const full = () => useToast.getState().push("Memoria telefonului pentru aplicație e plină. Șterge câteva poze de progres.", "error");
    window.addEventListener("sg:storage-full", full);
    return () => window.removeEventListener("sg:storage-full", full);
  }, []);
  return (
    <>
      <div className="absolute left-0 right-0 top-0 z-[70] flex flex-col items-center gap-2 px-4 pointer-events-none safe-top" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              className="pointer-events-none max-w-[400px] w-full flex items-start gap-3 rounded-2xl bg-surface-3 border border-line-strong px-4 py-3 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7)]"
            >
              {icons[t.kind]}
              <span className="text-[15px] text-text leading-snug">{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {confirm && (
          <div className="absolute inset-0 z-[80] grid place-items-center p-6">
            <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => close(false)} />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[360px] rounded-3xl bg-surface border border-line p-5"
            >
              <h2 className="font-display font-bold text-[20px] text-text">{confirm.title}</h2>
              <p className="text-[15px] text-muted mt-2 leading-relaxed">{confirm.text}</p>
              <div className="grid grid-cols-2 gap-2 mt-5">
                <Button variant="secondary" size="md" onClick={() => close(false)}>
                  Renunță
                </Button>
                <Button variant={confirm.danger ? "danger" : "primary"} size="md" onClick={() => close(true)}>
                  {confirm.ok}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
