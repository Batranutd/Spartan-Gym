import { animate, AnimatePresence, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useStore } from "../../store/useStore";

/** Culoarea de accent a sălii (white-label) */
export const useAccent = () => useStore((s) => s.gym.accent ?? "#D4FF3A");

export const ease = [0.22, 1, 0.36, 1] as const;

/* ---------- Containere ---------- */

export function Card({ children, className = "", onClick, tone = "default" }: { children: ReactNode; className?: string; onClick?: () => void; tone?: "default" | "raised" | "volt" | "violet" }) {
  const t = {
    default: "bg-surface border border-line",
    raised: "bg-surface-2 border border-line",
    volt: "bg-volt text-ink",
    violet: "bg-violet text-white",
  }[tone];
  const cls = `rounded-3xl p-4 min-w-0 ${t} ${className}`;
  if (onClick)
    return (
      <motion.button type="button" whileTap={{ scale: 0.985 }} onClick={onClick} className={`${cls} block w-full text-left`}>
        {children}
      </motion.button>
    );
  return <div className={cls}>{children}</div>;
}

export function SectionTitle({ children, action, className = "" }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-3 mb-3 ${className}`}>
      <h2 className="font-display font-bold text-[19px] leading-tight text-text min-w-0">{children}</h2>
      {action}
    </div>
  );
}

export function LinkButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="shrink-0 text-[14px] font-semibold text-volt inline-flex items-center gap-0.5 h-9 -mr-1 px-1">
      {children}
      <ChevronRight size={16} />
    </button>
  );
}

/** Antet de ecran cu buton înapoi */
export function TopBar({ title, onBack, right, subtitle }: { title: string; onBack?: () => void; right?: ReactNode; subtitle?: string }) {
  return (
    <header className="safe-top px-4 pb-2 shrink-0 bg-ink/95 backdrop-blur-md z-10">
      <div className="flex items-center gap-2 min-h-12">
        {onBack && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} aria-label="Înapoi" className="w-11 h-11 -ml-1.5 shrink-0 rounded-full grid place-items-center text-text active:bg-surface-2">
            <ChevronLeft size={26} />
          </motion.button>
        )}
        <div className={`flex-1 min-w-0 ${onBack ? "" : "pl-1"}`}>
          <h1 className="font-display font-extrabold text-[22px] leading-tight truncate text-text">{title}</h1>
          {subtitle && <p className="text-[13px] text-muted truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

/** Zona derulabilă a unui ecran */
export function Scroll({ children, className = "", pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return <main className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar ${pad ? "px-4 pt-2 pb-28" : ""} ${className}`}>{children}</main>;
}

export function Stagger({ children, i = 0, className = "" }: { children: ReactNode; i?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.04 + i * 0.05, ease }}>
      {children}
    </motion.div>
  );
}

/* ---------- Identitate ---------- */

const AV_COLORS = [
  ["#2B2F45", "#B7A6FF"],
  ["#2A3324", "#D4FF3A"],
  ["#3A2A26", "#FFB59A"],
  ["#22333A", "#8FE3FF"],
  ["#36283A", "#F2A6FF"],
  ["#33301F", "#FFD66B"],
];
export function Avatar({ name, photo, size = 44, ring = false, id = "" }: { name: string; photo?: string | null; size?: number; ring?: boolean; id?: string }) {
  const parts = name.trim().split(/\s+/);
  const ini = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  let h = 0;
  for (const c of id || name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [bg, fg] = AV_COLORS[h % AV_COLORS.length];
  const st = { width: size, height: size };
  return (
    <span className={`shrink-0 inline-block rounded-full overflow-hidden ${ring ? "ring-2 ring-volt ring-offset-2 ring-offset-ink" : ""}`} style={st}>
      {photo ? (
        <img src={photo} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="w-full h-full grid place-items-center font-display font-extrabold" style={{ background: bg, color: fg, fontSize: size * 0.36 }}>
          {ini}
        </span>
      )}
    </span>
  );
}

type Tone = "neutral" | "volt" | "violet" | "ok" | "warn" | "danger";
const toneCls: Record<Tone, string> = {
  neutral: "bg-surface-3 text-muted",
  volt: "bg-volt-soft text-volt",
  violet: "bg-violet-soft text-violet-ink",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
};
export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={`inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${toneCls[tone]} ${className}`}>{children}</span>;
}

