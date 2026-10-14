import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import { Color, type Group } from "three";
import type { MuscleGroup } from "../../data/types";

type Heat = Partial<Record<MuscleGroup, number>>;

const COLD = new Color("#343945");
const HOT = new Color("#D4FF3A");
const SKIN = new Color("#454B58");

function mat(h: number | undefined) {
  const v = Math.max(0, Math.min(1, h ?? 0));
  const c = COLD.clone().lerp(HOT, v);
  return { color: c, emissive: HOT.clone().multiplyScalar(v * 0.35), roughness: 0.55, metalness: 0.1 };
}

function Part({ pos, scale = [1, 1, 1], kind, h, rot = [0, 0, 0] }: { pos: [number, number, number]; scale?: [number, number, number]; kind: "sphere" | "capsule"; h?: number; rot?: [number, number, number] }) {
  const m = useMemo(() => (h === undefined ? { color: SKIN, roughness: 0.7, metalness: 0.05 } : mat(h)), [h]);
  return (
    <mesh position={pos} scale={scale} rotation={rot}>
      {kind === "sphere" ? <sphereGeometry args={[1, 28, 20]} /> : <capsuleGeometry args={[1, 1, 8, 20]} />}
      <meshStandardMaterial {...m} />
    </mesh>
  );
}

function Figure({ heat, drag }: { heat: Heat; drag: MutableRefObject<{ x: number; vx: number; touching: boolean }> }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const d = drag.current;
    d.x += d.vx;
    d.vx *= 0.92;
    if (!d.touching) d.x += dt * 0.35; // se rotește singur încet
    g.rotation.y = d.x;
  });
  const H = heat;
  return (
    <group ref={ref} position={[0, -0.95, 0]}>
      {/* cap și gât */}
      <Part kind="sphere" pos={[0, 1.66, 0]} scale={[0.17, 0.2, 0.18]} />
      <Part kind="capsule" pos={[0, 1.47, 0]} scale={[0.07, 0.06, 0.07]} />
      {/* trunchi de bază */}
      <Part kind="capsule" pos={[0, 1.05, 0]} scale={[0.24, 0.32, 0.15]} />
      {/* piept */}
      <Part kind="sphere" pos={[-0.12, 1.24, 0.09]} scale={[0.14, 0.11, 0.08]} h={H.Piept} />
      <Part kind="sphere" pos={[0.12, 1.24, 0.09]} scale={[0.14, 0.11, 0.08]} h={H.Piept} />
      {/* abdomen */}
      <Part kind="capsule" pos={[0, 0.94, 0.1]} scale={[0.13, 0.12, 0.06]} h={H.Abdomen} />
      {/* spate */}
      <Part kind="capsule" pos={[0, 1.13, -0.09]} scale={[0.22, 0.2, 0.08]} h={H.Spate} />
      {/* umeri */}
      <Part kind="sphere" pos={[-0.32, 1.33, 0]} scale={[0.1, 0.09, 0.1]} h={H.Umeri} />
      <Part kind="sphere" pos={[0.32, 1.33, 0]} scale={[0.1, 0.09, 0.1]} h={H.Umeri} />
      {/* brațe */}
      <Part kind="capsule" pos={[-0.37, 1.08, 0]} scale={[0.07, 0.13, 0.07]} rot={[0, 0, 0.12]} h={H["Brațe"]} />
      <Part kind="capsule" pos={[0.37, 1.08, 0]} scale={[0.07, 0.13, 0.07]} rot={[0, 0, -0.12]} h={H["Brațe"]} />
      <Part kind="capsule" pos={[-0.42, 0.78, 0.02]} scale={[0.055, 0.12, 0.055]} rot={[0, 0, 0.08]} />
      <Part kind="capsule" pos={[0.42, 0.78, 0.02]} scale={[0.055, 0.12, 0.055]} rot={[0, 0, -0.08]} />
      {/* bazin și fesieri */}
      <Part kind="sphere" pos={[0, 0.66, 0]} scale={[0.22, 0.12, 0.14]} />
      <Part kind="sphere" pos={[-0.1, 0.62, -0.08]} scale={[0.12, 0.11, 0.09]} h={H.Fesieri} />
      <Part kind="sphere" pos={[0.1, 0.62, -0.08]} scale={[0.12, 0.11, 0.09]} h={H.Fesieri} />
      {/* picioare */}
      <Part kind="capsule" pos={[-0.12, 0.33, 0.01]} scale={[0.1, 0.17, 0.1]} h={H.Picioare} />
      <Part kind="capsule" pos={[0.12, 0.33, 0.01]} scale={[0.1, 0.17, 0.1]} h={H.Picioare} />
      <Part kind="capsule" pos={[-0.12, -0.05, -0.01]} scale={[0.07, 0.15, 0.07]} h={H.Picioare !== undefined ? H.Picioare * 0.7 : undefined} />
      <Part kind="capsule" pos={[0.12, -0.05, -0.01]} scale={[0.07, 0.15, 0.07]} h={H.Picioare !== undefined ? H.Picioare * 0.7 : undefined} />
    </group>
  );
}

export default function Body3D({ heat }: { heat: Heat }) {
  const drag = useRef({ x: 0.5, vx: 0, touching: false });
  const last = useRef<number | null>(null);
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.15, 3.1], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => {
        last.current = e.clientX;
        drag.current.touching = true;
      }}
      onPointerMove={(e) => {
        if (last.current === null) return;
        drag.current.vx = (e.clientX - last.current) * 0.008;
        last.current = e.clientX;
      }}
      onPointerUp={() => {
        last.current = null;
        drag.current.touching = false;
      }}
      onPointerLeave={() => {
        last.current = null;
        drag.current.touching = false;
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={1.5} />
      <directionalLight position={[-3, 1, -3]} intensity={0.7} color="#7C5CFF" />
      <Figure heat={heat} drag={drag} />
    </Canvas>
  );
}
