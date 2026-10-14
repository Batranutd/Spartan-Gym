import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
  full?: boolean;
}

const styles: Record<Variant, string> = {
  primary: "bg-volt text-ink font-semibold",
  secondary: "bg-surface-2 text-text border border-line font-medium",
  ghost: "bg-transparent text-muted font-medium",
};

export function Button({ variant = "primary", icon, iconRight, children, full = true, className = "", ...rest }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`${full ? "w-full" : ""} h-14 px-6 rounded-2xl inline-flex items-center justify-center gap-2 text-[17px] outline-none focus-visible:ring-2 focus-visible:ring-volt/60 ${styles[variant]} ${className}`}
      {...rest}
    >
      {icon}
      <span>{children}</span>
      {iconRight}
    </motion.button>
  );
}
