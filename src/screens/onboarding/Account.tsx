import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";
import { StepShell, Stagger } from "../../components/ui/StepShell";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { useStore } from "../../store/useStore";
import { hashPassword } from "../../lib/auth";
import { formatPhone, isEmail, isName, normalizePhone, passwordStrength } from "../../lib/validate";

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "password", string>>;

export function Account() {
  const draft = useStore((s) => s.draft);
  const setDraft = useStore((s) => s.setDraft);
  const setStep = useStore((s) => s.setStep);
  const clients = useStore((s) => s.clients);
  const taken = clients.map((c) => c.email);
  const [f, setF] = useState({
    firstName: draft.firstName,
    lastName: draft.lastName,
    email: draft.email,
    phone: draft.phone ? formatPhone(draft.phone.replace("+40", "0")) : "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors: Errors = {};
  if (!isName(f.firstName)) errors.firstName = "Scrie prenumele (minim 2 litere).";
  if (!isName(f.lastName)) errors.lastName = "Scrie numele de familie.";
  if (!isEmail(f.email)) errors.email = "Adresa de e-mail nu pare corectă.";
  else if (taken.includes(f.email.trim().toLowerCase())) errors.email = "Există deja un cont cu acest e-mail. Intră în cont din ecranul de început.";
  if (!normalizePhone(f.phone)) errors.phone = "Număr de mobil românesc, de forma 07xx xxx xxx.";
  const strength = passwordStrength(f.password);
  if (strength.score < 2 && !(draft.passwordHash && !f.password)) errors.password = "Minim 8 caractere, cu litere și cifre.";

  const err = (k: keyof Errors) => ((touched[k] || submitted) && errors[k]) || null;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    setDraft({
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim().toLowerCase(),
      phone: normalizePhone(f.phone)!,
      passwordHash: f.password ? await hashPassword(f.password) : draft.passwordHash,
    });
    setStep("consents");
  };

  const barColor = ["bg-danger", "bg-danger", "bg-volt/70", "bg-volt"][strength.score];

  return (
    <StepShell
      step={1}
      total={4}
      title="Hai să facem cunoștință"
      subtitle="Datele de bază pentru contul tău. Durează mai puțin de un minut."
      onBack={() => setStep("welcome")}
      footer={
        <Button iconRight={<ArrowRight size={20} />} onClick={submit}>
          Continuă
        </Button>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Stagger i={0}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prenume" placeholder="Andrei" autoComplete="given-name" value={f.firstName} onChange={set("firstName")} onBlur={blur("firstName")} error={err("firstName")} />
            <Field label="Nume" placeholder="Pop" autoComplete="family-name" value={f.lastName} onChange={set("lastName")} onBlur={blur("lastName")} error={err("lastName")} />
          </div>
        </Stagger>
        <Stagger i={1}>
          <Field
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="andrei.pop@gmail.com"
            prefix={<Mail size={19} />}
            value={f.email}
            onChange={set("email")}
            onBlur={blur("email")}
            error={err("email")}
          />
        </Stagger>
        <Stagger i={2}>
          <Field
            label="Telefon"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="0740 123 456"
            prefix={<Phone size={19} />}
            value={f.phone}
            onChange={set("phone")}
            onBlur={blur("phone")}
            error={err("phone")}
            hint="Îl folosim doar pentru anunțuri despre abonament."
          />
        </Stagger>
        <Stagger i={3}>
          <Field
            label="Parolă"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder={draft.passwordHash ? "Parola e salvată" : "Minim 8 caractere"}
            prefix={<Lock size={19} />}
            suffix={
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ascunde parola" : "Arată parola"} className="w-10 h-10 grid place-items-center">
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            value={f.password}
            onChange={set("password")}
            onBlur={blur("password")}
            error={err("password")}
          />
          {f.password && (
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex-1 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-1 flex-1 rounded-full bg-line overflow-hidden">
                    <motion.div className={`h-full ${barColor}`} initial={false} animate={{ width: strength.score > i ? "100%" : "0%" }} transition={{ duration: 0.3 }} />
                  </div>
                ))}
              </div>
              <span className="text-[13px] text-muted w-20 text-right">{strength.label}</span>
            </div>
          )}
        </Stagger>
        <button type="submit" hidden />
      </form>
    </StepShell>
  );
}
