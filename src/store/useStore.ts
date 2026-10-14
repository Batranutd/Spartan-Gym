import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  Availability,
  Booking,
  Challenge,
  Client,
  ExerciseLog,
  FoodEntry,
  FoodItem,
  Machine,
  MuscleGroup,
  Notice,
  PayMethod,
  Plan,
  PointRules,
  Product,
  ProgressPhoto,
  Reward,
  Role,
  SaleItem,
  Session,
  Trainer,
  Visibility,
  Gym,
} from "../data/types";
import { buildSeed, DEFAULT_WEEK_PLAN, makeWorkout, type SeedData } from "../data/seed";
import { addDays, dayOf, nowIso, startOfWeek, today, weekday } from "../lib/date";
import { memberIdFrom, redeemCode, rng, uid } from "../lib/id";
import { FOODS, macrosFor } from "../lib/nutrition";

export interface TrainerNote {
  id: string;
  trainerId: string;
  clientId: string;
  text: string;
  at: string;
}

export type OnboardingStep = "welcome" | "login" | "account" | "consents" | "body" | "goals" | "done" | "staff";

export interface Draft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  termsAcceptedAt: string | null;
  gdprAcceptedAt: string | null;
  location: Client["location"];
  marketing: boolean;
  photo: string | null;
  sex: Client["sex"];
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goals: string[];
  improve: string[];
  strengths: string[];
  struggles: string[];
  notes: string;
}

const emptyDraft: Draft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  passwordHash: "",
  termsAcceptedAt: null,
  gdprAcceptedAt: null,
  location: null,
  marketing: false,
  photo: null,
  sex: null,
  age: null,
  heightCm: null,
  weightKg: null,
  goals: [],
  improve: [],
  strengths: [],
  struggles: [],
  notes: "",
};

interface State extends SeedData {
  session: Session;
  step: OnboardingStep;
  draft: Draft;
  customFoods: FoodItem[];
  photos: ProgressPhoto[];
  trainerNotes: TrainerNote[];
  newClientId: string | null; // contul creat chiar acum (pentru ecranul de final)
}

export interface CheckInResult {
  ok: boolean;
  message: string;
  points?: number;
}

interface Actions {
  // onboarding și sesiune
  setStep: (s: OnboardingStep) => void;
  setDraft: (p: Partial<Draft>) => void;
  finishOnboarding: () => string;
  enterAs: (role: Role, id?: string | null) => void;
  logout: () => void;
  resetAll: () => void;

