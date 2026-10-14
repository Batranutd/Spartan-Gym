export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Acceptă 07xx xxx xxx, +40 7xx xxx xxx, 0040... Returnează formatul +407xxxxxxxx sau null. */
export function normalizePhone(v: string): string | null {
  const d = v.replace(/[^\d+]/g, "");
  const m = d.match(/^(?:\+40|0040|0)?(7\d{8})$/);
  return m ? `+40${m[1]}` : null;
}

export function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 10);
  return d.replace(/^(\d{4})(\d{0,3})(\d{0,3}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
}

export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/\d/.test(pw) && /[a-zA-ZăâîșțĂÂÎȘȚ]/.test(pw)) s++;
  if (pw.length >= 12 || /[^a-zA-Z0-9]/.test(pw)) s++;
  const labels = ["Prea scurtă", "Slabă", "Bună", "Puternică"];
  return { score: s as 0 | 1 | 2 | 3, label: labels[s] };
}

export const isName = (v: string) => /^[\p{L}][\p{L}\s'.-]{1,39}$/u.test(v.trim());
