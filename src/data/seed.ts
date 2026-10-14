import type {
  Booking,
  Challenge,
  CheckIn,
  Client,
  FoodEntry,
  Gym,
  Machine,
  MuscleGroup,
  Notice,
  Plan,
  PointRules,
  PointsTx,
  Product,
  Redemption,
  Review,
  Reward,
  Sale,
  Subscription,
  Ticket,
  Trainer,
  WeightEntry,
  WorkoutLog,
} from "./types";
import { addDays, atTime, iso, today, weekday } from "../lib/date";
import { memberIdFrom, rng } from "../lib/id";
import { FOODS, macrosFor } from "../lib/nutrition";

export const DEFAULT_WEEK_PLAN: Record<number, MuscleGroup[]> = {
  0: ["Piept", "Brațe"],
  1: ["Cardio", "Abdomen"],
  2: ["Spate", "Umeri"],
  3: [],
  4: ["Picioare", "Fesieri"],
  5: ["Cardio"],
  6: [],
};

export const PLANS: Plan[] = [
  { id: "p-zi", name: "O intrare", durationDays: 1, price: 25, perks: ["Acces o zi", "Vestiare și dușuri"], active: true },
  { id: "p-1l", name: "1 lună", durationDays: 30, price: 150, perks: ["Acces nelimitat", "Vestiare și dușuri", "Plan de antrenament în aplicație"], active: true },
  { id: "p-st", name: "Student 1 lună", durationDays: 30, price: 120, perks: ["Acces nelimitat", "Cu carnet de student vizat"], active: true },
  { id: "p-3l", name: "3 luni", durationDays: 90, price: 399, perks: ["Acces nelimitat", "O evaluare cu antrenorul", "Economisești 51 lei"], popular: true, active: true },
  { id: "p-12l", name: "12 luni", durationDays: 365, price: 1290, perks: ["Acces nelimitat", "4 ședințe cu antrenorul", "Prosop Spartan cadou", "Economisești 510 lei"], active: true },
];

export const PRODUCTS: Product[] = [
  { id: "pr-apa", name: "Apă plată 0,5 L", category: "Băuturi", price: 5, stock: 64, lowStock: 20 },
  { id: "pr-apam", name: "Apă minerală 0,5 L", category: "Băuturi", price: 5, stock: 38, lowStock: 20 },
  { id: "pr-izo", name: "Băutură izotonică", category: "Băuturi", price: 9, stock: 14, lowStock: 15 },
  { id: "pr-shake", name: "Shake proteic 330 ml", category: "Proteine", price: 15, stock: 22, lowStock: 10 },
  { id: "pr-baton", name: "Baton proteic 60 g", category: "Proteine", price: 12, stock: 31, lowStock: 15 },
  { id: "pr-preworkout", name: "Pre-workout, o doză", category: "Proteine", price: 8, stock: 6, lowStock: 10 },
  { id: "pr-banana", name: "Banană", category: "Gustări", price: 3, stock: 18, lowStock: 8 },
  { id: "pr-prosop", name: "Prosop Spartan", category: "Accesorii", price: 45, stock: 9, lowStock: 5 },
  { id: "pr-lacat", name: "Lacăt vestiar", category: "Accesorii", price: 20, stock: 12, lowStock: 5 },
  { id: "pr-shaker", name: "Shaker 600 ml", category: "Accesorii", price: 35, stock: 7, lowStock: 4 },
];

