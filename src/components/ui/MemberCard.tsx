import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Emblem } from "./Logo";
import { brand } from "../../brand";

interface Props {
  name: string;
  photo: string | null;
  initials: string;
  since: string;
  memberId: string;
  goal?: string;
}

/** Card de membru care se înclină 3D după deget / mouse. */
export function MemberCard({ name, photo, initials, since, memberId, goal }: Props) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [12, -12]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-14, 14]), { stiffness: 200, damping: 18 });
  const shineX = useTransform(px, [0, 1], ["0%", "100%"]);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div style={{ perspective: 900 }} onPointerMove={move} onPointerLeave={reset} onPointerUp={reset} className="touch-none">
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative w-full aspect-[1.6] rounded-[26px] overflow-hidden border border-white/10"
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1d2027 0%, #121418 55%, #1a1630 100%)" }} />
        <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-volt/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-20 w-56 h-56 rounded-full bg-violet/25 blur-3xl" />
        <motion.div
          className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
          style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)", backgroundSize: "250% 100%", backgroundPositionX: shineX }}
        />
        <div className="relative h-full p-5 flex flex-col justify-between" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Emblem size={28} />
              <span className="font-display font-extrabold uppercase tracking-wide text-[15px]">{brand.gymName}</span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-volt font-semibold">Membru</span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {photo ? (
                <img src={photo} alt="" className="w-14 h-14 rounded-2xl object-cover border border-white/15" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-surface-2 grid place-items-center font-display font-extrabold text-[20px] text-muted">{initials}</div>
              )}
              <div className="min-w-0">
                <div className="font-display font-extrabold text-[20px] truncate">{name}</div>
                <div className="text-[13px] text-muted truncate">{goal ? `Obiectiv: ${goal}` : `Membru din ${since}`}</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-faint uppercase tracking-wider">ID</div>
              <div className="font-mono text-[13px] tabular">{memberId}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function memberIdFrom(seed: string) {
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `SG-${(h % 900000) + 100000}`;
}
