import { motion } from "framer-motion";

const LABELS = ["Nivel", "Servicio", "Configuración", "Resumen"];

export function StepperBar({ step }: { step: 1 | 2 | 3 | 4 }) {
  const pct = (step / 4) * 100;
  return (
    <div className="h-[3px] w-full overflow-hidden" style={{ backgroundColor: "#E2E8F0" }}>
      <motion.div
        className="h-full"
        style={{ backgroundColor: "#2DD4BF" }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

export function StepperLabel({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <p className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
      Paso {step} de 4
      <span className="mx-2 text-muted-foreground/50">·</span>
      <span className="text-foreground/80">{LABELS[step - 1]}</span>
    </p>
  );
}

// Backwards-compat default export
export function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="w-full">
      <StepperBar step={step} />
      <div className="mt-3">
        <StepperLabel step={step} />
      </div>
    </div>
  );
}
