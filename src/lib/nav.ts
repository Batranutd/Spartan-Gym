import { create } from "zustand";

export interface Route {
  name: string;
  params?: Record<string, string>;
}

interface Nav {
  tab: string;
  stack: Route[];
  dir: 1 | -1;
  setTab: (t: string) => void;
  push: (name: string, params?: Record<string, string>) => void;
  pop: () => void;
  reset: () => void;
}

/** Navigare simplă: un tab activ + o stivă de ecrane deschise peste el */
export function createNav(defaultTab: string) {
  return create<Nav>((set) => ({
    tab: defaultTab,
    stack: [],
    dir: 1,
    setTab: (tab) => set({ tab, stack: [], dir: 1 }),
    push: (name, params) => set((s) => ({ stack: [...s.stack, { name, params }], dir: 1 })),
    pop: () => set((s) => ({ stack: s.stack.slice(0, -1), dir: -1 })),
    reset: () => set({ tab: defaultTab, stack: [], dir: 1 }),
  }));
}

export const useClientNav = createNav("home");
export const useTrainerNav = createNav("today");
export const useAdminNav = createNav("dashboard");
