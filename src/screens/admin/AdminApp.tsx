import { useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareText,
  Package,
  ScanLine,
  Settings,
  Trophy,
  Users,
  UserCheck,
  X,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { useAdminNav } from "../../lib/nav";
import { Emblem } from "../../components/ui/Logo";
import { AdminDashboard } from "./AdminDashboard";
import { AdminClients } from "./AdminClients";
import { AdminDesk } from "./AdminDesk";
import { AdminFinance } from "./AdminFinance";
import { AdminStock } from "./AdminStock";
import { AdminPlans } from "./AdminPlans";
import { AdminNotify } from "./AdminNotify";
import { AdminLoyalty } from "./AdminLoyalty";
import { AdminChallenges } from "./AdminChallenges";
import { AdminTrainers } from "./AdminTrainers";
import { AdminFeedback } from "./AdminFeedback";
import { AdminGym } from "./AdminGym";
import { AdminSettings } from "./AdminSettings";

export interface AdminPageProps {
  go: (key: string, param?: string) => void;
  param?: string;
}

interface Section {
  key: string;
  label: string;
  title?: string;
  icon: typeof Users;
  C: ComponentType<AdminPageProps>;
  badge?: (s: ReturnType<typeof useStore.getState>) => number;
}

const SECTIONS: Section[] = [
  { key: "dashboard", label: "Panou", icon: LayoutDashboard, C: AdminDashboard },
  { key: "desk", label: "Recepție", icon: ScanLine, C: AdminDesk, badge: (s) => s.subscriptions.filter((x) => x.status === "în așteptare").length },
  { key: "clients", label: "Clienți", icon: Users, C: AdminClients },
  { key: "finance", label: "Încasări", icon: BarChart3, C: AdminFinance },
  { key: "stock", label: "Stoc bar", icon: Package, C: AdminStock, badge: (s) => s.products.filter((p) => p.stock <= p.lowStock).length },
  { key: "plans", label: "Abonamente", icon: CreditCard, C: AdminPlans },
  { key: "notify", label: "Notificări", icon: Megaphone, C: AdminNotify },
  { key: "loyalty", label: "Fidelitate", icon: Award, C: AdminLoyalty },
  { key: "challenges", label: "Provocări", icon: Trophy, C: AdminChallenges, badge: (s) => s.challenges.reduce((a, c) => a + c.entries.filter((e) => e.status === "trimis").length, 0) },
  { key: "trainers", label: "Antrenori", icon: UserCheck, C: AdminTrainers, badge: (s) => s.trainers.filter((t) => t.status === "în așteptare").length },
  { key: "feedback", label: "Recenzii", title: "Recenzii și reclamații", icon: MessageSquareText, C: AdminFeedback, badge: (s) => s.tickets.filter((t) => t.status === "nouă").length },
  { key: "gym", label: "Sala", icon: Building2, C: AdminGym },
  { key: "settings", label: "Setări", icon: Settings, C: AdminSettings },
];

export function AdminApp() {
  const s = useStore();
  const { tab, setTab } = useAdminNav();
  const [param, setParam] = useState<string | undefined>();
  const [menu, setMenu] = useState(false);
  const cur = SECTIONS.find((x) => x.key === tab) ?? SECTIONS[0];
  const go = (key: string, p?: string) => {
    setTab(key);
    setParam(p);
    setMenu(false);
    document.getElementById("admin-main")?.scrollTo({ top: 0 });
  };

  const NavList = (
    <nav className="flex flex-col gap-0.5" aria-label="Meniu administrare">
      {SECTIONS.map((x) => {
        const on = x.key === cur.key;
        const b = x.badge?.(s) ?? 0;
        return (
          <button key={x.key} type="button" onClick={() => go(x.key)} aria-current={on ? "page" : undefined} className={`relative h-11 px-3 rounded-xl flex items-center gap-3 text-left text-[15px] ${on ? "text-ink font-semibold" : "text-text hover:bg-surface-2"}`}>
            {on && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-volt" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <x.icon size={19} className="relative shrink-0" />
            <span className="relative flex-1 min-w-0 truncate">{x.label}</span>
            {b > 0 && <span className={`relative min-w-6 h-6 px-1.5 rounded-full text-[12px] font-bold grid place-items-center ${on ? "bg-ink text-volt" : "bg-violet text-white"}`}>{b}</span>}
          </button>
        );
      })}
    </nav>
  );

  const Footer = (
    <div className="flex flex-col gap-1 pt-3 border-t border-line">
      <button type="button" onClick={() => s.logout()} className="h-11 px-3 rounded-xl flex items-center gap-3 text-[15px] text-muted hover:bg-surface-2">
        <LogOut size={19} /> Ieși din panou
      </button>
    </div>
  );

  return (
    <div className="h-full w-full flex bg-ink text-text">
      {/* Bara laterală pe ecrane mari */}
      <aside className="hidden lg:flex w-[264px] shrink-0 flex-col gap-4 border-r border-line bg-surface/40 p-4 h-full overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <Emblem size={34} />
          <div className="leading-tight min-w-0">
            <div className="font-display font-extrabold text-[17px] truncate">{s.gym.name}</div>
            <div className="text-[12px] text-muted">Panou de administrare</div>
          </div>
        </div>
        <div className="flex-1">{NavList}</div>
        {Footer}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-full">
        {/* Antet pe telefon */}
        <header className="lg:hidden safe-top px-3 pb-2 flex items-center gap-2 border-b border-line bg-ink shrink-0">
          <button type="button" onClick={() => setMenu(true)} aria-label="Deschide meniul" className="w-11 h-11 rounded-full grid place-items-center text-text">
            <Menu size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-muted truncate">{s.gym.name} · administrare</div>
            <div className="font-display font-extrabold text-[19px] leading-tight truncate">{cur.title ?? cur.label}</div>
          </div>
          <Emblem size={30} />
        </header>

        <main id="admin-main" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1180px] mx-auto px-4 lg:px-8 pt-4 lg:pt-8 pb-24">
            <h1 className="hidden lg:block font-display font-extrabold text-[30px] mb-6">{cur.title ?? cur.label}</h1>
            <AnimatePresence mode="wait">
              <motion.div key={cur.key + (param ?? "")} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <cur.C go={go} param={param} />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Meniu pe telefon */}
      <AnimatePresence>
        {menu && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="relative w-[82%] max-w-[320px] h-full bg-surface border-r border-line flex flex-col gap-4 p-4 safe-top overflow-y-auto">
              <div className="flex items-center gap-2.5">
                <Emblem size={32} />
                <div className="flex-1 min-w-0 font-display font-extrabold text-[17px] truncate">{s.gym.name}</div>
                <button type="button" onClick={() => setMenu(false)} aria-label="Închide meniul" className="w-11 h-11 rounded-full grid place-items-center text-text">
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1">{NavList}</div>
              {Footer}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Componente comune pentru panou ---------- */

export function Stat({ label, value, sub, tone = "default", onClick, icon }: { label: string; value: React.ReactNode; sub?: string; tone?: "default" | "volt" | "warn" | "danger" | "violet"; onClick?: () => void; icon?: React.ReactNode }) {
  const t = { default: "text-text", volt: "text-volt", warn: "text-warn", danger: "text-danger", violet: "text-violet-ink" }[tone];
  const Comp = onClick ? motion.button : motion.div;
  return (
    <Comp type={onClick ? "button" : undefined} whileTap={onClick ? { scale: 0.98 } : undefined} onClick={onClick} className="rounded-3xl bg-surface border border-line p-4 text-left min-w-0">
      <div className="flex items-center gap-2 text-[13px] text-muted">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={`font-display font-extrabold text-[28px] leading-tight mt-1.5 tabular ${t}`}>{value}</div>
      {sub && <div className="text-[13px] text-muted mt-0.5 truncate">{sub}</div>}
    </Comp>
  );
}

export function Panel({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl bg-surface border border-line p-4 lg:p-5 min-w-0 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-display font-bold text-[18px] text-text min-w-0">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:w-[520px] h-full bg-ink border-l border-line flex flex-col"
          >
            <div className="safe-top px-4 pb-3 flex items-center gap-2 border-b border-line shrink-0">
              <h2 className="flex-1 min-w-0 font-display font-extrabold text-[20px] text-text truncate pt-2">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Închide" className="w-11 h-11 rounded-full grid place-items-center text-text mt-2">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-16">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ClipList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col divide-y divide-line">{children}</div>;
}

export { ClipboardList };
