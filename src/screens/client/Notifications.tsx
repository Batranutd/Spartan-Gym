import { useEffect } from "react";
import { motion } from "motion/react";
import { BellOff, CalendarClock, Dumbbell, Megaphone, Trophy, UserRound, Zap } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Empty, Scroll, TopBar } from "../../components/ui/kit";
import { dayOf, fmtTime, relDay } from "../../lib/date";
import type { Notice } from "../../data/types";

const icon: Record<Notice["kind"], JSX.Element> = {
  abonament: <CalendarClock size={20} />,
  anunț: <Megaphone size={20} />,
  puncte: <Zap size={20} />,
  provocare: <Trophy size={20} />,
  antrenor: <UserRound size={20} />,
  sală: <Dumbbell size={20} />,
};

export function Notifications() {
  const me = useMe();
  const nav = useClientNav();
  const notices = useStore((s) => s.notices);
  const markRead = useStore((s) => s.markRead);
  const mine = notices.filter((n) => n.to === me.id || n.to === "toți").sort((a, b) => b.at.localeCompare(a.at));
  const unreadIds = mine.filter((n) => !n.readBy.includes(me.id)).map((n) => n.id);

  useEffect(() => {
    if (!unreadIds.length) return;
    const t = setTimeout(() => markRead(unreadIds, me.id), 1200);
    return () => clearTimeout(t);
  }, [unreadIds.join(), me.id, markRead]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TopBar title="Notificări" onBack={nav.pop} />
      <Scroll>
        {mine.length ? (
          <div className="flex flex-col gap-2">
            {mine.map((n, i) => {
              const unread = !n.readBy.includes(me.id);
              return (
                <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`flex gap-3 rounded-2xl p-3.5 border ${unread ? "bg-surface-2 border-volt/40" : "bg-surface border-line"}`}>
                  <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${unread ? "bg-volt text-ink" : "bg-surface-3 text-muted"}`}>{icon[n.kind]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="flex-1 font-semibold text-[15px] text-text leading-snug">{n.title}</span>
                      <span className="text-[12px] text-muted shrink-0 tabular">
                        {relDay(dayOf(n.at))}, {fmtTime(n.at)}
                      </span>
                    </div>
                    <p className="text-[14px] text-muted mt-0.5 leading-snug">{n.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Empty icon={<BellOff size={22} />} title="Nimic nou" text="Aici primești anunțurile sălii, confirmările și punctele câștigate." />
        )}
      </Scroll>
    </>
  );
}
