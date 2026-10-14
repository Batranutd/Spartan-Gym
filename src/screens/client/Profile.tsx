import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Bell, Camera, CreditCard, Download, FileText, LogOut, MessageSquareWarning, RotateCcw, Shield, ShieldCheck, Trash2, UserCog, UserRound, Users } from "lucide-react";
import { useStore, pointsOf } from "../../store/useStore";
import { useClientNav } from "../../lib/nav";
import { useMe } from "./useMe";
import { Avatar, Badge, Card, Divider, Row, Scroll, SectionTitle, Segmented, Stagger, Toggle, TopBar } from "../../components/ui/kit";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Stepper } from "../../components/ui/Stepper";
import { ChipGroup } from "../../components/ui/Chip";
import { Sheet } from "../../components/ui/Sheet";
import { toast, confirmDialog } from "../../components/ui/Toast";
import { fileToSquareDataUrl } from "../../lib/image";
import { fullName, lifetimePoints, subInfo, tierOf } from "../../lib/derive";
import { fmtLong, dayOf } from "../../lib/date";
import { GOALS, MUSCLES, SKILLS } from "../../lib/options";
import { GdprText, TermsText } from "../../lib/legal";
import { formatPhone, isName, normalizePhone } from "../../lib/validate";

export function ProfileScreen() {
  const me = useMe();
  const nav = useClientNav();
  const s = useStore();
  const tier = tierOf(lifetimePoints(s, me.id));
  const info = subInfo(s, me.id);
  const [legal, setLegal] = useState<null | "t" | "g">(null);

  const exportData = async () => {
    const data = {
      profil: me,
      abonamente: s.subscriptions.filter((x) => x.clientId === me.id),
      prezenta: s.checkIns.filter((x) => x.clientId === me.id),
      antrenamente: s.workouts.filter((x) => x.clientId === me.id),
      greutate: s.weights.filter((x) => x.clientId === me.id),
      nutritie: s.foods.filter((x) => x.clientId === me.id),
      puncte: s.points.filter((x) => x.clientId === me.id),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, (k, v) => (k === "passwordHash" || k === "img" || k === "photo" ? undefined : v), 2));
      toast("Datele tale au fost copiate. Le poți lipi într-un e-mail sau document.");
    } catch {
      toast("Nu am putut copia. În aplicația finală primești un fișier pe e-mail.", "info");
    }
  };

  const del = async () => {
    if (!(await confirmDialog({ title: "Ștergi contul?", text: "Se șterg profilul, antrenamentele, nutriția, pozele și punctele. Plățile rămân anonimizate, pentru evidența fiscală a sălii.", ok: "Șterge contul", danger: true }))) return;
    s.deleteClient(me.id);
    s.logout();
  };

  const switchRole = async (role: "admin" | "trainer") => {
    s.enterAs(role, role === "trainer" ? "t-mihai" : null);
    toast(role === "admin" ? "Ești în panoul de administrare (demo)" : "Ești antrenorul Mihai Rus (demo)", "info");
  };

  return (
    <>
      <TopBar title="Profil" onBack={nav.pop} />
      <Scroll>
        <Stagger>
          <div className="flex items-center gap-4">
            <Avatar name={fullName(me)} photo={me.photo} size={76} id={me.id} />
            <div className="flex-1 min-w-0">
              <div className="font-display font-extrabold text-[22px] text-text leading-tight truncate">{fullName(me)}</div>
              <div className="text-[14px] text-muted truncate">{me.email}</div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="h-6 px-2.5 rounded-full text-[12px] font-bold grid place-items-center" style={{ background: tier.color, color: "#0E0F12" }}>
                  {tier.name}
                </span>
                <Badge>{me.memberId}</Badge>
                <Badge tone="violet">{pointsOf(s, me.id)} puncte</Badge>
              </div>
            </div>
          </div>
        </Stagger>

        <Stagger i={1} className="mt-5">
          <Card className="py-1">
            <Row icon={<UserRound size={20} className="text-volt shrink-0" />} title="Date personale și obiective" subtitle={`${me.age ?? "–"} ani · ${me.heightCm ?? "–"} cm · ${String(me.weightKg ?? "–").replace(".", ",")} kg`} onClick={() => nav.push("editProfile")} />
            <Divider />
            <Row icon={<CreditCard size={20} className="text-volt shrink-0" />} title="Abonament și plăți" subtitle={info.active ? `Activ, încă ${info.daysLeft} zile` : "Niciun abonament activ"} onClick={() => nav.push("subscription")} />
            <Divider />
            <Row icon={<Shield size={20} className="text-volt shrink-0" />} title="Confidențialitate" subtitle={`${me.trainerAccess.length} antrenori cu acces`} onClick={() => nav.push("privacy")} />
            <Divider />
            <Row icon={<Bell size={20} className="text-volt shrink-0" />} title="Notificări" onClick={() => nav.push("notifications")} />
            <Divider />
            <Row icon={<MessageSquareWarning size={20} className="text-volt shrink-0" />} title="Reclamații și propuneri" onClick={() => nav.push("feedback")} />
          </Card>
        </Stagger>

        <Stagger i={2} className="mt-5">
          <SectionTitle>Datele tale (GDPR)</SectionTitle>
          <Card className="py-1">
            <Row icon={<FileText size={20} className="text-muted shrink-0" />} title="Termeni și condiții" subtitle={me.termsAcceptedAt ? `Acceptat pe ${fmtLong(dayOf(me.termsAcceptedAt))}` : undefined} onClick={() => setLegal("t")} />
            <Divider />
            <Row icon={<ShieldCheck size={20} className="text-muted shrink-0" />} title="Protecția datelor" subtitle={me.gdprAcceptedAt ? `Acceptat pe ${fmtLong(dayOf(me.gdprAcceptedAt))}` : undefined} onClick={() => setLegal("g")} />
            <Divider />
            <Row icon={<Download size={20} className="text-muted shrink-0" />} title="Copiază toate datele mele" onClick={exportData} />
            <Divider />
            <Row icon={<Trash2 size={20} className="text-danger shrink-0" />} title={<span className="text-danger">Șterge contul</span>} onClick={del} />
          </Card>
        </Stagger>

        <Stagger i={3} className="mt-5">
          <SectionTitle>Mod demo</SectionTitle>
          <Card>
            <p className="text-[14px] text-muted leading-snug">Vezi aplicația și din partea sălii. Datele sunt comune, deci ce faci aici apare și acolo.</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button size="md" variant="secondary" icon={<UserCog size={18} />} onClick={() => switchRole("admin")}>
                Administrator
              </Button>
              <Button size="md" variant="secondary" icon={<Users size={18} />} onClick={() => switchRole("trainer")}>
                Antrenor
              </Button>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (await confirmDialog({ title: "Resetezi demo-ul?", text: "Se șterg toate datele, inclusiv contul tău de test, și se generează din nou datele exemplu.", ok: "Resetează", danger: true })) s.resetAll();
              }}
              className="mt-3 h-10 inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted"
            >
              <RotateCcw size={16} /> Resetează demo-ul
            </button>
          </Card>
        </Stagger>

        <Stagger i={4} className="mt-5">
          <Button variant="outline" icon={<LogOut size={19} />} onClick={() => s.logout()}>
            Ieși din cont
          </Button>
        </Stagger>
      </Scroll>

      <Sheet open={!!legal} onClose={() => setLegal(null)} title={legal === "t" ? "Termeni și condiții" : "Protecția datelor"}>
        {legal === "t" ? TermsText : GdprText}
      </Sheet>
    </>
  );
}

