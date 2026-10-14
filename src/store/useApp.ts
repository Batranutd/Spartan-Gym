import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocationConsent = "granted" | "denied" | "skipped";

export interface Account {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
}

export interface Consents {
  termsAcceptedAt: string | null;
  gdprAcceptedAt: string | null;
  location: LocationConsent | null;
  marketing: boolean;
}

export interface Profile {
  photo: string | null; // dataURL redimensionat
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goals: string[];
  improve: string[];
  strengths: string[];
  struggles: string[];
  notes: string;
}

export type OnboardingStep = "welcome" | "login" | "account" | "consents" | "body" | "goals" | "done";

interface AppState {
  account: Account | null;
  consents: Consents;
  profile: Profile;
  step: OnboardingStep;
  loggedIn: boolean;
  createdAt: string | null;

  setStep: (s: OnboardingStep) => void;
  saveAccount: (a: Account) => void;
  saveConsents: (c: Partial<Consents>) => void;
  saveProfile: (p: Partial<Profile>) => void;
  finishOnboarding: () => void;
  login: () => void;
  logout: () => void;
  resetDemo: () => void;
}

const emptyConsents: Consents = {
  termsAcceptedAt: null,
  gdprAcceptedAt: null,
  location: null,
  marketing: false,
};

const emptyProfile: Profile = {
  photo: null,
  age: null,
  heightCm: null,
  weightKg: null,
  goals: [],
  improve: [],
  strengths: [],
  struggles: [],
  notes: "",
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      account: null,
      consents: emptyConsents,
      profile: emptyProfile,
      step: "welcome",
      loggedIn: false,
      createdAt: null,

      setStep: (step) => set({ step }),
      saveAccount: (account) => set({ account }),
      saveConsents: (c) => set((s) => ({ consents: { ...s.consents, ...c } })),
      saveProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      finishOnboarding: () => set({ step: "done", createdAt: new Date().toISOString() }),
      login: () => set({ loggedIn: true }),
      logout: () => set({ loggedIn: false, step: "welcome" }),
      resetDemo: () =>
        set({
          account: null,
          consents: emptyConsents,
          profile: emptyProfile,
          step: "welcome",
          loggedIn: false,
          createdAt: null,
        }),
    }),
    { name: "spartan-gym:v1" },
  ),
);

/** Hash simplu pentru demo (în producție parola nu stă niciodată pe telefon). */
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