  // client
  updateClient: (id: string, p: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  buyPlan: (clientId: string, planId: string, how: "card-app" | "recepție", discountPct?: number) => void;
  confirmPending: (subId: string, method: PayMethod) => void;
  checkIn: (clientId: string, via: "qr" | "recepție" | "locație") => CheckInResult;
  setWeekPlan: (clientId: string, day: number, groups: MuscleGroup[]) => void;
  ensureLog: (clientId: string, date: string) => string;
  setLogGroups: (logId: string, groups: MuscleGroup[]) => void;
  addExercise: (logId: string, ex: Omit<ExerciseLog, "id">) => void;
  removeExercise: (logId: string, exId: string) => void;
  setSet: (logId: string, exId: string, idx: number, patch: Partial<{ kg: number; reps: number }>) => void;
  addSet: (logId: string, exId: string) => void;
  removeSet: (logId: string, exId: string, idx: number) => void;
  setLogDone: (logId: string, done: boolean) => void;
  addWeight: (clientId: string, kg: number) => void;
  addPhoto: (clientId: string, img: string, caption: string) => void;
  updatePhoto: (id: string, visibility: Visibility, allowed: string[]) => void;
  deletePhoto: (id: string) => void;
  addFood: (e: Omit<FoodEntry, "id">) => void;
  removeFood: (id: string) => void;
  saveCustomFood: (f: FoodItem) => void;
  addReview: (clientId: string, stars: number, text: string, target: string) => void;
  addTicket: (clientId: string, kind: "reclamație" | "propunere", subject: string, text: string) => void;
  joinChallenge: (chId: string, clientId: string) => void;
  submitChallenge: (chId: string, clientId: string, value: number) => void;
  redeem: (clientId: string, rewardId: string) => string | null;
  requestBooking: (b: Omit<Booking, "id" | "status">) => void;
  setTrainerAccess: (clientId: string, trainerId: string, on: boolean) => void;
  markRead: (noticeIds: string[], clientId: string) => void;
  fillDemoHistory: (clientId: string) => void;

  // admin
  addSale: (items: SaleItem[], method: PayMethod, clientId?: string) => void;
  sellPlanAtDesk: (clientId: string, planId: string, method: PayMethod) => void;
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  restock: (id: string, qty: number) => void;
  upsertPlan: (p: Plan) => void;
  sendNotice: (n: Omit<Notice, "id" | "at" | "readBy">) => void;
  sendExpiryReminders: () => number;
  addPoints: (clientId: string, delta: number, reason: string) => void;
  setPointRules: (r: Partial<PointRules>) => void;
  upsertReward: (r: Reward) => void;
  useRedemption: (id: string) => void;
  upsertChallenge: (c: Challenge) => void;
  validateEntry: (chId: string, clientId: string, ok: boolean, by: string) => void;
  setTrainerStatus: (id: string, status: Trainer["status"]) => void;
  replyReview: (id: string, reply: string) => void;
  updateTicket: (id: string, status: "nouă" | "în lucru" | "rezolvată", reply?: string) => void;
  updateGym: (p: Partial<Gym>) => void;
  upsertMachine: (m: Machine) => void;
  deleteMachine: (id: string) => void;

  // antrenor
  registerTrainer: (t: Omit<Trainer, "id" | "status" | "createdAt">) => string;
  updateTrainer: (id: string, p: Partial<Trainer>) => void;
  setAvailability: (id: string, a: Availability[]) => void;
  setBookingStatus: (id: string, status: Booking["status"]) => void;
  addTrainerNote: (trainerId: string, clientId: string, text: string) => void;
}

export type Store = State & Actions;

const fresh = (): State => ({
  ...buildSeed(),
  session: { role: null, clientId: null, trainerId: null },
  step: "welcome",
  draft: emptyDraft,
  customFoods: [],
  photos: [],
  trainerNotes: [],
  newClientId: null,
});

// localStorage protejat: în unele browsere (fereastră privată) poate lipsi sau poate fi plin
const safeStorage = createJSONStorage(() => ({
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      window.dispatchEvent(new CustomEvent("sg:storage-full"));
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* nimic */
    }
  },
}));

export const pointsOf = (s: Pick<State, "points">, clientId: string) => s.points.filter((p) => p.clientId === clientId).reduce((a, p) => a + p.delta, 0);

