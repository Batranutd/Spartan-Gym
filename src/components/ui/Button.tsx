import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "violet" | "outline";
type Size = "lg" | "md" | "sm";

interface Props extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  full?: boolean;
}

// Fiecare variantă are culoarea textului setată explicit, verificată la contrast.
const styles: Record<Variant, string> = {
  primary: "bg-volt text-ink font-semibold",
  secondary: "bg-surface-2 text-text border border-line font-medium",
  outline: "bg-transparent text-text border border-line-strong font-medium",
  ghost: "bg-transparent text-muted font-medium",
  danger: "bg-danger-soft text-danger border border-danger/30 font-semibold",
  violet: "bg-violet text-white font-semibold",
};
const sizes: Record<Size, string> = {
  lg: "h-14 rounded-2xl text-[17px] gap-2",
  md: "h-12 rounded-xl text-[15px] gap-2",
  sm: "h-10 rounded-xl text-[14px] gap-1.5",
};
const pads: Record<Size, string> = { lg: "px-6", md: "px-5", sm: "px-3.5" };
const square: Record<Size, string> = { lg: "w-14", md: "w-12", sm: "w-10" };

export function Button({ variant = "primary", size = "lg", icon, iconRight, children, full = true, className = "", ...rest }: Props) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`${children == null ? `${square[size]} shrink-0 px-0` : `${full ? "w-full" : ""} ${pads[size]}`} inline-flex items-center justify-center whitespace-nowrap select-none outline-none focus-visible:ring-2 focus-visible:ring-volt/60 disabled:opacity-50 [&_svg]:shrink-0 ${sizes[size]} ${styles[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children != null && <span className="truncate">{children}</span>}
      {iconRight}
    </motion.button>
  );
}

/** Buton rotund doar cu iconiță (are mereu etichetă pentru cititoarele de ecran) */
export function IconButton({ label, children, className = "", tone = "plain", ...rest }: Omit<HTMLMotionProps<"button">, "children"> & { label: string; children: ReactNode; tone?: "plain" | "filled" }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      title={label}
      className={`w-11 h-11 shrink-0 rounded-full grid place-items-center text-text ${tone === "filled" ? "bg-surface-2 border border-line" : "active:bg-surface-2"} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