/* ---------- Comenzi ---------- */

export function Segmented<T extends string>({ value, onChange, options, className = "" }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  const id = useId();
  return (
    <div role="tablist" className={`flex p-1 rounded-2xl bg-surface border border-line ${className}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} role="tab" aria-selected={on} type="button" onClick={() => onChange(o.value)} className={`relative flex-1 min-w-0 h-10 px-2 rounded-xl text-[14px] font-semibold transition-colors ${on ? "text-ink" : "text-muted"}`}>
            {on && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-xl bg-volt" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="relative truncate block">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ on, onChange, label, description }: { on: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="w-full flex items-center gap-3 py-3 text-left">
      <span className="flex-1 min-w-0">
        <span className="block text-[16px] text-text font-medium">{label}</span>
        {description && <span className="block text-[13px] text-muted mt-0.5 leading-snug">{description}</span>}
      </span>
      <span className={`w-[52px] h-8 rounded-full p-1 shrink-0 transition-colors ${on ? "bg-volt" : "bg-surface-3 border border-line-strong"}`}>
        <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 35 }} className={`block w-6 h-6 rounded-full ${on ? "bg-ink ml-auto" : "bg-muted"}`} />
      </span>
    </button>
  );
}

export function Stars({ value, onChange, size = 22 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex gap-1" role={onChange ? "radiogroup" : undefined} aria-label={`${value} din 5 stele`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          disabled={!onChange}
          whileTap={onChange ? { scale: 0.8 } : undefined}
          onClick={() => onChange?.(n)}
          aria-label={`${n} stele`}
          className={onChange ? "p-1" : "p-0 cursor-default"}
        >
          <Star size={size} className={n <= value ? "text-warn" : "text-line-strong"} fill={n <= value ? "currentColor" : "none"} />
        </motion.button>
      ))}
    </div>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, max = 400 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; max?: number }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[14px] text-muted mb-2 font-medium">
        {label}
      </label>
      <textarea id={id} rows={rows} maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl bg-surface-2 border border-line focus:border-volt outline-none p-4 resize-none text-text leading-relaxed" />
    </div>
  );
}

export function Select<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[14px] text-muted mb-2 font-medium">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className="w-full h-14 rounded-2xl bg-surface-2 border border-line px-4 text-text outline-none focus:border-volt">
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-2 text-text">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------- Date și grafice ---------- */

export function CountUp({ value, decimals = 0, className = "", suffix = "" }: { value: number; decimals?: number; className?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${v.toLocaleString("ro-RO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, value, { duration: 1.1, ease });
    return () => c.stop();
  }, [inView, value, mv]);
  return (
    <motion.span ref={ref} className={`tabular ${className}`}>
      {text}
    </motion.span>
  );
}

export function Ring({ pct, size = 120, stroke = 12, color = "var(--color-volt)", track = "var(--color-surface-3)", children }: { pct: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.max(0, Math.min(1, pct))) }}
          transition={{ duration: 1.3, ease, delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Bar({ pct, color = "bg-volt", className = "h-2" }: { pct: number; color?: string; className?: string }) {
  return (
    <div className={`w-full rounded-full bg-surface-3 overflow-hidden ${className}`}>
      <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(1, pct)) * 100}%` }} transition={{ duration: 0.9, ease }} />
    </div>
  );
}

