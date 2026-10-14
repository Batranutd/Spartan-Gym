import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, Lock, Mail } from "lucide-react";
import { Field } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { Emblem } from "../../components/ui/Logo";
import { hashPassword, useApp } from "../../store/useApp";
import { isEmail } from "../../lib/validate";

export function Login() {
  const { account, setStep, login } = useApp();
  const [email, setEmail] = useState(account?.email ?? "");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    setInfo(null);
    if (!isEmail(email)) return setError("Scrie adresa de e-mail.");
    if (!pw) return setError("Scrie parola.");
    if (!account || account.email !== email.trim().toLowerCase()) return setError("Nu există un cont cu acest e-mail. Creează unul nou.");
    if ((await hashPassword(pw)) !== account.passwordHash) return setError("Parola nu e corectă.");
    setError(null);
    login();
  };

  return (
    <div className="h-full flex flex-col">
      <header className="safe-top px-5 shrink-0">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStep("welcome")} aria-label="Înapoi" className="w-11 h-11 -ml-2 rounded-full grid place-items-center">
          <ChevronLeft size={26} />
        </motion.button>
      </header>
      <main className="flex-1 overflow-y-auto px-5">
        <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
          <Emblem size={64} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display font-extrabold text-[32px] mt-5">
          Bine ai revenit
        </motion.h1>
        <p className="text-muted mt-2 text-[16px]">Intră în contul tău de membru.</p>
        <form
          className="flex flex-col gap-5 mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field label="E-mail" type="email" inputMode="email" autoComplete="email" prefix={<Mail size={19} />} placeholder="andrei.pop@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Parolă" type="password" autoComplete="current-password" prefix={<Lock size={19} />} placeholder="Parola ta" value={pw} onChange={(e) => setPw(e.target.value)} />
          <button type="button" onClick={() => setInfo("În versiunea finală primești un link de resetare pe e-mail.")} className="self-start text-[15px] text-volt font-medium">
            Ai uitat parola?
          </button>
          <button type="submit" hidden />
        </form>
        <AnimatePresence>
          {(error || info) && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-5 text-[14px] rounded-2xl p-3 ${error ? "bg-danger/10 text-danger" : "bg-surface-2 text-muted"}`}>
              {error ?? info}
            </motion.p>
          )}
        </AnimatePresence>
      </main>
      <footer className="px-5 pt-3 safe-bottom flex flex-col gap-2">
        <Button onClick={submit}>Intră în cont</Button>
        <Button variant="ghost" onClick={() => setStep("account")}>
          Nu ai cont? Creează unul
        </Button>
      </footer>
    </div>
  );
}
