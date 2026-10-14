import { AnimatePresence, motion } from "motion/react";
import { Building2, Dumbbell, Home as HomeIcon, Salad, Trophy } from "lucide-react";
import type { ComponentType } from "react";
import { useClientNav } from "../../lib/nav";
import { Home } from "./Home";
import { Workout } from "./Workout";
import { Nutrition } from "./Nutrition";
import { Community } from "./Community";
import { GymInfo } from "./GymInfo";
import { CheckInScreen } from "./CheckIn";
import { SubscriptionScreen, PlansScreen } from "./Subscription";
import { TrainerProfile } from "./TrainerProfile";
import { ProfileScreen, EditProfile, PrivacyScreen } from "./Profile";
import { Notifications } from "./Notifications";
import { Photos } from "./Photos";
import { Feedback } from "./Feedback";

const TABS = [
  { key: "home", label: "Acasă", icon: HomeIcon, C: Home },
  { key: "workout", label: "Antrenament", icon: Dumbbell, C: Workout },
  { key: "nutrition", label: "Nutriție", icon: Salad, C: Nutrition },
  { key: "community", label: "Comunitate", icon: Trophy, C: Community },
  { key: "gym", label: "Sala", icon: Building2, C: GymInfo },
];

const ROUTES: Record<string, ComponentType<{ params?: Record<string, string> }>> = {
  checkin: CheckInScreen,
  subscription: SubscriptionScreen,
  plans: PlansScreen,
  trainer: TrainerProfile,
  profile: ProfileScreen,
  editProfile: EditProfile,
  privacy: PrivacyScreen,
  notifications: Notifications,
  photos: Photos,
  feedback: Feedback,
};

export function ClientApp() {
  const { tab, stack, dir, setTab } = useClientNav();
  const top = stack[stack.length - 1];
  const Tab = TABS.find((t) => t.key === tab)?.C ?? Home;
  const Top = top ? ROUTES[top.name] : null;

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div key={`tab-${tab}`} className="absolute inset-0 flex flex-col" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
          <Tab />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence initial={false} custom={dir}>
        {Top && (
          <motion.div
            key={`${top.name}-${stack.length}`}
            custom={dir}
            className="absolute inset-0 z-30 flex flex-col bg-ink"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <Top params={top.params} />
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="absolute bottom-0 inset-x-0 z-20 safe-bottom pt-2 px-2 bg-ink/92 backdrop-blur-xl border-t border-line" aria-label="Meniu principal">
        <div className="flex">
          {TABS.map((t) => {
            const on = t.key === tab;
            return (
              <button key={t.key} type="button" onClick={() => setTab(t.key)} aria-current={on ? "page" : undefined} className="relative flex-1 min-w-0 flex flex-col items-center gap-1 pt-1.5 pb-1">
                {on && <motion.span layoutId="client-tab" className="absolute top-0 h-[3px] w-8 rounded-full bg-volt" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
                <motion.span animate={{ y: on ? -1 : 0, scale: on ? 1.08 : 1 }} className={on ? "text-volt" : "text-faint"}>
                  <t.icon size={23} strokeWidth={on ? 2.3 : 1.9} />
                </motion.span>
                <span className={`text-[11px] leading-none truncate max-w-full px-0.5 ${on ? "text-text font-semibold" : "text-muted"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
