import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Camera, ChevronLeft, KeyRound, Lock, Mail, Plus, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { ChipGroup } from "../../components/ui/Chip";
import { Stepper } from "../../components/ui/Stepper";
import { Avatar, TextArea } from "../../components/ui/kit";
import { toast } from "../../components/ui/Toast";
import { DEMO_PASSWORD, hashPassword } from "../../lib/auth";
import { formatPhone, isEmail, isName, normalizePhone } from "../../lib/validate";
import { fileToDataUrl, fileToSquareDataUrl } from "../../lib/image";
import { DAY_ABBR } from "../../lib/date";
import type { Availability, TrainerPackage } from "../../data/types";

type Mode = "choose" | "admin" | "trainer" | "signup";
export const SPECIALTIES = ["Forță", "Masă musculară", "Slăbire", "Funcțional", "Mobilitate", "Pilates", "Nutriție", "Powerlifting", "Culturism", "Cardio", "Recuperare", "Postură"];

export function Staff() {
  const setStep = useStore((s) => s.setStep);
  const [mode, setMode] = useState<Mode>("choose");
  const back = () => (mode === "choose" ? setStep("welcome") : setMode("choose"));
  return (
    <div className="h-full flex flex-col">
      <header className="safe-top px-4 shrink-0 flex items-center gap-2 min-h-14">
        <motion.button whileTap={{ scale: 0.9 }} onClick={back} aria-label="Înapoi" className="w-11 h-11 rounded-full grid place-items-center text-text">
          <ChevronLeft size={26} />
        </motion.button>
        <h1 className="font-display font-extrabold text-[20px] text-text">{mode === "signup" ? "Profil de antrenor" : "Personalul sălii"}</h1>
      </header>
      <AnimatePresence mode="wait">
        <motion.div key={mode} className="flex-1 min-h-0 flex flex-col" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
          {mode === "choose" && <Choose onPick={setMode} />}
          {mode === "admin" && <AdminLogin />}
          {mode === "trainer" && <TrainerLogin onSignup={() => setMode("signup")} />}
          {mode === "signup" && <TrainerSignup />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Choose({ onPick }: { onPick: (m: Mode) => void }) {
  return (
    <main className="flex-1 overflow-y-auto px-5 pb-8">
      <p className="text-[16px] text-muted leading-relaxed mt-1">Alege cum intri. Clienții folosesc ecranul de început.</p>
      <div className="flex flex-col gap-3 mt-6">
        {[
          { m: "admin" as Mode, icon: <ShieldCheck size={26} />, t: "Administrator", d: "Clienți, abonamente, încasări, stoc și setările sălii", hi: true },
          { m: "trainer" as Mode, icon: <Users size={26} />, t: "Antrenor", d: "Clienții tăi, programări, profilul public" },
          { m: "signup" as Mode, icon: <UserPlus size={26} />, t: "Devino antrenor la sală", d: "Îți faci profilul, iar administratorul îl aprobă" },
        ].map((x, i) => (
          <motion.button
            key={x.m}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPick(x.m)}
            className={`flex items-center gap-4 rounded-3xl p-4 text-left border ${x.hi ? "bg-surface-2 border-volt/50" : "bg-surface border-line"}`}
          >
            <span className={`w-14 h-14 rounded-2xl grid place-items-center shrink-0 ${x.hi ? "bg-volt text-ink" : "bg-surface-3 text-text"}`}>{x.icon}</span>
            <span className="flex-1 min-w-0">
              <span className="block font-display font-bold text-[18px] text-text">{x.t}</span>
              <span className="block text-[14px] text-muted leading-snug mt-0.5">{x.d}</span>
            </span>
            <ArrowRight size={20} className="text-faint shrink-0" />
          </motion.button>
        ))}
      </div>
    </main>
  );
}

function AdminLogin() {
  const pin = useStore((s) => s.gym.adminPin);
  const enterAs = useStore((s) => s.enterAs);
  const [v, setV] = useState("");
  const [shake, setShake] = useState(0);
  const press = (d: string) => {
    const next = (v + d).slice(0, 4);
    setV(next);
    if (next.length === 4) {
      if (next === pin) setTimeout(() => enterAs("admin"), 150);
      else {
        setShake((x) => x + 1);
        setTimeout(() => setV(""), 400);
      }
    }
  };
  return (
    <main className="flex-1 flex flex-col items-center px-6 pb-6 overflow-y-auto">
      <KeyRound size={34} className="text-volt mt-4" />
      <p className="text-[16px] text-text font-semibold mt-3">Codul PIN de administrator</p>
      <p className="text-[14px] text-muted mt-1">Demo: {pin}</p>
      <motion.div key={shake} animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.35 }} className="flex gap-4 mt-6" aria-live="polite">
        {[0, 1, 2, 3].map((i) => (
          <motion.span key={i} animate={{ scale: v.length > i ? 1.15 : 1 }} className={`w-4 h-4 rounded-full ${v.length > i ? "bg-volt" : "bg-surface-3 border border-line-strong"}`} />
        ))}
      </motion.div>
      <div className="grid grid-cols-3 gap-3 mt-8 w-full max-w-[300px]">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((d, i) =>
          d ? (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => (d === "⌫" ? setV(v.slice(0, -1)) : press(d))}
              aria-label={d === "⌫" ? "Șterge" : d}
              className="h-16 rounded-2xl bg-surface-2 border border-line text-[24px] font-display font-bold text-text"
            >
              {d}
            </motion.button>
          ) : (
            <span key={i} />
          ),
        )}
      </div>
    </main>
  );
}

