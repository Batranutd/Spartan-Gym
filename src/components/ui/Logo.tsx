import { brand } from "../../brand";

/** Emblema Spartan Gym — coif hoplit stilizat, desenat original. */
export function Emblem({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M24 9 C26 3 38 3 40 9 L38 12 H26 Z" fill="var(--color-volt)" />
      <path
        fillRule="evenodd"
        fill="var(--color-text)"
        d="M32 10C18.5 10 11 19.5 11 32v14l13 10h4V41h8v15h4l13-10V32c0-12.5-7.5-22-21-22Z
           M17 28h11.5v3.2c0 1.6-1.2 2.8-2.8 2.8H17Z
           M47 28H35.5v3.2c0 1.6 1.2 2.8 2.8 2.8H47Z"
      />
      <path d="M30 28h4v13h-4z" fill="var(--color-text)" />
    </svg>
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Emblem size={size} />
      <div className="leading-none">
        <div className="font-display font-extrabold text-[19px] tracking-wide uppercase">{brand.shortName}</div>
        <div className="text-[11px] text-muted tracking-[0.3em] uppercase mt-0.5">Gym</div>
      </div>
    </div>
  );
}