export const MACHINES: Machine[] = [
  { id: "m-banda", name: "Bandă de alergare", group: "Cardio", count: 6, status: "funcțional", exercises: ["Alergare", "Mers în pantă"] },
  { id: "m-bicicleta", name: "Bicicletă staționară", group: "Cardio", count: 4, status: "funcțional", exercises: ["Pedalare"] },
  { id: "m-eliptic", name: "Eliptică", group: "Cardio", count: 3, status: "în mentenanță", exercises: ["Eliptică"] },
  { id: "m-vaslit", name: "Aparat de vâslit", group: "Cardio", count: 2, status: "funcțional", exercises: ["Vâslit"] },
  { id: "m-banca", name: "Bancă plată cu bară", group: "Piept", count: 3, status: "funcțional", exercises: ["Împins cu bara", "Împins cu gantere"] },
  { id: "m-bancai", name: "Bancă înclinată", group: "Piept", count: 2, status: "funcțional", exercises: ["Împins înclinat", "Fluturări înclinat"] },
  { id: "m-fluturari", name: "Aparat fluturări", group: "Piept", count: 1, status: "funcțional", exercises: ["Fluturări la aparat"] },
  { id: "m-pulldown", name: "Helcometru vertical", group: "Spate", count: 2, status: "funcțional", exercises: ["Tracțiuni la helcometru", "Tracțiuni priză îngustă"] },
  { id: "m-ramat", name: "Helcometru orizontal", group: "Spate", count: 1, status: "funcțional", exercises: ["Ramat la helcometru"] },
  { id: "m-tractiuni", name: "Bară tracțiuni asistate", group: "Spate", count: 1, status: "funcțional", exercises: ["Tracțiuni asistate"] },
  { id: "m-umeri", name: "Aparat împins umeri", group: "Umeri", count: 1, status: "funcțional", exercises: ["Împins deasupra capului"] },
  { id: "m-cablu", name: "Cablu dublu (crossover)", group: "Umeri", count: 2, status: "funcțional", exercises: ["Ridicări laterale la cablu", "Face pull"] },
  { id: "m-gantere", name: "Set gantere 2–50 kg", group: "Brațe", count: 1, status: "funcțional", exercises: ["Flexii biceps", "Extensii triceps", "Flexii ciocan"] },
  { id: "m-biceps", name: "Aparat biceps", group: "Brațe", count: 1, status: "funcțional", exercises: ["Flexii la aparat"] },
  { id: "m-cusca", name: "Cușcă genuflexiuni", group: "Picioare", count: 2, status: "funcțional", exercises: ["Genuflexiuni cu bara", "Fandări cu bara"] },
  { id: "m-presa", name: "Presă picioare", group: "Picioare", count: 2, status: "funcțional", exercises: ["Presă picioare"] },
  { id: "m-extensii", name: "Aparat extensii", group: "Picioare", count: 1, status: "funcțional", exercises: ["Extensii cvadriceps"] },
  { id: "m-flexii", name: "Aparat flexii femurale", group: "Picioare", count: 1, status: "funcțional", exercises: ["Flexii femurale"] },
  { id: "m-hipthrust", name: "Aparat hip thrust", group: "Fesieri", count: 1, status: "funcțional", exercises: ["Hip thrust"] },
  { id: "m-abductori", name: "Aparat abductori", group: "Fesieri", count: 1, status: "funcțional", exercises: ["Abducții"] },
  { id: "m-abdomen", name: "Bancă abdomen", group: "Abdomen", count: 2, status: "funcțional", exercises: ["Abdomene", "Ridicări de picioare"] },
];

export const REWARDS: Reward[] = [
  { id: "r-apa", name: "Apă plată", description: "O sticlă de 0,5 L de la bar", cost: 50, icon: "drop", active: true },
  { id: "r-baton", name: "Baton proteic", description: "Orice aromă disponibilă", cost: 120, icon: "bar", active: true },
  { id: "r-shake", name: "Shake proteic", description: "330 ml, la alegere", cost: 150, icon: "shaker", active: true },
  { id: "r-prosop", name: "Prosop Spartan", description: "Prosop de sală cu logo", cost: 400, icon: "shirt", active: true },
  { id: "r-10", name: "10% reducere la abonament", description: "La următoarea plată, orice abonament", cost: 600, icon: "percent", active: true },
  { id: "r-sapt", name: "O săptămână gratuită", description: "Se adaugă la abonamentul activ", cost: 800, icon: "calendar", active: true },
  { id: "r-pt", name: "Ședință cu antrenorul", description: "60 de minute, cu orice antrenor", cost: 1000, icon: "trainer", active: true },
];

export const POINT_RULES: PointRules = { checkIn: 10, weekStreak: 20, review: 15, referral: 150, profileComplete: 30, expireMonths: 12, autoReminderDays: 3 };

