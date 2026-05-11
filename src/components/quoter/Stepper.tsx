import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: "01", label: "Nivel" },
  { n: "02", label: "Servicio" },
  { n: "03", label: "Configuración" },
  { n: "04", label: "Resumen" },
];

export function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="w-full">
      <div className="flex gap-2 sm:gap-3">
        {STEPS.map((s, i) => {
          const idx = i + 1;
          const state =
            idx < step ? "done" : idx === step ? "active" : "pending";
          return (
            <div key={s.n} className="flex-1 relative">
              <div className="h-[2px] w-full overflow-hidden bg-hairline">
                {state !== "pending" && (
                  <motion.div
                    layoutId={state === "active" ? `progress-${idx}` : undefined}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                    className={cn(
                      "h-full",
                      state === "active" ? "bg-navy" : "bg-muted-foreground/60",
                    )}
                  />
                )}
              </div>
              <div className="mt-3 hidden sm:flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-[10px] tracking-[0.2em] font-medium",
                    state === "active" && "text-navy",
                    state === "done" && "text-muted-foreground",
                    state === "pending" && "text-muted-foreground/60",
                  )}
                >
                  {s.n}
                </span>
                <span
                  className={cn(
                    "text-xs uppercase tracking-[0.18em]",
                    state === "active" && "text-foreground font-medium",
                    state === "done" && "text-muted-foreground",
                    state === "pending" && "text-muted-foreground/60",
                  )}
                >
                  {s.label}
                </span>
              </div>
              <div className="mt-2 sm:hidden flex justify-center">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    state === "active" && "bg-navy",
                    state === "done" && "bg-muted-foreground/60",
                    state === "pending" && "bg-hairline",
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
