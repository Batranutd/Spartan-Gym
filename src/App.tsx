import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useApp, type OnboardingStep } from "./store/useApp";
import { Welcome } from "./screens/onboarding/Welcome";
import { Login } from "./screens/onboarding/Login";
import { Account } from "./screens/onboarding/Account";
import { Consents } from "./screens/onboarding/Consents";
import { Body } from "./screens/onboarding/Body";
import { Goals } from "./screens/onboarding/Goals";
import { Done } from "./screens/onboarding/Done";
import { Home } from "./screens/Home";

const ORDER: OnboardingStep[] = ["welcome", "login", "account", "consents", "body", "goals", "done"];

const screens: Record<OnboardingStep, () => JSX.Element | null> = {
  welcome: Welcome,
  login: Login,
  account: Account,
  consents: Consents,
  body: Body,
  goals: Goals,
  done: Done,
};

export default function App() {
  const step = useApp((s) => s.step);
  const loggedIn = useApp((s) => s.loggedIn);
  const key = loggedIn ? "home" : step;

  // direcția animației: înainte = intră din dreapta, înapoi = din stânga
  const prev = useRef(key);
  const idx = (k: string) => (k === "home" ? 99 : ORDER.indexOf(k as OnboardingStep));
  const dir = idx(key) >= idx(prev.current) ? 1 : -1;
  prev.current = key;

  const Screen = loggedIn ? Home : screens[step];

  return (
    <div className="h-full w-full flex items-center justify-center sm:p-6 bg-[radial-gradient(ellipse_at_top,#1a1d24,#0E0F12_60%)]">
      <div className="relative h-full w-full sm:h-[min(900px,100%)] sm:max-w-[430px] sm:rounded-[44px] sm:border sm:border-line overflow-hidden bg-ink sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
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
      </div>
    </div>
  );
}
