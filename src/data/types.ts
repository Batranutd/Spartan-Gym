export type ID = string;
export type ISODate = string; // "2026-10-14"
export type ISOTime = string; // ISO complet

export type MuscleGroup = "Piept" | "Spate" | "Umeri" | "Brațe" | "Abdomen" | "Picioare" | "Fesieri" | "Cardio";
export const MUSCLE_GROUPS: MuscleGroup[] = ["Piept", "Spate", "Umeri", "Brațe", "Abdomen", "Picioare", "Fesieri", "Cardio"];

export interface Plan {
  id: ID;
  name: string;
  durationDays: number;
  price: number;
  perks: string[];
  popular?: boolean;
  active: boolean;
}

export type ProductCategory = "Băuturi" | "Proteine" | "Gustări" | "Accesorii";
export interface Product {
  id: ID;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  lowStock: number;
}

export interface Client {
  id: ID;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  photo: string | null;
  sex: "M" | "F" | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goals: string[];
  improve: string[];
  strengths: string[];
  struggles: string[];
  notes: string;
  createdAt: ISOTime;
  termsAcceptedAt: ISOTime | null;
  gdprAcceptedAt: ISOTime | null;
  location: "granted" | "denied" | "skipped" | null;
  marketing: boolean;
  trainerAccess: ID[]; // antrenorii care îi pot vedea datele
  leaderboardOptIn: boolean;
  weekPlan: Record<number, MuscleGroup[]>; // 0 = luni ... 6 = duminică
  isDemoSeed?: boolean;
}

export type PayMethod = "card-app" | "cash" | "card-pos";
export interface Subscription {
  id: ID;
  clientId: ID;
  planId: ID;
  start: ISODate;
  end: ISODate;
  pricePaid: number;
  method: PayMethod;
  status: "activ" | "în așteptare"; // în așteptare = de plătit la recepție
  createdAt: ISOTime;
}

export interface CheckIn {
  id: ID;
  clientId: ID;
  at: ISOTime;
  via: "qr" | "recepție" | "locație";
}

export interface SaleItem {
  kind: "product" | "plan" | "other";
  refId?: ID;
  name: string;
  qty: number;
  unitPrice: number;
}
export interface Sale {
  id: ID;
  at: ISOTime;
  items: SaleItem[];
  total: number;
  method: PayMethod;
  clientId?: ID;
}

export interface TrainerPackage {
  id: ID;
  name: string;
  price: number;
  sessions: number;
  includes: string[];
}
export interface Availability {
  day: number; // 0 = luni
  from: string; // "08:00"
  to: string;
}
export interface Trainer {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  photo: string | null;
  specialties: string[];
  yearsExp: number;
  history: string;
  bio: string;
  packages: TrainerPackage[];
  availability: Availability[];
  absentDates: ISODate[];
  evolutionPhotos: string[];
  status: "în așteptare" | "aprobat" | "respins";
  createdAt: ISOTime;
}

export interface Booking {
  id: ID;
  trainerId: ID;
  clientId: ID;
  date: ISODate;
  time: string;
  status: "cerută" | "confirmată" | "anulată" | "efectuată";
  note?: string;
}

export interface Machine {
  id: ID;
  name: string;
  group: MuscleGroup;
  count: number;
  status: "funcțional" | "în mentenanță";
  exercises: string[];
}

export interface SetEntry {
  kg: number;
  reps: number;
}
export interface ExerciseLog {
  id: ID;
  machineId: ID | null;
  exercise: string;
  group: MuscleGroup;
  sets: SetEntry[];
}
export interface WorkoutLog {
  id: ID;
  clientId: ID;
  date: ISODate;
  groups: MuscleGroup[];
  exercises: ExerciseLog[];
  done: boolean;
}

export interface WeightEntry {
  id: ID;
  clientId: ID;
  date: ISODate;
  kg: number;
}

export type Visibility = "privat" | "public" | "selectat";
export interface ProgressPhoto {
  id: ID;
  clientId: ID;
  date: ISODate;
  img: string;
  visibility: Visibility;
  allowed: ID[]; // antrenori/clienți, când e „selectat”
  caption: string;
}

export type Meal = "Mic dejun" | "Prânz" | "Cină" | "Gustări";
export const MEALS: Meal[] = ["Mic dejun", "Prânz", "Cină", "Gustări"];
export interface FoodItem {
  id: ID;
  name: string;
  brand?: string;
  barcode?: string;
  per100: { kcal: number; p: number; c: number; f: number; fiber?: number; sugar?: number; salt?: number };
  unit?: { label: string; grams: number }; // ex. „1 ou” = 55 g
}
export interface FoodEntry {
  id: ID;
  clientId: ID;
  date: ISODate;
  meal: Meal;
  foodId: ID;
  name: string;
  grams: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
  source: "cod de bare" | "etichetă" | "căutare" | "manual";
}
export interface NutritionTarget {
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export interface Review {
  id: ID;
  clientId: ID;
  stars: number;
  text: string;
  at: ISOTime;
  reply?: string;
  target: "sală" | ID; // sală sau id antrenor
}

export interface Ticket {
  id: ID;
  clientId: ID;
  kind: "reclamație" | "propunere";
  subject: string;
  text: string;
  at: ISOTime;
  status: "nouă" | "în lucru" | "rezolvată";
  reply?: string;
}

export interface ChallengeEntry {
  clientId: ID;
  value: number;
  status: "înscris" | "trimis" | "validat" | "respins";
  validatedBy?: ID | "admin";
  note?: string;
}
export interface Challenge {
  id: ID;
  title: string;
  description: string;
  unit: string; // „repetări”, „kg”, „minute”
  higherIsBetter: boolean;
  start: ISODate;
  end: ISODate;
  points: number;
  entries: ChallengeEntry[];
}

export interface Reward {
  id: ID;
  name: string;
  description: string;
  cost: number;
  icon: "drop" | "bar" | "shirt" | "percent" | "trainer" | "shaker" | "calendar";
  active: boolean;
}
export interface Redemption {
  id: ID;
  clientId: ID;
  rewardId: ID;
  code: string;
  at: ISOTime;
  status: "activ" | "folosit";
}

export interface PointsTx {
  id: ID;
  clientId: ID;
  at: ISOTime;
  delta: number;
  reason: string;
}

export interface Notice {
  id: ID;
  to: "toți" | ID;
  title: string;
  body: string;
  at: ISOTime;
  kind: "abonament" | "anunț" | "puncte" | "provocare" | "antrenor" | "sală";
  readBy: ID[];
}

export interface PointRules {
  checkIn: number;
  weekStreak: number; // bonus pentru 3 vizite/săptămână
  review: number;
  referral: number;
  profileComplete: number;
  expireMonths: number;
  autoReminderDays: number; // notificare înainte de expirare
}

export interface GalleryItem {
  id: ID;
  img: string | null;
  caption: string;
  zone: string;
}

export interface Facility {
  key: string;
  label: string;
  on: boolean;
  detail?: string;
}

export interface Gym {
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: { label: string; value: string }[];
  facilities: Facility[];
  gallery: GalleryItem[];
  capacity: number;
  adminPin: string;
  accent: string; // culoarea de accent a sălii (white-label)
}

export type Role = "client" | "trainer" | "admin";

export interface Session {
  role: Role | null;
  clientId: ID | null;
  trainerId: ID | null;
}
