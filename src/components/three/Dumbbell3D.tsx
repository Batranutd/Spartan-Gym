import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import type { Group } from "three";

const VOLT = "#D4FF3A";

function Plate({ x, r, w, color }: { x: number; r: number; w: number; color: string }) {
  return (
    <group position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[r, r, w, 48]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.035, 12, 48]} />
        <meshStandardMaterial color="#2a2e37" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Dumbbell({ drag }: { drag: MutableRefObject<{ x: number; vx: number }> }) {
  const ref = useRef<Group>(null);
  const plates = useRef<(Group | null)[]>([]);
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const d = drag.current;
    const t = state.clock.elapsedTime;
    d.x += d.vx; // tragerea cu degetul rotește gantera
    d.vx *= 0.9; // inerție
    d.x *= 1 - Math.min(1, dt * 1.6); // revine încet în poziția de prezentare
    // se legănă ușor, fără să ajungă vreodată cu capătul spre cameră
    g.rotation.y = Math.sin(t * 0.55) * 0.55 + d.x;
    g.rotation.x = 0.28 + Math.sin(t * 0.8) * 0.06;
    g.rotation.z = -0.22 + Math.sin(t * 0.45) * 0.06;
    g.position.y = Math.sin(t * 1.2) * 0.08;
    plates.current.forEach((p) => p && (p.rotation.x += dt * 0.9));
  });

  return (
    <group ref={ref} rotation={[0.28, 0, -0.22]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 2.6, 24]} />
        <meshStandardMaterial color="#c9ccd3" metalness={0.9} roughness={0.25} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} ref={(el) => (plates.current[s > 0 ? 1 : 0] = el)}>
          <Plate x={s * 0.62} r={0.62} w={0.18} color="#1d2027" />
          <Plate x={s * 0.82} r={0.52} w={0.16} color={VOLT} />
          <Plate x={s * 0.98} r={0.4} w={0.12} color="#1d2027" />
          <mesh position={[s * 1.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.12, 24]} />
            <meshStandardMaterial color="#c9ccd3" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Dumbbell3D() {
  const drag = useRef({ x: 0, vx: 0 });
  const last = useRef<number | null>(null);
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5.2], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => (last.current = e.clientX)}
      onPointerMove={(e) => {
        if (last.current === null) return;
        drag.current.vx = (e.clientX - last.current) * 0.006;
        last.current = e.clientX;
      }}
      onPointerUp={() => (last.current = null)}
      onPointerLeave={() => (last.current = null)}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <pointLight position={[-3, -1, 2]} intensity={14} color={VOLT} distance={8} />
      <pointLight position={[3, -2, -2]} intensity={10} color="#7C5CFF" distance={8} />
      <Dumbbell drag={drag} />
    </Canvas>
  );
}