export function EditProfile() {
  const me = useMe();
  const nav = useClientNav();
  const s = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({
    firstName: me.firstName,
    lastName: me.lastName,
    phone: formatPhone(me.phone.replace("+40", "0")),
    photo: me.photo,
    sex: (me.sex ?? "x") as "M" | "F" | "x",
    age: me.age,
    heightCm: me.heightCm,
    weightKg: me.weightKg,
    goals: me.goals,
    improve: me.improve,
    strengths: me.strengths,
    struggles: me.struggles,
  });
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    if (!isName(f.firstName) || !isName(f.lastName)) return setErr("Verifică numele și prenumele.");
    const phone = normalizePhone(f.phone);
    if (!phone) return setErr("Numărul de telefon nu e corect.");
    s.updateClient(me.id, { ...f, phone, sex: f.sex === "x" ? null : f.sex });
    if (f.weightKg && f.weightKg !== me.weightKg) s.addWeight(me.id, f.weightKg);
    toast("Profilul a fost salvat");
    nav.pop();
  };

  return (
    <>
      <TopBar title="Date personale" onBack={nav.pop} />
      <Scroll>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => fileRef.current?.click()} className="relative" aria-label="Schimbă poza">
              <Avatar name={`${f.firstName} ${f.lastName}`} photo={f.photo} size={84} id={me.id} />
              <span className="absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-volt text-ink grid place-items-center border-4 border-ink">
                <Camera size={15} />
              </span>
            </motion.button>
            <input ref={fileRef} type="file" onClick={(e) => ((e.target as HTMLInputElement).value = "")} accept="image/*" hidden onChange={async (e) => e.target.files?.[0] && setF({ ...f, photo: await fileToSquareDataUrl(e.target.files[0]) })} />
            <p className="text-[14px] text-muted leading-snug">Poza apare pe cardul de membru și în clasament.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prenume" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
            <Field label="Nume" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
          </div>
          <Field label="Telefon" type="tel" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: formatPhone(e.target.value) })} />
          <div>
            <div className="text-[14px] text-muted mb-2 font-medium">Sex</div>
            <Segmented
              value={f.sex}
              onChange={(v) => setF({ ...f, sex: v })}
              options={[
                { value: "M", label: "Bărbat" },
                { value: "F", label: "Femeie" },
                { value: "x", label: "Nu spun" },
              ]}
            />
          </div>
          <Stepper label="Vârsta" unit="ani" value={f.age} placeholder={28} min={14} max={99} onChange={(v) => setF({ ...f, age: v })} />
          <Stepper label="Înălțimea" unit="cm" value={f.heightCm} placeholder={175} min={120} max={230} onChange={(v) => setF({ ...f, heightCm: v })} />
          <Stepper label="Greutatea" unit="kg" value={f.weightKg} placeholder={75} min={35} max={250} step={0.5} onChange={(v) => setF({ ...f, weightKg: v })} />
          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Scopul principal</div>
            <ChipGroup options={GOALS} value={f.goals} onChange={(v) => setF({ ...f, goals: v })} max={3} />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Ce vrei să îmbunătățești</div>
            <ChipGroup options={MUSCLES} value={f.improve} onChange={(v) => setF({ ...f, improve: v })} />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-text mb-2">La ce te descurci bine</div>
            <ChipGroup options={SKILLS} value={f.strengths} onChange={(v) => setF({ ...f, strengths: v })} tone="violet" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-text mb-2">Ce ți se pare greu</div>
            <ChipGroup options={SKILLS} value={f.struggles} onChange={(v) => setF({ ...f, struggles: v })} />
          </div>
          {err && <p className="text-[14px] text-danger">{err}</p>}
          <Button onClick={save}>Salvează</Button>
        </div>
      </Scroll>
    </>
  );
}