export const GYM: Gym = {
  name: "Spartan Gym",
  address: "Str. Exemplu nr. 10, Turda",
  phone: "0740 000 000",
  email: "contact@spartangym.ro",
  hours: [
    { label: "Luni – Vineri", value: "06:00 – 23:00" },
    { label: "Sâmbătă", value: "08:00 – 21:00" },
    { label: "Duminică", value: "09:00 – 18:00" },
  ],
  facilities: [
    { key: "ac", label: "Aer condiționat", on: true, detail: "În toate zonele" },
    { key: "vestiare", label: "Vestiare cu dulapuri", on: true, detail: "60 de dulapuri, cu lacăt" },
    { key: "dusuri", label: "Dușuri", on: true, detail: "8 dușuri, apă caldă non-stop" },
    { key: "camere", label: "Camere de supraveghere", on: true, detail: "Sală și parcare, nu în vestiare" },
    { key: "parcare", label: "Parcare", on: true, detail: "25 de locuri, gratuită" },
    { key: "wifi", label: "Wi-Fi gratuit", on: true },
    { key: "bar", label: "Bar proteic", on: true },
    { key: "functional", label: "Zonă funcțională", on: true, detail: "Kettlebell, TRX, saci" },
    { key: "sauna", label: "Saună", on: false },
    { key: "acces", label: "Acces scaun cu rotile", on: false },
  ],
  gallery: [
    { id: "g1", img: null, caption: "Zona de greutăți libere", zone: "Forță" },
    { id: "g2", img: null, caption: "Zona cardio, 15 aparate", zone: "Cardio" },
    { id: "g3", img: null, caption: "Aparate ghidate", zone: "Forță" },
    { id: "g4", img: null, caption: "Zona funcțională", zone: "Funcțional" },
    { id: "g5", img: null, caption: "Vestiare și dușuri", zone: "Vestiare" },
    { id: "g6", img: null, caption: "Recepție și bar proteic", zone: "Recepție" },
  ],
  capacity: 60,
  adminPin: "1234",
  accent: "#D4FF3A",
};

const FIRST_M = ["Andrei", "Mihai", "Alexandru", "Ionuț", "Vlad", "Bogdan", "Cristian", "Sorin", "Darius", "Paul", "Tudor", "Radu", "Florin", "Cosmin", "Adrian"];
const FIRST_F = ["Ana", "Ioana", "Maria", "Elena", "Andreea", "Bianca", "Raluca", "Diana", "Alexandra", "Larisa", "Roxana", "Carmen", "Oana", "Denisa"];
const LAST = ["Pop", "Moldovan", "Rus", "Câmpean", "Mureșan", "Sabău", "Pintea", "Dragomir", "Toma", "Bărbos", "Oltean", "Crișan", "Lazăr", "Matei", "Suciu", "Pușcaș", "Boca", "Varga", "Nistor", "Coman"];
const GOAL_SETS = [["Slăbire", "Tonifiere"], ["Masă musculară", "Forță"], ["Condiție fizică"], ["Sănătate și energie"], ["Forță"], ["Masă musculară"], ["Slăbire"], ["Revenire după pauză", "Condiție fizică"]];

export interface SeedData {
  plans: Plan[];
  products: Product[];
  machines: Machine[];
  rewards: Reward[];
  pointRules: PointRules;
  gym: Gym;
  clients: Client[];
  subscriptions: Subscription[];
  checkIns: CheckIn[];
  sales: Sale[];
  trainers: Trainer[];
  bookings: Booking[];
  workouts: WorkoutLog[];
  weights: WeightEntry[];
  foods: FoodEntry[];
  reviews: Review[];
  tickets: Ticket[];
  challenges: Challenge[];
  redemptions: Redemption[];
  points: PointsTx[];
  notices: Notice[];
}

