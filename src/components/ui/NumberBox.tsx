import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

/** Câmp numeric compact cu − / +, pentru serii (kg, repetări) */
export function NumberBox({ value, onChange, step = 1, min = 0, max = 999, label, unit }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; label: string; unit?: string }) {
  const [txt, setTxt] = useState(String(value).replace(".", ","));
  useEffect(() => setTxt(String(value).replace(".", ",")), [value]);
  const clamp = (v: number) => Math.min(max, Math.max(min, +v.toFixed(2)));
  return (
    <div className="flex items-center h-11 rounded-xl bg-surface-2 border border-line min-w-0">
      <button type="button" aria-label={`Scade ${label}`} onClick={() => onChange(clamp(value - step))} className="w-9 h-full grid place-items-center text-muted shrink-0 active:text-text">
        <Minus size={16} />
      </button>
      <div className="flex-1 min-w-0 flex items-baseline justify-center gap-0.5">
        <input
          aria-label={label}
          inputMode="decimal"
          value={txt}
          onChange={(e) => {
            const t = e.target.value.replace(/[^\d.,]/g, "").slice(0, 5);
            setTxt(t);
            const n = parseFloat(t.replace(",", "."));
            if (!Number.isNaN(n)) onChange(clamp(n));
          }}
          className="w-full min-w-0 bg-transparent text-center text-[16px] font-semibold text-text outline-none tabular"
        />
        {unit && <span className="text-[11px] text-muted shrink-0 -ml-1 pr-0.5">{unit}</span>}
      </div>
      <button type="button" aria-label={`Crește ${label}`} onClick={() => onChange(clamp(value + step))} className="w-9 h-full grid place-items-center text-muted shrink-0 active:text-text">
        <Plus size={16} />
      </button>
    </div>
  );
}
