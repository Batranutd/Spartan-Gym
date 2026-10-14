/** Hash simplu pentru demo (în producție parola se verifică doar pe server). */
export async function hashPassword(pw: string): Promise<string> {
  const data = new TextEncoder().encode(`spartan:${pw}`);
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 0;
  for (const b of data) h = (h * 31 + b) | 0;
  return `fallback-${h}`;
}

/** Parola conturilor demo (clienți și antrenori generați) */
export const DEMO_PASSWORD = "demo1234";