export function makeWorkout(clientId: string, date: string, groups: MuscleGroup[], progress: number, r: () => number): WorkoutLog {
  const exercises = groups.flatMap((g) =>
    MACHINES.filter((m) => m.group === g && m.status === "funcțional")
      .slice(0, g === "Cardio" ? 1 : 2)
      .map((m, i) => {
        const base = { Piept: 50, Spate: 45, Umeri: 25, Brațe: 12, Picioare: 80, Fesieri: 60, Abdomen: 0, Cardio: 0 }[g];
        const kg = Math.round((base * (0.85 + progress * 0.3) + r() * 5) / 2.5) * 2.5;
        const sets =
          g === "Cardio"
            ? [{ kg: 0, reps: 20 + Math.round(r() * 15) }]
            : Array.from({ length: 3 + (i === 0 ? 1 : 0) }, (_, k) => ({ kg: kg + (k === 0 ? -5 : 0), reps: 12 - k * 2 + Math.round(r() * 2) }));
        return { id: `${clientId}-${date}-${m.id}`, machineId: m.id, exercise: m.exercises[0], group: g, sets };
      }),
  );
  return { id: `w-${clientId}-${date}`, clientId, date, groups, exercises, done: true };
}

export function buildSeed(): SeedData {
  const r = rng(20261014);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const T = today();

  const trainers: Trainer[] = [
    {
      id: "t-mihai",
      firstName: "Mihai",
      lastName: "Rus",
      email: "mihai.rus@spartangym.ro",
      phone: "0741 111 222",
      photo: null,
      specialties: ["Forță", "Powerlifting", "Tehnică"],
      yearsExp: 9,
      history: "Campion național la powerlifting juniori (2017). Antrenor certificat din 2016. A pregătit peste 200 de clienți, de la începători la sportivi de competiție.",
      bio: "Te învăț să ridici corect și în siguranță. Lucrez pe obiective clare, măsurabile, cu progres de la o săptămână la alta.",
      packages: [
        { id: "pk1", name: "Ședință individuală", price: 80, sessions: 1, includes: ["60 de minute", "Corectarea tehnicii"] },
        { id: "pk2", name: "Pachet 8 ședințe", price: 560, sessions: 8, includes: ["2 ședințe pe săptămână", "Plan de forță personalizat", "Verificare săptămânală în aplicație"] },
        { id: "pk3", name: "Program online", price: 200, sessions: 0, includes: ["Plan lunar în aplicație", "Analiza antrenamentelor tale", "Răspuns în 24 de ore"] },
      ],
      availability: [
        { day: 0, from: "07:00", to: "13:00" },
        { day: 1, from: "15:00", to: "21:00" },
        { day: 2, from: "07:00", to: "13:00" },
        { day: 3, from: "15:00", to: "21:00" },
        { day: 4, from: "07:00", to: "13:00" },
      ],
      absentDates: [addDays(T, 9)],
      evolutionPhotos: [],
      status: "aprobat",
      createdAt: atTime(addDays(T, -400), "10:00"),
    },
    {
      id: "t-ioana",
      firstName: "Ioana",
      lastName: "Dragomir",
      email: "ioana.dragomir@spartangym.ro",
      phone: "0742 333 444",
      photo: null,
      specialties: ["Slăbire", "Funcțional", "Mobilitate"],
      yearsExp: 6,
      history: "Licențiată în educație fizică și sport. Instructor de fitness funcțional și TRX. Specializare în nutriție pentru slăbire sănătoasă.",
      bio: "Antrenamente variate, cu energie, adaptate oricărui nivel. Pun accent pe obiceiuri care rămân și după ce atingi obiectivul.",
      packages: [
        { id: "pk1", name: "Ședință individuală", price: 70, sessions: 1, includes: ["60 de minute", "Antrenament funcțional"] },
        { id: "pk2", name: "Pachet slăbire 12 ședințe", price: 750, sessions: 12, includes: ["3 ședințe pe săptămână", "Plan alimentar orientativ", "Măsurători la 2 săptămâni"] },
      ],
      availability: [
        { day: 0, from: "14:00", to: "20:00" },
        { day: 2, from: "14:00", to: "20:00" },
        { day: 4, from: "14:00", to: "20:00" },
        { day: 5, from: "09:00", to: "14:00" },
      ],
      absentDates: [],
      evolutionPhotos: [],
      status: "aprobat",
      createdAt: atTime(addDays(T, -300), "10:00"),
    },
    {
      id: "t-radu",
      firstName: "Radu",
      lastName: "Câmpean",
      email: "radu.campean@spartangym.ro",
      phone: "0743 555 666",
      photo: null,
      specialties: ["Masă musculară", "Culturism", "Nutriție"],
      yearsExp: 11,
      history: "Fost competitor de culturism (locul 2 la Cupa României, 2019). Antrenor și consultant de nutriție sportivă.",
      bio: "Dacă vrei masă musculară, construim planul de antrenament și de masă împreună. Urmăresc fiecare serie în aplicație.",
      packages: [
        { id: "pk1", name: "Ședință individuală", price: 90, sessions: 1, includes: ["60 de minute"] },
        { id: "pk2", name: "Transformare 10 ședințe", price: 800, sessions: 10, includes: ["Plan de antrenament", "Plan alimentar complet", "Ajustări săptămânale"] },
      ],
      availability: [
        { day: 1, from: "07:00", to: "12:00" },
        { day: 3, from: "07:00", to: "12:00" },
        { day: 5, from: "10:00", to: "16:00" },
      ],
      absentDates: [],
      evolutionPhotos: [],
      status: "aprobat",
      createdAt: atTime(addDays(T, -500), "10:00"),
    },
    {
      id: "t-bianca",
      firstName: "Bianca",
      lastName: "Toma",
      email: "bianca.toma@gmail.com",
      phone: "0744 777 888",
      photo: null,
      specialties: ["Pilates", "Mobilitate", "Postură"],
      yearsExp: 3,
      history: "Instructor de pilates certificat. Recuperare după accidentări ușoare, în colaborare cu kinetoterapeuți.",
      bio: "Mișcare controlată, postură corectă și fără dureri de spate.",
      packages: [{ id: "pk1", name: "Ședință individuală", price: 70, sessions: 1, includes: ["50 de minute", "Exerciții de postură"] }],
      availability: [
        { day: 1, from: "17:00", to: "21:00" },
        { day: 3, from: "17:00", to: "21:00" },
      ],
      absentDates: [],
      evolutionPhotos: [],
      status: "în așteptare",
      createdAt: atTime(addDays(T, -1), "18:20"),
    },
  ];
  const approved = trainers.filter((t) => t.status === "aprobat");

  const clients: Client[] = [];
  const subscriptions: Subscription[] = [];
  const checkIns: CheckIn[] = [];
  const sales: Sale[] = [];
  const workouts: WorkoutLog[] = [];
  const weights: WeightEntry[] = [];
  const points: PointsTx[] = [];
  const foods: FoodEntry[] = [];

  for (let i = 0; i < 32; i++) {
    const female = r() < 0.42;
    const firstName = female ? pick(FIRST_F) : pick(FIRST_M);
    let lastName = pick(LAST);
    if (clients.some((c) => c.firstName === firstName && c.lastName === lastName)) lastName = LAST[(LAST.indexOf(lastName) + 3) % LAST.length];
    const email = `${firstName}.${lastName}${i}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .concat("@gmail.com");
    const goals = pick(GOAL_SETS);
    const joinedAgo = 20 + Math.floor(r() * 300);
    const id = `c-${i}`;
    const access = r() < 0.45 ? [pick(approved).id] : [];
    const height = female ? 158 + Math.round(r() * 18) : 170 + Math.round(r() * 20);
    const weight = female ? 52 + Math.round(r() * 25) : 68 + Math.round(r() * 32);
    clients.push({
      id,
      memberId: memberIdFrom(email),
      firstName,
      lastName,
      email,
      phone: `07${Math.floor(20000000 + r() * 79999999)}`,
      photo: null,
      sex: female ? "F" : "M",
      age: 18 + Math.floor(r() * 40),
      heightCm: height,
      weightKg: weight,
      goals,
      improve: [pick(["Piept", "Spate", "Picioare", "Abdomen", "Fesieri", "Brațe"])],
      strengths: [pick(["Forță", "Rezistență", "Constanță", "Cardio"])],
      struggles: [pick(["Alimentație", "Motivație", "Mobilitate", "Tehnică"])],
      notes: "",
      createdAt: atTime(addDays(T, -joinedAgo), "12:00"),
      termsAcceptedAt: atTime(addDays(T, -joinedAgo), "12:00"),
      gdprAcceptedAt: atTime(addDays(T, -joinedAgo), "12:00"),
      location: r() < 0.7 ? "granted" : "skipped",
      marketing: r() < 0.6,
      trainerAccess: access,
      leaderboardOptIn: r() < 0.85,
      weekPlan: DEFAULT_WEEK_PLAN,
      isDemoSeed: true,
    });

    // abonamente: ultimul abonament se termină între -25 și +80 zile față de azi
    const endOffset = i < 4 ? 1 + Math.floor(r() * 6) : i < 7 ? -3 - Math.floor(r() * 20) : Math.floor(r() * 85) - 5;
    const plan = endOffset > 40 ? (r() < 0.5 ? PLANS[3] : PLANS[1]) : r() < 0.15 ? PLANS[2] : PLANS[1];
    const end = addDays(T, endOffset);
    const start = addDays(end, -plan.durationDays);
    const method = pick<"card-app" | "cash" | "card-pos">(["card-app", "cash", "card-pos", "cash"]);
    subscriptions.push({ id: `s-${i}`, clientId: id, planId: plan.id, start, end, pricePaid: plan.price, method, status: "activ", createdAt: atTime(start, "09:30") });
    // abonamentul anterior
    const prevEnd = addDays(start, -1);
    if (joinedAgo > plan.durationDays + 10) {
      subscriptions.push({ id: `s-${i}-p`, clientId: id, planId: PLANS[1].id, start: addDays(prevEnd, -30), end: prevEnd, pricePaid: 150, method: pick(["cash", "card-pos", "card-app"]), status: "activ", createdAt: atTime(addDays(prevEnd, -30), "18:10") });
    }

    // prezență: ritm propriu, între 1 și 5 vizite / săptămână; „la risc” = nu a mai venit de 12+ zile
    const rate = 0.15 + r() * 0.6;
    const atRisk = i % 9 === 4;
    let pts = 0;
    for (let d = -60; d <= 0; d++) {
      const day = addDays(T, d);
      if (day < start && day < addDays(prevEnd, -30)) continue;
      if (day > end) continue;
      if (atRisk && d > -14) continue;
      if (d === 0 && r() < 0.5) continue;
      if (r() < rate) {
        const hour = pick(["06", "07", "08", "12", "16", "17", "18", "18", "19", "19", "20", "21"]);
        const min = String(Math.floor(r() * 60)).padStart(2, "0");
        checkIns.push({ id: `ci-${i}-${d}`, clientId: id, at: atTime(day, `${hour}:${min}`), via: r() < 0.7 ? "qr" : "recepție" });
        pts += 10;
        if (d > -21 && access.length && weekday(day) !== 6) {
          const groups = DEFAULT_WEEK_PLAN[weekday(day)].length ? DEFAULT_WEEK_PLAN[weekday(day)] : (["Cardio"] as MuscleGroup[]);
          workouts.push(makeWorkout(id, day, groups, (d + 60) / 60, r));
        }
      }
    }
    points.push({ id: `pt-${i}`, clientId: id, at: atTime(addDays(T, -1), "23:00"), delta: pts + 30, reason: "Puncte acumulate (prezență și profil)" });
    if (access.length) {
      for (let w = 8; w >= 0; w--) weights.push({ id: `wg-${i}-${w}`, clientId: id, date: addDays(T, -w * 7), kg: +(weight + (goals.includes("Slăbire") ? w * 0.6 : -w * 0.3) + (r() - 0.5)).toFixed(1) });
      const picks = [FOODS[1], FOODS[9], FOODS[18], FOODS[25], FOODS[2]];
      picks.forEach((f, k) => {
        const g = f.unit ? f.unit.grams * (k === 1 ? 2 : 1) : 150;
        foods.push({ id: `fe-${i}-${k}`, clientId: id, date: T, meal: (["Mic dejun", "Prânz", "Prânz", "Gustări", "Cină"] as const)[k], foodId: f.id, name: f.name, grams: g, ...macrosFor(f, g), source: "căutare" });
      });
    }
  }

  // vânzări: abonamente + bar, ultimele 30 de zile
  subscriptions.forEach((s) => {
    if (s.start >= addDays(T, -30)) {
      const plan = PLANS.find((p) => p.id === s.planId)!;
      sales.push({ id: `sa-${s.id}`, at: s.createdAt, items: [{ kind: "plan", refId: plan.id, name: `Abonament ${plan.name}`, qty: 1, unitPrice: plan.price }], total: plan.price, method: s.method, clientId: s.clientId });
    }
  });
  for (let d = -30; d <= 0; d++) {
    const day = addDays(T, d);
    const n = 3 + Math.floor(r() * 9) - (d === 0 ? 3 : 0);
    for (let k = 0; k < n; k++) {
      const p = r() < 0.55 ? PRODUCTS[Math.floor(r() * 3)] : pick(PRODUCTS);
      const qty = r() < 0.8 ? 1 : 2;
      const hh = String(8 + Math.floor(r() * 13)).padStart(2, "0");
      sales.push({ id: `sp-${d}-${k}`, at: atTime(day, `${hh}:${String(Math.floor(r() * 60)).padStart(2, "0")}`), items: [{ kind: "product", refId: p.id, name: p.name, qty, unitPrice: p.price }], total: p.price * qty, method: r() < 0.6 ? "cash" : "card-pos" });
    }
    // câteva intrări unice
    if (r() < 0.6) sales.push({ id: `sz-${d}`, at: atTime(day, "17:45"), items: [{ kind: "plan", refId: "p-zi", name: "Abonament O intrare", qty: 1, unitPrice: 25 }], total: 25, method: "cash" });
  }

  const reviews: Review[] = [
    { id: "rv1", clientId: "c-3", stars: 5, text: "Aparate bune, curat și antrenori care chiar te ajută. Recomand!", at: atTime(addDays(T, -2), "20:10"), target: "sală", reply: "Mulțumim mult! Ne vedem la sală." },
    { id: "rv2", clientId: "c-8", stars: 4, text: "Îmi place atmosfera. Seara pe la 18–19 e cam aglomerat.", at: atTime(addDays(T, -5), "21:00"), target: "sală" },
    { id: "rv3", clientId: "c-12", stars: 5, text: "Cea mai bună sală din Turda. Aplicația e foarte utilă.", at: atTime(addDays(T, -8), "09:30"), target: "sală" },
    { id: "rv4", clientId: "c-15", stars: 3, text: "Dușurile ar trebui verificate mai des.", at: atTime(addDays(T, -11), "19:40"), target: "sală" },
    { id: "rv5", clientId: "c-20", stars: 5, text: "Personal foarte amabil, prețuri corecte.", at: atTime(addDays(T, -15), "11:00"), target: "sală" },
    { id: "rv6", clientId: "c-1", stars: 5, text: "Mihai explică tehnica foarte bine. Am crescut 20 kg la genuflexiuni în două luni.", at: atTime(addDays(T, -6), "12:00"), target: "t-mihai" },
    { id: "rv7", clientId: "c-9", stars: 5, text: "Ioana are mereu energie, antrenamentele trec repede.", at: atTime(addDays(T, -9), "18:00"), target: "t-ioana" },
    { id: "rv8", clientId: "c-22", stars: 4, text: "Plan alimentar foarte clar, rezultatele se văd.", at: atTime(addDays(T, -12), "08:20"), target: "t-radu" },
  ];

  const tickets: Ticket[] = [
    { id: "tk1", clientId: "c-15", kind: "reclamație", subject: "Apă rece la dușuri", text: "Duminică seara nu a fost apă caldă la dușurile de la băieți.", at: atTime(addDays(T, -1), "20:15"), status: "nouă" },
    { id: "tk2", clientId: "c-6", kind: "propunere", subject: "Gantere mai grele", text: "Ar fi util un set de gantere de 55–60 kg pentru împins.", at: atTime(addDays(T, -3), "18:30"), status: "în lucru", reply: "Am cerut ofertă, revenim până la final de lună." },
    { id: "tk3", clientId: "c-18", kind: "propunere", subject: "Program duminică", text: "Program prelungit duminica până la 20:00?", at: atTime(addDays(T, -6), "10:05"), status: "nouă" },
    { id: "tk4", clientId: "c-11", kind: "reclamație", subject: "Eliptica nu merge", text: "Eliptica din colț se oprește după 5 minute.", at: atTime(addDays(T, -9), "07:40"), status: "în lucru", reply: "Am chemat service-ul, aparatul e marcat în mentenanță." },
    { id: "tk5", clientId: "c-25", kind: "reclamație", subject: "Muzica prea tare", text: "Seara muzica e prea tare în zona de greutăți.", at: atTime(addDays(T, -14), "19:00"), status: "rezolvată", reply: "Am redus volumul după ora 19:00. Mulțumim pentru semnal." },
  ];

  const challenges: Challenge[] = [
    {
      id: "ch-plank",
      title: "Plank maxim",
      description: "Ține planșa cât poți, cu tehnică corectă. Validat de un antrenor sau la recepție.",
      unit: "secunde",
      higherIsBetter: true,
      start: addDays(T, -10),
      end: addDays(T, 11),
      points: 100,
      entries: [
        { clientId: "c-2", value: 245, status: "validat", validatedBy: "t-mihai" },
        { clientId: "c-5", value: 198, status: "validat", validatedBy: "t-ioana" },
        { clientId: "c-9", value: 176, status: "validat", validatedBy: "admin" },
        { clientId: "c-13", value: 210, status: "trimis" },
        { clientId: "c-17", value: 0, status: "înscris" },
      ],
    },
    {
      id: "ch-squat",
      title: "Genuflexiuni în 60 de secunde",
      description: "Câte genuflexiuni complete faci într-un minut, fără greutăți.",
      unit: "repetări",
      higherIsBetter: true,
      start: addDays(T, -3),
      end: addDays(T, 18),
      points: 80,
      entries: [
        { clientId: "c-1", value: 52, status: "validat", validatedBy: "t-mihai" },
        { clientId: "c-21", value: 47, status: "trimis" },
        { clientId: "c-8", value: 44, status: "validat", validatedBy: "admin" },
      ],
    },
    {
      id: "ch-oct",
      title: "16 vizite într-o lună",
      description: "Vino de cel puțin 16 ori luna aceasta. Se numără automat din check-in.",
      unit: "vizite",
      higherIsBetter: true,
      start: iso(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      end: iso(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
      points: 150,
      entries: [],
    },
  ];

  const bookings: Booking[] = [
    { id: "b1", trainerId: "t-mihai", clientId: "c-1", date: T, time: "08:00", status: "confirmată" },
    { id: "b2", trainerId: "t-mihai", clientId: "c-6", date: T, time: "10:00", status: "confirmată" },
    { id: "b3", trainerId: "t-mihai", clientId: "c-13", date: addDays(T, 1), time: "16:00", status: "cerută", note: "Aș vrea să lucrăm la împins." },
    { id: "b4", trainerId: "t-ioana", clientId: "c-9", date: T, time: "15:00", status: "confirmată" },
    { id: "b5", trainerId: "t-radu", clientId: "c-22", date: addDays(T, 2), time: "08:00", status: "confirmată" },
    { id: "b6", trainerId: "t-mihai", clientId: "c-2", date: addDays(T, -2), time: "09:00", status: "efectuată" },
  ];

  const notices: Notice[] = [
    { id: "n1", to: "toți", title: "Provocare nouă: plank maxim", body: "Înscrie-te din secțiunea Comunitate. Câștigătorul primește 100 de puncte.", at: atTime(addDays(T, -10), "10:00"), kind: "provocare", readBy: [] },
    { id: "n2", to: "toți", title: "Eliptica e în mentenanță", body: "Am chemat service-ul. Între timp folosiți bicicletele sau banda.", at: atTime(addDays(T, -8), "09:00"), kind: "sală", readBy: [] },
  ];

  return {
    plans: PLANS,
    products: PRODUCTS,
    machines: MACHINES,
    rewards: REWARDS,
    pointRules: POINT_RULES,
    gym: GYM,
    clients,
    subscriptions,
    checkIns,
    sales,
    trainers,
    bookings,
    workouts,
    weights,
    foods,
    reviews,
    tickets,
    challenges,
    redemptions: [],
    points,
    notices,
  };
}