export const useStore = create<Store>()(
  persist(
    immer((set, get) => ({
      ...fresh(),

      setStep: (step) => set({ step }),
      setDraft: (p) =>
        set((s) => {
          Object.assign(s.draft, p);
        }),

      finishOnboarding: () => {
        const d = get().draft;
        const id = uid("c-");
        set((s) => {
          const existing = s.clients.find((c) => c.email === d.email);
          if (existing) s.clients = s.clients.filter((c) => c.id !== existing.id);
          s.clients.push({
            id,
            memberId: memberIdFrom(d.email),
            firstName: d.firstName,
            lastName: d.lastName,
            email: d.email,
            phone: d.phone,
            passwordHash: d.passwordHash,
            photo: d.photo,
            sex: d.sex,
            age: d.age,
            heightCm: d.heightCm,
            weightKg: d.weightKg,
            goals: d.goals,
            improve: d.improve,
            strengths: d.strengths,
            struggles: d.struggles,
            notes: d.notes,
            createdAt: nowIso(),
            termsAcceptedAt: d.termsAcceptedAt,
            gdprAcceptedAt: d.gdprAcceptedAt,
            location: d.location,
            marketing: d.marketing,
            trainerAccess: [],
            leaderboardOptIn: true,
            weekPlan: DEFAULT_WEEK_PLAN,
          });
          if (d.weightKg) s.weights.push({ id: uid("wg-"), clientId: id, date: today(), kg: d.weightKg });
          s.points.push({ id: uid("pt-"), clientId: id, at: nowIso(), delta: s.pointRules.profileComplete, reason: "Profil completat" });
          s.notices.push({
            id: uid("n-"),
            to: id,
            title: `Bun venit la ${s.gym.name}!`,
            body: `Ai primit ${s.pointRules.profileComplete} de puncte pentru profilul completat. Alege un abonament ca să poți face check-in.`,
            at: nowIso(),
            kind: "puncte",
            readBy: [],
          });
          s.newClientId = id;
          s.step = "done";
        });
        return id;
      },

      enterAs: (role, id = null) =>
        set((s) => {
          s.session = { role, clientId: role === "client" ? id : null, trainerId: role === "trainer" ? id : null };
        }),
      logout: () =>
        set((s) => {
          s.session = { role: null, clientId: null, trainerId: null };
          s.step = "welcome";
          s.draft = emptyDraft;
        }),
      resetAll: () => set(() => fresh()),

      updateClient: (id, p) =>
        set((s) => {
          const c = s.clients.find((x) => x.id === id);
          if (c) Object.assign(c, p);
        }),
      deleteClient: (id) =>
        set((s) => {
          s.clients = s.clients.filter((c) => c.id !== id);
          s.checkIns = s.checkIns.filter((x) => x.clientId !== id);
          s.workouts = s.workouts.filter((x) => x.clientId !== id);
          s.weights = s.weights.filter((x) => x.clientId !== id);
          s.foods = s.foods.filter((x) => x.clientId !== id);
          s.photos = s.photos.filter((x) => x.clientId !== id);
          s.points = s.points.filter((x) => x.clientId !== id);
          s.bookings = s.bookings.filter((x) => x.clientId !== id);
          s.trainerNotes = s.trainerNotes.filter((x) => x.clientId !== id);
          s.reviews = s.reviews.filter((x) => x.clientId !== id);
          s.tickets = s.tickets.filter((x) => x.clientId !== id);
          s.challenges.forEach((c) => (c.entries = c.entries.filter((e) => e.clientId !== id)));
          // abonamentele și vânzările rămân, anonimizate, pentru evidența fiscală
          s.subscriptions.forEach((x) => x.clientId === id && (x.clientId = "șters"));
          s.sales.forEach((x) => x.clientId === id && (x.clientId = undefined));
          if (s.session.clientId === id) s.session = { role: null, clientId: null, trainerId: null };
        }),

      buyPlan: (clientId, planId, how, discountPct = 0) =>
        set((s) => {
          const plan = s.plans.find((p) => p.id === planId)!;
          const current = s.subscriptions
            .filter((x) => x.clientId === clientId && x.status === "activ" && x.end >= today())
            .sort((a, b) => b.end.localeCompare(a.end))[0];
          const start = current ? addDays(current.end, 1) : today();
          const price = Math.round(plan.price * (1 - discountPct / 100));
          const sub = {
            id: uid("s-"),
            clientId,
            planId,
            start,
            end: addDays(start, plan.durationDays - 1),
            pricePaid: price,
            method: (how === "card-app" ? "card-app" : "cash") as PayMethod,
            status: (how === "card-app" ? "activ" : "în așteptare") as "activ" | "în așteptare",
            createdAt: nowIso(),
          };
          s.subscriptions.push(sub);
          if (how === "card-app") {
            s.sales.push({ id: uid("sa-"), at: nowIso(), items: [{ kind: "plan", refId: plan.id, name: `Abonament ${plan.name}`, qty: 1, unitPrice: price }], total: price, method: "card-app", clientId });
            s.notices.push({ id: uid("n-"), to: clientId, title: "Plată confirmată", body: `Abonamentul ${plan.name} e activ până pe ${sub.end.split("-").reverse().join(".")}.`, at: nowIso(), kind: "abonament", readBy: [] });
          }
        }),
      confirmPending: (subId, method) =>
        set((s) => {
          const sub = s.subscriptions.find((x) => x.id === subId);
          if (!sub) return;
          const plan = s.plans.find((p) => p.id === sub.planId)!;
          const current = s.subscriptions
            .filter((x) => x.clientId === sub.clientId && x.status === "activ" && x.end >= today() && x.id !== sub.id)
            .sort((a, b) => b.end.localeCompare(a.end))[0];
          sub.start = current ? addDays(current.end, 1) : today();
          sub.end = addDays(sub.start, plan.durationDays - 1);
          sub.status = "activ";
          sub.method = method;
          s.sales.push({ id: uid("sa-"), at: nowIso(), items: [{ kind: "plan", refId: plan.id, name: `Abonament ${plan.name}`, qty: 1, unitPrice: sub.pricePaid }], total: sub.pricePaid, method, clientId: sub.clientId });
          s.notices.push({ id: uid("n-"), to: sub.clientId, title: "Abonament activat", body: `Plata a fost încasată la recepție. Abonamentul ${plan.name} e activ.`, at: nowIso(), kind: "abonament", readBy: [] });
        }),

      checkIn: (clientId, via) => {
        const s = get();
        const t = today();
        const active = s.subscriptions.find((x) => x.clientId === clientId && x.status === "activ" && x.start <= t && x.end >= t);
        if (!active) return { ok: false, message: "Nu ai un abonament activ azi." };
        if (s.checkIns.some((c) => c.clientId === clientId && dayOf(c.at) === t))
          return { ok: false, message: "Ai făcut deja check-in azi." };
        const wk = startOfWeek(t);
        const visitsThisWeek = s.checkIns.filter((c) => c.clientId === clientId && dayOf(c.at) >= wk).length + 1;
        let pts = s.pointRules.checkIn;
        set((st) => {
          st.checkIns.push({ id: uid("ci-"), clientId, at: nowIso(), via });
          st.points.push({ id: uid("pt-"), clientId, at: nowIso(), delta: st.pointRules.checkIn, reason: "Check-in la sală" });
          if (visitsThisWeek === 3) {
            st.points.push({ id: uid("pt-"), clientId, at: nowIso(), delta: st.pointRules.weekStreak, reason: "Bonus: 3 vizite săptămâna asta" });
            pts += st.pointRules.weekStreak;
          }
        });
        return { ok: true, message: visitsThisWeek === 3 ? "Bonus de constanță deblocat!" : "Spor la antrenament!", points: pts };
      },

      setWeekPlan: (clientId, day, groups) =>
        set((s) => {
          const c = s.clients.find((x) => x.id === clientId);
          if (c) c.weekPlan = { ...c.weekPlan, [day]: groups };
        }),
      ensureLog: (clientId, date) => {
        const ex = get().workouts.find((w) => w.clientId === clientId && w.date === date);
        if (ex) return ex.id;
        const c = get().clients.find((x) => x.id === clientId);
        const id = uid("w-");
        set((s) => {
          s.workouts.push({ id, clientId, date, groups: c?.weekPlan[weekday(date)] ?? [], exercises: [], done: false });
        });
        return id;
      },
      setLogGroups: (logId, groups) =>
        set((s) => {
          const w = s.workouts.find((x) => x.id === logId);
          if (w) w.groups = groups;
        }),
      addExercise: (logId, ex) =>
        set((s) => {
          const w = s.workouts.find((x) => x.id === logId);
          if (w) w.exercises.push({ ...ex, id: uid("e-") });
        }),
      removeExercise: (logId, exId) =>
        set((s) => {
          const w = s.workouts.find((x) => x.id === logId);
          if (w) w.exercises = w.exercises.filter((e) => e.id !== exId);
        }),
      setSet: (logId, exId, idx, patch) =>
        set((s) => {
          const e = s.workouts.find((x) => x.id === logId)?.exercises.find((x) => x.id === exId);
          if (e?.sets[idx]) Object.assign(e.sets[idx], patch);
        }),
      addSet: (logId, exId) =>
        set((s) => {
          const e = s.workouts.find((x) => x.id === logId)?.exercises.find((x) => x.id === exId);
          if (e) e.sets.push({ ...(e.sets[e.sets.length - 1] ?? { kg: 0, reps: 10 }) });
        }),
      removeSet: (logId, exId, idx) =>
        set((s) => {
          const e = s.workouts.find((x) => x.id === logId)?.exercises.find((x) => x.id === exId);
          if (e) e.sets.splice(idx, 1);
        }),
      setLogDone: (logId, done) =>
        set((s) => {
          const w = s.workouts.find((x) => x.id === logId);
          if (w) w.done = done;
        }),
      addWeight: (clientId, kg) =>
        set((s) => {
          const t = today();
          const ex = s.weights.find((w) => w.clientId === clientId && w.date === t);
          if (ex) ex.kg = kg;
          else s.weights.push({ id: uid("wg-"), clientId, date: t, kg });
          const c = s.clients.find((x) => x.id === clientId);
          if (c) c.weightKg = kg;
        }),
      addPhoto: (clientId, img, caption) =>
        set((s) => {
          s.photos.push({ id: uid("ph-"), clientId, date: today(), img, visibility: "privat", allowed: [], caption });
        }),
      updatePhoto: (id, visibility, allowed) =>
        set((s) => {
          const p = s.photos.find((x) => x.id === id);
          if (p) {
            p.visibility = visibility;
            p.allowed = allowed;
          }
        }),
      deletePhoto: (id) =>
        set((s) => {
          s.photos = s.photos.filter((x) => x.id !== id);
        }),
      addFood: (e) =>
        set((s) => {
          s.foods.push({ ...e, id: uid("fe-") });
        }),
      removeFood: (id) =>
        set((s) => {
          s.foods = s.foods.filter((x) => x.id !== id);
        }),
      saveCustomFood: (f) =>
        set((s) => {
          s.customFoods = [f, ...s.customFoods.filter((x) => x.id !== f.id && (!f.barcode || x.barcode !== f.barcode))].slice(0, 60);
        }),
      addReview: (clientId, stars, text, target) =>
        set((s) => {
          const recent = s.reviews.some((r) => r.clientId === clientId && Date.now() - new Date(r.at).getTime() < 30 * 864e5);
          s.reviews.unshift({ id: uid("rv-"), clientId, stars, text, at: nowIso(), target });
          if (!recent) s.points.push({ id: uid("pt-"), clientId, at: nowIso(), delta: s.pointRules.review, reason: "Recenzie lăsată" });
        }),
      addTicket: (clientId, kind, subject, text) =>
        set((s) => {
          s.tickets.unshift({ id: uid("tk-"), clientId, kind, subject, text, at: nowIso(), status: "nouă" });
        }),
      joinChallenge: (chId, clientId) =>
        set((s) => {
          const c = s.challenges.find((x) => x.id === chId);
          if (c && !c.entries.some((e) => e.clientId === clientId)) c.entries.push({ clientId, value: 0, status: "înscris" });
        }),
      submitChallenge: (chId, clientId, value) =>
        set((s) => {
          const e = s.challenges.find((x) => x.id === chId)?.entries.find((x) => x.clientId === clientId);
          if (e) {
            e.value = value;
            e.status = "trimis";
          }
        }),
      redeem: (clientId, rewardId) => {
        const s = get();
        const r = s.rewards.find((x) => x.id === rewardId);
        if (!r || pointsOf(s, clientId) < r.cost) return null;
        const code = redeemCode();
        set((st) => {
          st.points.push({ id: uid("pt-"), clientId, at: nowIso(), delta: -r.cost, reason: `Recompensă: ${r.name}` });
          st.redemptions.unshift({ id: uid("rd-"), clientId, rewardId, code, at: nowIso(), status: "activ" });
        });
        return code;
      },
      requestBooking: (b) =>
        set((s) => {
          s.bookings.push({ ...b, id: uid("b-"), status: "cerută" });
          const c = s.clients.find((x) => x.id === b.clientId);
          if (c && !c.trainerAccess.includes(b.trainerId)) c.trainerAccess.push(b.trainerId);
        }),
      setTrainerAccess: (clientId, trainerId, on) =>
        set((s) => {
          const c = s.clients.find((x) => x.id === clientId);
          if (!c) return;
          c.trainerAccess = on ? Array.from(new Set([...c.trainerAccess, trainerId])) : c.trainerAccess.filter((t) => t !== trainerId);
        }),
      markRead: (ids, clientId) =>
        set((s) => {
          s.notices.forEach((n) => ids.includes(n.id) && !n.readBy.includes(clientId) && n.readBy.push(clientId));
        }),
      fillDemoHistory: (clientId) =>
        set((s) => {
          const r = rng(clientId.length * 7919);
          const c = s.clients.find((x) => x.id === clientId);
          if (!c) return;
          const base = c.weightKg ?? 75;
          for (let d = -27; d < 0; d++) {
            const day = addDays(today(), d);
            const groups = c.weekPlan[weekday(day)];
            if (!groups.length || s.workouts.some((w) => w.clientId === clientId && w.date === day)) continue;
            s.workouts.push(makeWorkout(clientId, day, groups, (d + 28) / 28, r));
          }
          for (let w = 4; w >= 1; w--) {
            const date = addDays(today(), -w * 7);
            if (!s.weights.some((x) => x.clientId === clientId && x.date === date))
              s.weights.push({ id: uid("wg-"), clientId, date, kg: +(base + (c.goals.includes("Slăbire") ? w * 0.6 : -w * 0.35)).toFixed(1) });
          }
          const picks: [string, number, FoodEntry["meal"]][] = [
            ["f-ovaz", 60, "Mic dejun"],
            ["f-lapte", 250, "Mic dejun"],
            ["f-banana", 120, "Mic dejun"],
            ["f-pui", 180, "Prânz"],
            ["f-orez", 200, "Prânz"],
            ["f-iaurtg", 150, "Gustări"],
          ];
          if (!s.foods.some((f) => f.clientId === clientId && f.date === today()))
            picks.forEach(([fid, g, meal]) => {
              const f = FOODS.find((x) => x.id === fid)!;
              s.foods.push({ id: uid("fe-"), clientId, date: today(), meal, foodId: f.id, name: f.name, grams: g, ...macrosFor(f, g), source: "căutare" });
            });
        }),

      addSale: (items, method, clientId) =>
        set((s) => {
          const total = items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
          s.sales.push({ id: uid("sa-"), at: nowIso(), items, total, method, clientId });
          items.forEach((i) => {
            const p = i.kind === "product" ? s.products.find((x) => x.id === i.refId) : null;
            if (p) p.stock = Math.max(0, p.stock - i.qty);
          });
        }),
      sellPlanAtDesk: (clientId, planId, method) =>
        set((s) => {
          const plan = s.plans.find((p) => p.id === planId)!;
          const current = s.subscriptions
            .filter((x) => x.clientId === clientId && x.status === "activ" && x.end >= today())
            .sort((a, b) => b.end.localeCompare(a.end))[0];
          const start = current ? addDays(current.end, 1) : today();
          s.subscriptions.push({ id: uid("s-"), clientId, planId, start, end: addDays(start, plan.durationDays - 1), pricePaid: plan.price, method, status: "activ", createdAt: nowIso() });
          s.sales.push({ id: uid("sa-"), at: nowIso(), items: [{ kind: "plan", refId: plan.id, name: `Abonament ${plan.name}`, qty: 1, unitPrice: plan.price }], total: plan.price, method, clientId });
          s.notices.push({ id: uid("n-"), to: clientId, title: "Abonament prelungit", body: `Abonamentul ${plan.name} a fost adăugat la recepție.`, at: nowIso(), kind: "abonament", readBy: [] });
        }),
      upsertProduct: (p) =>
        set((s) => {
          const i = s.products.findIndex((x) => x.id === p.id);
          if (i >= 0) s.products[i] = p;
          else s.products.push(p);
        }),
      deleteProduct: (id) =>
        set((s) => {
          s.products = s.products.filter((x) => x.id !== id);
        }),
      restock: (id, qty) =>
        set((s) => {
          const p = s.products.find((x) => x.id === id);
          if (p) p.stock += qty;
        }),
      upsertPlan: (p) =>
        set((s) => {
          const i = s.plans.findIndex((x) => x.id === p.id);
          if (i >= 0) s.plans[i] = p;
          else s.plans.push(p);
        }),
      sendNotice: (n) =>
        set((s) => {
          s.notices.push({ ...n, id: uid("n-"), at: nowIso(), readBy: [] });
        }),
      sendExpiryReminders: () => {
        const s = get();
        const lim = addDays(today(), s.pointRules.autoReminderDays + 4);
        const targets = s.clients.filter((c) => {
          const subs = s.subscriptions.filter((x) => x.clientId === c.id && x.status === "activ");
          const last = subs.sort((a, b) => b.end.localeCompare(a.end))[0];
          return last && last.end >= today() && last.end <= lim;
        });
        set((st) => {
          targets.forEach((c) =>
            st.notices.push({
              id: uid("n-"),
              to: c.id,
              title: "Abonamentul expiră curând",
              body: "Prelungește-l din aplicație sau la recepție ca să nu pierzi nicio zi.",
              at: nowIso(),
              kind: "abonament",
              readBy: [],
            }),
          );
        });
        return targets.length;
      },
      addPoints: (clientId, delta, reason) =>
        set((s) => {
          s.points.push({ id: uid("pt-"), clientId, at: nowIso(), delta, reason });
          s.notices.push({ id: uid("n-"), to: clientId, title: delta > 0 ? `Ai primit ${delta} de puncte` : "Puncte ajustate", body: reason, at: nowIso(), kind: "puncte", readBy: [] });
        }),
      setPointRules: (r) =>
        set((s) => {
          Object.assign(s.pointRules, r);
        }),
      upsertReward: (r) =>
        set((s) => {
          const i = s.rewards.findIndex((x) => x.id === r.id);
          if (i >= 0) s.rewards[i] = r;
          else s.rewards.push(r);
        }),
      useRedemption: (id) =>
        set((s) => {
          const r = s.redemptions.find((x) => x.id === id);
          if (r) r.status = "folosit";
        }),
      upsertChallenge: (c) =>
        set((s) => {
          const i = s.challenges.findIndex((x) => x.id === c.id);
          if (i >= 0) s.challenges[i] = c;
          else s.challenges.unshift(c);
          if (i < 0) s.notices.push({ id: uid("n-"), to: "toți", title: `Provocare nouă: ${c.title}`, body: `${c.points} de puncte pentru rezultatul validat. Înscrie-te din Comunitate.`, at: nowIso(), kind: "provocare", readBy: [] });
        }),
      validateEntry: (chId, clientId, ok, by) =>
        set((s) => {
          const c = s.challenges.find((x) => x.id === chId);
          const e = c?.entries.find((x) => x.clientId === clientId);
          if (!c || !e) return;
          e.status = ok ? "validat" : "respins";
          e.validatedBy = by;
          if (ok) {
            s.points.push({ id: uid("pt-"), clientId, at: nowIso(), delta: c.points, reason: `Provocare validată: ${c.title}` });
            s.notices.push({ id: uid("n-"), to: clientId, title: "Rezultat validat", body: `${c.title}: ${e.value} ${c.unit}. Ai primit ${c.points} de puncte.`, at: nowIso(), kind: "provocare", readBy: [] });
          } else {
            s.notices.push({ id: uid("n-"), to: clientId, title: "Rezultat nevalidat", body: `${c.title}: rezultatul nu a putut fi validat. Mai încearcă, sub ochii unui antrenor.`, at: nowIso(), kind: "provocare", readBy: [] });
          }
        }),
      setTrainerStatus: (id, status) =>
        set((s) => {
          const t = s.trainers.find((x) => x.id === id);
          if (t) t.status = status;
        }),
      replyReview: (id, reply) =>
        set((s) => {
          const r = s.reviews.find((x) => x.id === id);
          if (r) r.reply = reply;
        }),
      updateTicket: (id, status, reply) =>
        set((s) => {
          const t = s.tickets.find((x) => x.id === id);
          if (!t) return;
          t.status = status;
          if (reply !== undefined) t.reply = reply;
          if (reply) s.notices.push({ id: uid("n-"), to: t.clientId, title: `Răspuns: ${t.subject}`, body: reply, at: nowIso(), kind: "sală", readBy: [] });
        }),
      updateGym: (p) =>
        set((s) => {
          Object.assign(s.gym, p);
        }),
      upsertMachine: (m) =>
        set((s) => {
          const i = s.machines.findIndex((x) => x.id === m.id);
          if (i >= 0) s.machines[i] = m;
          else s.machines.push(m);
        }),
      deleteMachine: (id) =>
        set((s) => {
          s.machines = s.machines.filter((x) => x.id !== id);
        }),

      registerTrainer: (t) => {
        const id = uid("t-");
        set((s) => {
          s.trainers = s.trainers.filter((x) => x.email !== t.email);
          s.trainers.push({ ...t, id, status: "în așteptare", createdAt: nowIso() });
        });
        return id;
      },
      updateTrainer: (id, p) =>
        set((s) => {
          const t = s.trainers.find((x) => x.id === id);
          if (t) Object.assign(t, p);
        }),
      setAvailability: (id, a) =>
        set((s) => {
          const t = s.trainers.find((x) => x.id === id);
          if (t) t.availability = a;
        }),
      setBookingStatus: (id, status) =>
        set((s) => {
          const b = s.bookings.find((x) => x.id === id);
          if (!b) return;
          b.status = status;
          const t = s.trainers.find((x) => x.id === b.trainerId);
          if (status === "confirmată" || status === "anulată")
            s.notices.push({
              id: uid("n-"),
              to: b.clientId,
              title: status === "confirmată" ? "Ședință confirmată" : "Ședință anulată",
              body: `${t?.firstName ?? "Antrenorul"} ${status === "confirmată" ? "a confirmat" : "a anulat"} ședința din ${b.date.split("-").reverse().join(".")}, ora ${b.time}.`,
              at: nowIso(),
              kind: "antrenor",
              readBy: [],
            });
        }),
      addTrainerNote: (trainerId, clientId, text) =>
        set((s) => {
          s.trainerNotes.unshift({ id: uid("tn-"), trainerId, clientId, text, at: nowIso() });
        }),
    })),
    {
      name: "spartan-gym:v1",
      version: 2,
      storage: safeStorage,
      // păstrăm contul creat în prima versiune a demo-ului
      migrate: (persisted, version) => {
        const base = fresh();
        if (version < 2 && persisted && typeof persisted === "object") {
          const old = persisted as { loggedIn?: boolean; account?: { firstName: string; lastName: string; email: string; phone: string; passwordHash: string }; profile?: Partial<Client>; consents?: { termsAcceptedAt: string | null; gdprAcceptedAt: string | null; location: Client["location"]; marketing: boolean } };
          if (old.account) {
            const id = "c-me";
            base.clients.push({
              id,
              memberId: memberIdFrom(old.account.email),
              ...old.account,
              photo: old.profile?.photo ?? null,
              sex: null,
              age: old.profile?.age ?? null,
              heightCm: old.profile?.heightCm ?? null,
              weightKg: old.profile?.weightKg ?? null,
              goals: old.profile?.goals ?? [],
              improve: old.profile?.improve ?? [],
              strengths: old.profile?.strengths ?? [],
              struggles: old.profile?.struggles ?? [],
              notes: old.profile?.notes ?? "",
              createdAt: nowIso(),
              termsAcceptedAt: old.consents?.termsAcceptedAt ?? nowIso(),
              gdprAcceptedAt: old.consents?.gdprAcceptedAt ?? nowIso(),
              location: old.consents?.location ?? "skipped",
              marketing: old.consents?.marketing ?? false,
              trainerAccess: [],
              leaderboardOptIn: true,
              weekPlan: DEFAULT_WEEK_PLAN,
            });
            if (old.profile?.weightKg) base.weights.push({ id: uid("wg-"), clientId: id, date: today(), kg: old.profile.weightKg });
            base.points.push({ id: uid("pt-"), clientId: id, at: nowIso(), delta: base.pointRules.profileComplete, reason: "Profil completat" });
            if (old.loggedIn) base.session = { role: "client", clientId: id, trainerId: null };
          }
        }
        return base as unknown as Store;
      },
      partialize: (s) => {
        // nu salvăm funcțiile; restul stării da
        const { ...rest } = s;
        return rest;
      },
    },
  ),
);

// sincronizare între tab-uri (ex. clientul într-un tab, recepția în altul)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "spartan-gym:v1") void useStore.persist.rehydrate();
  });
}

export const getClient = (s: Pick<State, "clients">, id: string | null) => s.clients.find((c) => c.id === id) ?? null;
export const getTrainer = (s: Pick<State, "trainers">, id: string | null) => s.trainers.find((t) => t.id === id) ?? null;
