import { useEffect, useRef, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useStore, type OnboardingStep } from "./store/useStore";
import { Welcome } from "./screens/onboarding/Welcome";
import { Login } from "./screens/onboarding/Login";
import { Account } from "./screens/onboarding/Account";
import { Consents } from "./screens/onboarding/Consents";
import { Body } from "./screens/onboarding/Body";
import { Goals } from "./screens/onboarding/Goals";
import { Done } from "./screens/onboarding/Done";
import { Staff } from "./screens/onboarding/Staff";
import { ClientApp } from "./screens/client/ClientApp";
import { TrainerApp } from "./screens/trainer/TrainerApp";
import { AdminApp } from "./screens/admin/AdminApp";
import { ToastHost } from "./components/ui/Toast";
import { useAdminNav, useClientNav, useTrainerNav } from "./lib/nav";

const ORDER: OnboardingStep[] = ["welcome", "staff", "login", "account", "consents", "body", "goals", "done"];

const screens: Record<OnboardingStep, () => JSX.Element | null> = {
  welcome: Welcome,
  staff: Staff,
  login: Login,
  account: Account,
  consents: Consents,
  body: Body,
  goals: Goals,
  done: Done,
};

export default function App() {
  const step = useStore((s) => s.step);
  const session = useStore((s) => s.session);
  const accent = useStore((s) => s.gym.accent ?? "#D4FF3A");
  const clientOk = useStore((s) => s.clients.some((c) => c.id === s.session.clientId));
  const trainerOk = useStore((s) => s.trainers.some((t) => t.id === s.session.trainerId));

  const role = session.role === "client" && clientOk ? "client" : session.role === "trainer" && trainerOk ? "trainer" : session.role === "admin" ? "admin" : null;
  const key = role ?? step;

  // direcția animației: înainte = intră din dreapta, înapoi = din stânga
  const prev = useRef(key);
  const idx = (k: string) => (k === "client" || k === "trainer" || k === "admin" ? 99 : ORDER.indexOf(k as OnboardingStep));
  const dir = idx(key) >= idx(prev.current) ? 1 : -1;
  prev.current = key;

  // la schimbarea rolului, fiecare aplicație pornește de pe primul ecran
  useEffect(() => {
    useClientNav.getState().reset();
    useTrainerNav.getState().reset();
    useAdminNav.getState().reset();
  }, [role]);

  const Screen = role === "client" ? ClientApp : role === "trainer" ? TrainerApp : role === "admin" ? AdminApp : screens[step];
  const wide = role === "admin";
  const vars = { "--color-volt": accent, "--color-volt-soft": `${accent}1c` } as CSSProperties;

  return (
    <div style={vars} className="h-full w-full flex items-center justify-center bg-ink text-text sm:bg-[radial-gradient(ellipse_at_top,#1a1d24,#0E0F12_60%)]">
      <div
        className={`relative h-full w-full overflow-hidden bg-ink text-text ${wide ? "" : "sm:h-[min(900px,calc(100%-48px))] sm:max-w-[430px] sm:rounded-[44px] sm:border sm:border-line sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"}`}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={key}
            custom={dir}
            className="absolute inset-0"
            variants={{
              enter: (d: number) => ({ x: d > 0 ? "100%" : "-30%", opacity: d > 0 ? 1 : 0.4, zIndex: d > 0 ? 2 : 1 }),
              center: (d: number) => ({ x: 0, opacity: 1, zIndex: d > 0 ? 2 : 1 }),
              exit: (d: number) => ({ x: d > 0 ? "-30%" : "100%", opacity: d > 0 ? 0.4 : 1, zIndex: d > 0 ? 1 : 2 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
        <ToastHost />
      </div>
    </div>
  );
}
