import { motion } from "motion/react";
import { LogOut, RotateCcw, Sparkles } from "lucide-react";
import { useApp } from "../store/useApp";
import { Logo } from "../components/ui/Logo";

/** Ecran temporar: aici vine, în pasul următor, abonamentul animat. */
export function Home() {
  const { account, profile, logout, resetDemo } = useApp();
  if (!account) return null;
  return (
    <div className="h-full flex flex-col">
      <header className="safe-top px-5 pb-3 flex items-center justify-between">
        <Logo size={30} />
        <div className="flex gap-1">
          <button onClick={logout} aria-label="Ieși din cont" className="w-11 h-11 grid place-items-center rounded-full active:bg-surface-2 text-muted">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      <main className="flex-1 px-5 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mt-2">
          {profile.photo ? (
            <img src={profile.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-surface-2 grid place-items-center font-display font-extrabold text-muted">
              {account.firstName[0]}
              {account.lastName[0]}
            </div>
          )}
          <div>
            <div className="text-muted text-[14px]">Salut,</div>
            <div className="font-display font-extrabold text-[26px] leading-tight">{account.firstName}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 rounded-3xl border border-dashed border-line p-6 text-center"
        >
          <Sparkles className="mx-auto text-volt" size={28} />
          <div className="font-semibold text-[17px] mt-3">Aici apare abonamentul tău</div>
          <p className="text-muted text-[14px] mt-1">Urmează în pasul următor al aplicației.</p>
        </motion.div>

        <button onClick={resetDemo} className="mt-8 mx-auto flex items-center gap-2 text-[14px] text-faint">
          <RotateCcw size={16} /> Resetează demo-ul
        </button>
      </main>
    </div>
  );
}