function TrainerLogin({ onSignup }: { onSignup: () => void }) {
  const trainers = useStore((s) => s.trainers);
  const enterAs = useStore((s) => s.enterAs);
  const [email, setEmail] = useState("mihai.rus@spartangym.ro");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = async () => {
    const t = trainers.find((x) => x.email === email.trim().toLowerCase());
    if (!t) return setErr("Nu există un antrenor cu acest e-mail.");
    const ok = t.passwordHash ? (await hashPassword(pw)) === t.passwordHash : pw === DEMO_PASSWORD;
    if (!ok) return setErr("Parola nu e corectă.");
    enterAs("trainer", t.id);
  };
  return (
    <>
      <main className="flex-1 overflow-y-auto px-5 pb-6">
        <form
          className="flex flex-col gap-5 mt-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field label="E-mail" type="email" inputMode="email" prefix={<Mail size={19} />} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Parolă" type="password" prefix={<Lock size={19} />} placeholder="Parola ta" value={pw} onChange={(e) => setPw(e.target.value)} error={err} />
          <button type="submit" hidden />
        </form>
        <div className="mt-5 rounded-2xl bg-surface border border-line p-3.5 text-[13px] text-muted leading-relaxed">
          Demo: antrenorii generați au parola <span className="text-text font-semibold">{DEMO_PASSWORD}</span>. De exemplu Mihai Rus, Ioana Dragomir sau Radu Câmpean.
        </div>
      </main>
      <footer className="px-5 pt-3 safe-bottom flex flex-col gap-2">
        <Button onClick={submit}>Intră</Button>
        <Button variant="ghost" onClick={onSignup}>
          Nu ai profil? Înscrie-te
        </Button>
      </footer>
    </>
  );
}

const emptyPkg = (): TrainerPackage => ({ id: `pk-${Math.random().toString(36).slice(2, 7)}`, name: "", price: 0, sessions: 1, includes: [] });