export function PrivacyScreen() {
  const me = useMe();
  const nav = useClientNav();
  const s = useStore();
  const trainers = s.trainers.filter((t) => t.status === "aprobat");
  return (
    <>
      <TopBar title="Confidențialitate" onBack={nav.pop} />
      <Scroll>
        <SectionTitle>Antrenori cu acces la datele mele</SectionTitle>
        <p className="text-[14px] text-muted mb-3 leading-snug">Văd antrenamentele, seriile, nutriția și progresul tău. Pozele de evoluție au setare separată, pentru fiecare poză.</p>
        <Card className="py-1">
          {trainers.map((t, i) => (
            <div key={t.id}>
              {i > 0 && <Divider />}
              <div className="flex items-center gap-3">
                <Avatar name={fullName(t)} photo={t.photo} size={40} id={t.id} />
                <div className="flex-1 min-w-0">
                  <Toggle on={me.trainerAccess.includes(t.id)} onChange={(v) => s.setTrainerAccess(me.id, t.id, v)} label={fullName(t)} description={t.specialties.slice(0, 2).join(" · ")} />
                </div>
              </div>
            </div>
          ))}
        </Card>

        <SectionTitle className="mt-6">Comunitate</SectionTitle>
        <Card className="py-1">
          <Toggle on={me.leaderboardOptIn} onChange={(v) => s.updateClient(me.id, { leaderboardOptIn: v })} label="Apar în clasament" description="Cu prenumele și inițiala numelui." />
          <Divider />
          <Toggle on={me.marketing} onChange={(v) => s.updateClient(me.id, { marketing: v })} label="Oferte și noutăți" description="Promoții și provocări noi de la sală." />
        </Card>

        <SectionTitle className="mt-6">Locația</SectionTitle>
        <Card>
          <p className="text-[14px] text-muted leading-snug">
            {me.location === "granted" ? "Permisă doar cât folosești aplicația." : "Nu e permisă. Faci check-in cu codul QR."} Se schimbă din setările telefonului.
          </p>
        </Card>
      </Scroll>
    </>
  );
}
