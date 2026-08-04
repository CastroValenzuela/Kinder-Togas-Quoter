import { motion } from "framer-motion";

const LABELS = ["Nivel", "Servicio", "Configuración", "Tus Datos", "Resumen"];

export function StepperBar({ step }: { step: number }) {
  const pct = ((step - 1) / 4) * 100;
  return (
    <div className="h-[3px] w-full overflow-hidden" style={{ backgroundColor: "#F1F5F9" }}>
      <motion.div
        className="h-full bg-gradient-to-r from-[#B89E69] to-[#C5A85A]"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

export function StepperLabel({ step }: { step: number }) {
  return (
    <p className="text-xs tracking-[0.2em] uppercase text-[#1E2346] font-bold">
      {LABELS[step - 1]}
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
