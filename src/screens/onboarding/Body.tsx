import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Camera, Lock, Pencil } from "lucide-react";
import { StepShell, Stagger } from "../../components/ui/StepShell";
import { Stepper } from "../../components/ui/Stepper";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../store/useApp";
import { fileToSquareDataUrl } from "../../lib/image";

export function Body() {
  const { profile, account, saveProfile, setStep } = useApp();
  const [photo, setPhoto] = useState(profile.photo);
  const [age, setAge] = useState(profile.age);
  const [height, setHeight] = useState(profile.heightCm);
  const [weight, setWeight] = useState(profile.weightKg);
  const [tried, setTried] = useState(false);
  const [photoErr, setPhotoErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = `${account?.firstName?.[0] ?? ""}${account?.lastName?.[0] ?? ""}`.toUpperCase();

  const errors = {
    age: age == null ? "Adaugă vârsta." : age < 14 || age > 99 ? "Vârsta trebuie să fie între 14 și 99 de ani." : null,
    height: height == null ? "Adaugă înălțimea." : null,
    weight: weight == null ? "Adaugă greutatea." : null,
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setPhotoErr(null);
    try {
      setPhoto(await fileToSquareDataUrl(file));
    } catch {
      setPhotoErr("Poza nu a putut fi încărcată. Încearcă alta.");
    }
  };

  const submit = () => {
    setTried(true);
    if (errors.age || errors.height || errors.weight) return;
    saveProfile({ photo, age, heightCm: height, weightKg: weight });
    setStep("goals");
  };

  return (
    <StepShell
      step={3}
      total={4}
      title="Profilul tău"
      subtitle="Punctul de pornire. De aici îți măsurăm progresul."
      onBack={() => setStep("consents")}
      footer={
        <Button iconRight={<ArrowRight size={20} />} onClick={submit}>
          Continuă
        </Button>
      }
    >
      <Stagger i={0}>
        <div className="flex flex-col items-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => fileRef.current?.click()}
            className="relative w-32 h-32 rounded-full"
            aria-label={photo ? "Schimbă poza de profil" : "Adaugă poză de profil"}
          >
            <motion.span
              aria-hidden
              className="absolute -inset-1.5 rounded-full"
              style={{ background: "conic-gradient(from 0deg, #D4FF3A, #7C5CFF, #D4FF3A)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <span className="absolute inset-0 rounded-full bg-ink p-1">
              <AnimatePresence mode="wait">
                {photo ? (
                  <motion.img key={photo.slice(-20)} src={photo} alt="" className="w-full h-full rounded-full object-cover" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} />
                ) : (
                  <motion.span key="ph" className="w-full h-full rounded-full bg-surface-2 grid place-items-center font-display font-extrabold text-[38px] text-muted">
                    {initials || <Camera size={34} />}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className="absolute bottom-0.5 right-0.5 w-10 h-10 rounded-full bg-volt text-ink grid place-items-center border-4 border-ink">
              {photo ? <Pencil size={16} /> : <Camera size={18} />}
            </span>
          </motion.button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <p className="text-[14px] text-muted mt-3">{photo ? "Arăți bine. Atinge ca să schimbi." : "Adaugă o poză (opțional)"}</p>
          {photoErr && <p className="text-[13px] text-danger mt-1">{photoErr}</p>}
        </div>
      </Stagger>

      <div className="flex flex-col gap-5 mt-7">
        <Stagger i={1}>
          <Stepper label="Vârsta" unit="ani" value={age} placeholder={28} min={14} max={99} onChange={setAge} error={tried ? errors.age : null} />
        </Stagger>
        <Stagger i={2}>
          <Stepper label="Înălțimea" unit="cm" value={height} placeholder={175} min={120} max={230} onChange={setHeight} error={tried ? errors.height : null} />
        </Stagger>
        <Stagger i={3}>
          <Stepper label="Greutatea" unit="kg" value={weight} placeholder={75} min={35} max={250} step={0.5} onChange={setWeight} error={tried ? errors.weight : null} />
        </Stagger>
        <Stagger i={4}>
          <div className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3.5 text-[14px] text-muted leading-snug">
            <Lock size={18} className="text-volt shrink-0 mt-0.5" />
            Doar tu vezi aceste date. Un antrenor le vede numai dacă îi dai tu voie.
          </div>
        </Stagger>
      </div>
    </StepShell>
  );
}