function TrainerSignup() {
  const register = useStore((s) => s.registerTrainer);
  const enterAs = useStore((s) => s.enterAs);
  const photoRef = useRef<HTMLInputElement>(null);
  const evoRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", photo: null as string | null, yearsExp: null as number | null, history: "", bio: "" });
  const [spec, setSpec] = useState<string[]>([]);
  const [pkgs, setPkgs] = useState<TrainerPackage[]>([{ ...emptyPkg(), name: "Ședință individuală", price: 80, includes: ["60 de minute"] }]);
  const [days, setDays] = useState<number[]>([0, 2, 4]);
  const [from, setFrom] = useState("08:00");
  const [to, setTo] = useState("14:00");
  const [evo, setEvo] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!isName(f.firstName) || !isName(f.lastName)) return setErr("Completează numele și prenumele.");
    if (!isEmail(f.email)) return setErr("Adresa de e-mail nu e corectă.");
    if (!normalizePhone(f.phone)) return setErr("Numărul de telefon nu e corect.");
    if (f.password.length < 8) return setErr("Parola trebuie să aibă minim 8 caractere.");
    if (!spec.length) return setErr("Alege cel puțin o specializare.");
    if (f.bio.trim().length < 20) return setErr("Scrie o descriere de cel puțin o propoziție.");
    if (!pkgs.some((p) => p.name.trim() && p.price > 0)) return setErr("Adaugă cel puțin un pachet cu preț.");
    setErr(null);
    const availability: Availability[] = days.map((d) => ({ day: d, from, to }));
    const id = register({
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim().toLowerCase(),
      phone: normalizePhone(f.phone)!,
      passwordHash: await hashPassword(f.password),
      photo: f.photo,
      specialties: spec,
      yearsExp: f.yearsExp ?? 0,
      history: f.history.trim(),
      bio: f.bio.trim(),
      packages: pkgs.filter((p) => p.name.trim() && p.price > 0).map((p) => ({ ...p, includes: p.includes.filter(Boolean) })),
      availability,
      absentDates: [],
      evolutionPhotos: evo,
    });
    toast("Profil trimis spre aprobare");
    enterAs("trainer", id);
  };

  const hours = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

  return (
    <>
      <main className="flex-1 overflow-y-auto px-5 pb-8 no-scrollbar">
        <p className="text-[15px] text-muted leading-relaxed">Profilul apare clienților după ce îl aprobă administratorul sălii.</p>
        <div className="flex flex-col gap-5 mt-5">
          <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => photoRef.current?.click()} className="relative shrink-0" aria-label="Adaugă poză de profil">
              <Avatar name={`${f.firstName || "A"} ${f.lastName || "N"}`} photo={f.photo} size={84} />
              <span className="absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-volt text-ink grid place-items-center border-4 border-ink">
                <Camera size={15} />
              </span>
            </motion.button>
            <input ref={photoRef} type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")} accept="image/*" hidden onChange={async (e) => e.target.files?.[0] && setF({ ...f, photo: await fileToSquareDataUrl(e.target.files[0]) })} />
            <p className="text-[14px] text-muted leading-snug">O poză clară, cu fața, crește încrederea clienților.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prenume" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
            <Field label="Nume" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
          </div>
          <Field label="E-mail" type="email" inputMode="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <Field label="Telefon" type="tel" inputMode="tel" placeholder="0740 123 456" value={f.phone} onChange={(e) => setF({ ...f, phone: formatPhone(e.target.value) })} />
          <Field label="Parolă" type="password" placeholder="Minim 8 caractere" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />

          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Specializări</div>
            <ChipGroup options={SPECIALTIES} value={spec} onChange={setSpec} max={4} />
          </div>
          <Stepper label="Ani de experiență" unit="ani" value={f.yearsExp} placeholder={3} min={0} max={50} onChange={(v) => setF({ ...f, yearsExp: v })} />
          <TextArea label="Istoric în acest sport" value={f.history} onChange={(v) => setF({ ...f, history: v })} placeholder="Competiții, certificări, cu cine ai lucrat" />
          <TextArea label="Descriere pentru clienți" value={f.bio} onChange={(v) => setF({ ...f, bio: v })} placeholder="Cum lucrezi și ce oferi" />

          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Poze cu evoluția ta</div>
            <div className="grid grid-cols-3 gap-2">
              {evo.map((p, i) => (
                <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button type="button" aria-label="Șterge poza" onClick={() => setEvo(evo.filter((_, k) => k !== i))} className="absolute top-1 right-1 w-8 h-8 rounded-full bg-ink/80 text-text grid place-items-center">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {evo.length < 6 && (
                <button type="button" onClick={() => evoRef.current?.click()} className="aspect-[3/4] rounded-2xl border border-dashed border-line-strong grid place-items-center text-volt">
                  <Plus size={24} />
                </button>
              )}
            </div>
            <input ref={evoRef} type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")} accept="image/*" hidden onChange={async (e) => e.target.files?.[0] && setEvo([...evo, await fileToDataUrl(e.target.files[0], 700, 0.75)])} />
          </div>

          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Zilele în care vii la sală</div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAY_ABBR.map((d, i) => (
                <button key={d} type="button" onClick={() => setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i].sort())} className={`h-11 rounded-xl text-[13px] font-semibold ${days.includes(i) ? "bg-volt text-ink" : "bg-surface-2 text-text border border-line"}`}>
                  {d}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <TimeSelect label="De la" value={from} onChange={setFrom} options={hours} />
              <TimeSelect label="Până la" value={to} onChange={setTo} options={hours.filter((h) => h > from)} />
            </div>
            <p className="text-[13px] text-faint mt-2">Orele exacte pe fiecare zi le poți schimba după aprobare.</p>
          </div>

          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Pachete și prețuri</div>
            <div className="flex flex-col gap-3">
              {pkgs.map((p, i) => (
                <PackageEditor key={p.id} p={p} onChange={(np) => setPkgs(pkgs.map((x, k) => (k === i ? np : x)))} onDelete={pkgs.length > 1 ? () => setPkgs(pkgs.filter((_, k) => k !== i)) : undefined} />
              ))}
              <Button variant="secondary" icon={<Plus size={18} />} onClick={() => setPkgs([...pkgs, emptyPkg()])}>
                Adaugă pachet
              </Button>
            </div>
          </div>
          {err && <p className="text-[14px] text-danger">{err}</p>}
        </div>
      </main>
      <footer className="px-5 pt-3 safe-bottom border-t border-line">
        <Button onClick={submit}>Trimite spre aprobare</Button>
      </footer>
    </>
  );
}

export function TimeSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="block text-[14px] text-muted mb-2 font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-12 rounded-xl bg-surface-2 border border-line px-3 text-text outline-none focus:border-volt">
        {options.map((o) => (
          <option key={o} value={o} className="bg-surface-2 text-text">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PackageEditor({ p, onChange, onDelete }: { p: TrainerPackage; onChange: (p: TrainerPackage) => void; onDelete?: () => void }) {
  return (
    <div className="rounded-2xl bg-surface border border-line p-3 flex flex-col gap-3">
      <div className="flex gap-2 items-end">
        <Field className="flex-1 min-w-0" label="Denumire" placeholder="De exemplu: pachet 8 ședințe" value={p.name} onChange={(e) => onChange({ ...p, name: e.target.value })} />
        {onDelete && (
          <button type="button" aria-label="Șterge pachetul" onClick={onDelete} className="w-12 h-14 rounded-2xl bg-danger-soft text-danger grid place-items-center shrink-0">
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preț (lei)" inputMode="numeric" value={p.price ? String(p.price) : ""} placeholder="0" onChange={(e) => onChange({ ...p, price: parseInt(e.target.value.replace(/\D/g, "")) || 0 })} />
        <Field label="Ședințe (0 = online)" inputMode="numeric" value={String(p.sessions)} onChange={(e) => onChange({ ...p, sessions: parseInt(e.target.value.replace(/\D/g, "")) || 0 })} />
      </div>
      <Field label="Ce include (separat prin virgulă)" placeholder="60 de minute, plan alimentar" value={p.includes.join(", ")} onChange={(e) => onChange({ ...p, includes: e.target.value.split(",").map((x) => x.trimStart()) })} />
    </div>
  );
}
