import { lazy, Suspense, useMemo } from "react";
import { motion } from "motion/react";
import { Emblem } from "../ui/Logo";

const Dumbbell3D = lazy(() => import("./Dumbbell3D"));

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Ganteră 3D care se poate roti cu degetul; pe telefoanele fără WebGL apare emblema animată. */
export function Hero3D() {
  const webgl = useMemo(hasWebGL, []);
  const fallback = (
    <div className="w-full h-full grid place-items-center">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <Emblem size={120} />
      </motion.div>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 w-[70%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,255,58,0.22) 0%, rgba(124,92,255,0.10) 45%, transparent 70%)" }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {webgl ? <Suspense fallback={fallback}>{<Dumbbell3D />}</Suspense> : fallback}
    </div>
  );
}
