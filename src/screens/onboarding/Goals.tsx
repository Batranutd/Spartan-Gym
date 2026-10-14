import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Flame, Mountain, Target, ThumbsUp } from "lucide-react";
import { StepShell, Stagger } from "../../components/ui/StepShell";
import { ChipGroup } from "../../components/ui/Chip";
import { Button } from "../../components/ui/Button";
import { useStore } from "../../store/useStore";
import { GOALS, MUSCLES, SKILLS } from "../../lib/options";

function Section({ icon, title, hint, children, error }: { icon: ReactNode; title: string; hint: string; children: ReactNode; error?: string | null }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-surface-2 grid place-items-center text-volt">{icon}</span>
        <h2 className="font-semibold text-[18px]">{title}</h2>
      </div>
      <p className="text-[14px] text-muted mt-1.5 mb-3.5">{hint}</p>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-danger mt-2">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

export function Goals() {
  const profile = useStore((s) => s.draft);
  const saveProfile = useStore((s) => s.setDraft);
  const setStep = useStore((s) => s.setStep);
  const finishOnboarding = useStore((s) => s.finishOnboarding);
  const [goals, setGoals] = useState(profile.goals);
  const [improve, setImprove] = useState(profile.improve);
  const [strengths, setStrengths] = useState(profile.strengths);
  const [struggles, setStruggles] = useState(profile.struggles);
  const [notes, setNotes] = useState(profile.notes);
  const [tried, setTried] = useState(false);

  const goalErr = goals.length === 0 ? "Alege cel puțin un scop." : null;

  const submit = () => {
    setTried(true);
    if (goalErr) return document.getElementById("goals-top")?.scrollIntoView({ behavior: "smooth" });
    saveProfile({ goals, improve, strengths, struggles, notes: notes.trim() });
    finishOnboarding();
  };

  return (
    <StepShell
      step={4}
      total={4}
      title="Ce vrei să obții?"
      subtitle="Așa îți pregătim planul și te pot ajuta antrenorii."
      onBack={() => setStep("body")}
      footer={
        <Button icon={<Check size={20} strokeWidth={3} />} onClick={submit}>
          Gata, creează profilul
        </Button>
      }
    >
      <div id="goals-top" />
      <Stagger i={0}>
        <Section icon={<Target size={19} />} title="Scopul principal" hint={`Alege până la 3. Ai ales ${goals.length}/3.`} error={tried ? goalErr : null}>
          <ChipGroup options={GOALS} value={goals} onChange={setGoals} max={3} />
        </Section>
      </Stagger>
      <Stagger i={1}>
        <Section icon={<Mountain size={19} />} title="Ce vrei să îmbunătățești" hint="Zonele pe care vrei să pui accent.">
          <ChipGroup options={MUSCLES} value={improve} onChange={setImprove} />
        </Section>
      </Stagger>
      <Stagger i={2}>
        <Section icon={<ThumbsUp size={19} />} title="La ce te descurci bine" hint="Punctele tale forte.">
          <ChipGroup options={SKILLS} value={strengths} onChange={setStrengths} tone="violet" />
        </Section>
      </Stagger>
      <Stagger i={3}>
        <Section icon={<Flame size={19} />} title="Ce ți se pare cel mai greu" hint="Fii sincer, asta ajută cel mai mult.">
          <ChipGroup options={SKILLS} value={struggles} onChange={setStruggles} />
        </Section>
      </Stagger>
      <Stagger i={4}>
        <label className="block text-[14px] text-muted mb-2 font-medium" htmlFor="notes">
          Altceva ce ar trebui să știm? (opțional)
        </label>
        <textarea
          id="notes"
          rows={3}
          maxLength={300}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="De exemplu: vin dimineața înainte de muncă, am mai mers la sală acum 2 ani."
          className="w-full rounded-2xl bg-surface-2 border border-line focus:border-volt outline-none p-4 resize-none placeholder:text-faint leading-relaxed"
        />
        <div className="text-right text-[12px] text-faint mt-1 tabular">{notes.length}/300</div>
      </Stagger>
    </StepShell>
  );
}
