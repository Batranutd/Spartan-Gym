import { useEffect, useState } from "react";
import { MUSCLE_GROUPS, type MuscleGroup } from "../data/types";
import { Sheet } from "./ui/Sheet";
import { ChipGroup } from "./ui/Chip";
import { Button } from "./ui/Button";

export function GroupPicker({ open, title, value, onClose, onSave, hint }: { open: boolean; title: string; value: MuscleGroup[]; onClose: () => void; onSave: (g: MuscleGroup[]) => void; hint?: string }) {
  const [v, setV] = useState<MuscleGroup[]>(value);
  useEffect(() => {
    if (open) setV(value);
  }, [open, value]);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onSave([])}>
            Zi liberă
          </Button>
          <Button onClick={() => onSave(v)}>Salvează</Button>
        </div>
      }
    >
      <p className="mb-4">{hint ?? "Alege grupele musculare. Poți alege mai multe."}</p>
      <ChipGroup options={MUSCLE_GROUPS} value={v} onChange={(x) => setV(x as MuscleGroup[])} />
    </Sheet>
  );
}