/** Grafic de linie simplu, desenat la scară, cu valori pe axe */
export function LineChart({ points, height = 150, unit = "", color: colorProp }: { points: { label: string; value: number }[]; height?: number; unit?: string; color?: string }) {
  const accent = useAccent();
  const color = colorProp ?? accent;
  const gid = useId().replace(/:/g, "");
  const W = 320;
  const H = height;
  const padL = 34;
  const padB = 22;
  const padT = 14;
  if (points.length < 2) return <p className="text-[14px] text-muted py-6 text-center">Adaugă cel puțin două valori ca să vezi graficul.</p>;
  const vals = points.map((p) => p.value);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (max - min < 1) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  min -= span * 0.15;
  max += span * 0.15;
  const x = (i: number) => padL + (i / (points.length - 1)) * (W - padL - 8);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${d} L${x(points.length - 1)},${H - padB} L${x(0)},${H - padB} Z`;
  const ticks = [min + (max - min) * 0.15, (min + max) / 2, max - (max - min) * 0.15];
  const last = points[points.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Grafic, ultima valoare ${last.value} ${unit}`}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="#2D313A" strokeDasharray="3 4" />
          <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#B0B6C1">
            {t.toFixed(span < 10 ? 1 : 0).replace(".", ",")}
          </text>
        </g>
      ))}
      <motion.path d={area} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease }} />
      <circle cx={x(points.length - 1)} cy={y(last.value)} r="5" fill={color} stroke="#0E0F12" strokeWidth="2" />
      {points.map((p, i) =>
        i === 0 || i === points.length - 1 || (points.length > 6 && i === Math.floor(points.length / 2)) ? (
          <text key={i} x={x(i)} y={H - 5} textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"} fontSize="11" fill="#B0B6C1">
            {p.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

/** Coloane verticale, cu etichete sub fiecare coloană */
export function Columns({ data, height = 140, color: colorProp, highlightLast = true, format = (v: number) => String(v) }: { data: { label: string; value: number }[]; height?: number; color?: string; highlightLast?: boolean; format?: (v: number) => string }) {
  const accent = useAccent();
  const color = colorProp ?? accent;
  const max = Math.max(1, ...data.map((d) => d.value));
  const dense = data.length > 12;
  const every = Math.ceil(data.length / 7);
  return (
    <div className="w-full">
      <div className={`flex items-end ${dense ? "gap-0.5" : "gap-1.5"}`} style={{ height }}>
        {data.map((d, i) => {
          const last = highlightLast && i === data.length - 1;
          return (
            <div key={i} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-1">
              {last && <span className={`text-[11px] font-semibold text-text tabular whitespace-nowrap ${dense ? "self-end" : ""}`}>{format(d.value)}</span>}
              <motion.div
                className="w-full rounded-t-md"
                style={{ background: last ? color : `${color}55` }}
                initial={{ height: 0 }}
                animate={{ height: `${(d.value / max) * (last ? 82 : 92)}%` }}
                transition={{ duration: 0.8, delay: i * 0.03, ease }}
                title={`${d.label}: ${format(d.value)}`}
              />
            </div>
          );
        })}
      </div>
      <div className={`flex mt-1.5 ${dense ? "gap-0.5" : "gap-1.5"}`}>
        {data.map((d, i) => (
          <span key={i} className="flex-1 min-w-0 text-center text-[11px] text-muted whitespace-nowrap overflow-visible">
            {!dense || i % every === 0 || i === data.length - 1 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Stări ---------- */

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line-strong px-5 py-7 text-center">
      <div className="w-12 h-12 rounded-2xl bg-surface-2 grid place-items-center mx-auto text-volt">{icon}</div>
      <div className="font-semibold text-[16px] text-text mt-3">{title}</div>
      <p className="text-[14px] text-muted mt-1 leading-snug max-w-[34ch] mx-auto">{text}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Row({ icon, title, subtitle, right, onClick, className = "" }: { icon?: ReactNode; title: ReactNode; subtitle?: ReactNode; right?: ReactNode; onClick?: () => void; className?: string }) {
  const inner = (
    <>
      {icon}
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-text truncate">{title}</span>
        {subtitle && <span className="block text-[13px] text-muted truncate mt-0.5">{subtitle}</span>}
      </span>
      {right}
      {onClick && !right && <ChevronRight size={18} className="text-faint shrink-0" />}
    </>
  );
  const cls = `w-full flex items-center gap-3 py-3 text-left min-w-0 ${className}`;
  return onClick ? (
    <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onClick} className={cls}>
      {inner}
    </motion.button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function Divider() {
  return <div className="h-px bg-line" />;
}

/** Bifă animată */
export function CheckMark({ on }: { on: boolean }) {
  return (
    <span className={`w-7 h-7 rounded-[9px] grid place-items-center border-2 shrink-0 transition-colors ${on ? "bg-volt border-volt text-ink" : "border-line-strong"}`}>
      <AnimatePresence>
        {on && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check size={17} strokeWidth={3.2} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Un mic hook pentru „ține minte” o valoare în timpul sesiunii */
export function useLocal<T>(initial: T) {
  return useState<T>(initial);
}
