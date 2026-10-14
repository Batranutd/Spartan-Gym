import { useMemo } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { MemberCard } from "../../components/ui/MemberCard";
import { useStore } from "../../store/useStore";

const COLORS = ["#D4FF3A", "#7C5CFF", "#F2F3F5", "#D4FF3A"];

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const a = (i / 34) * Math.PI * 2 + Math.random() * 0.3;
        const d = 120 + Math.random() * 140;
        return { x: Math.cos(a) * d, y: Math.sin(a) * d - 40, r: Math.random() * 540 - 270, c: COLORS[i % 4], w: 6 + Math.random() * 6, delay: Math.random() * 0.15 };
      }),
    [],
  );
  return (
    <div className="absolute left-1/2 top-[22%] pointer-events-none" aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-[2px]"
          style={{ width: b.w, height: b.w * 0.45, background: b.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 220], opacity: [1, 1, 0], rotate: b.r, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.35 + b.delay, ease: [0.2, 0.8, 0.4, 1] }}
        />
      ))}
    </div>
  );
}

export function Done() {
  const id = useStore((s) => s.newClientId);
  const account = useStore((s) => s.clients.find((c) => c.id === s.newClientId));
  const gymName = useStore((s) => s.gym.name);
  const enterAs = useStore((s) => s.enterAs);
  if (!account) return null;
  const profile = account;
  const login = () => enterAs("client", id);
  const since = new Date(account.createdAt).toLocaleDateString("ro-RO", { month: "long", year: "numeric" });

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <Confetti />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 safe-top">
        <div className="flex justify-center mt-8">
          <motion.div
            className="w-20 h-20 rounded-full bg-volt grid place-items-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0E0F12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.35 }} />
            </svg>
          </motion.div>
        </div>

        <motion.h1
          className="font-display font-extrabold text-[30px] leading-tight text-center mt-6 text-text"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          Bun venit, {account.firstName}!
        </motion.h1>
        <motion.p className="text-muted text-center text-[16px] mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          Contul tău la {gymName} e gata. Ai primit și primele puncte.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 40, rotateX: 30 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <MemberCard
            name={`${account.firstName} ${account.lastName}`}
            photo={profile.photo}
            initials={`${account.firstName[0]}${account.lastName[0]}`.toUpperCase()}
            since={since}
            memberId={account.memberId}
            goal={profile.goals[0]}
          />
          <p className="text-center text-[13px] text-faint mt-3">Mișcă degetul pe card</p>
        </motion.div>

        <motion.div className="grid grid-cols-3 gap-2 mt-6" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          {[
            { k: "Vârstă", v: `${profile.age}`, u: "ani" },
            { k: "Înălțime", v: `${profile.heightCm}`, u: "cm" },
            { k: "Greutate", v: `${profile.weightKg?.toString().replace(".", ",")}`, u: "kg" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl bg-surface border border-line p-3 text-center">
              <div className="text-[12px] text-muted">{s.k}</div>
              <div className="font-display font-extrabold text-[22px] tabular">
                {s.v}
                <span className="text-[13px] text-muted font-sans font-normal ml-1">{s.u}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      <motion.div className="px-5 pt-3 safe-bottom" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
        <Button iconRight={<ArrowRight size={20} />} onClick={login}>
          Intră în aplicație
        </Button>
      </motion.div>
    </div>
  );
}
