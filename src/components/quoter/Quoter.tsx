import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Stepper } from "./Stepper";
import { StepLevel } from "./StepLevel";
import { StepService } from "./StepService";
import { StepConfig } from "./StepConfig";
import { StepSummary } from "./StepSummary";
import {
  unitPrice,
  type Level,
  type ServiceType,
  type City,
  type PackageChoice,
} from "@/lib/pricing";

type Step = 1 | 2 | 3 | 4;

export function Quoter() {
  const [step, setStep] = useState<Step>(1);
  const [level, setLevel] = useState<Level>();
  const [service, setService] = useState<ServiceType>();
  const [city, setCity] = useState<City>();
  const [pkg, setPkg] = useState<PackageChoice>();
  const [quantity, setQuantity] = useState(1);

  const total = useMemo(() => unitPrice(pkg) * quantity, [pkg, quantity]);
  void total;

  const canNext: Record<Step, boolean> = {
    1: !!level,
    2: service === "renta",
    3: !!city && !!pkg && quantity >= 1,
    4: true,
  };

  const goNext = () => {
    if (!canNext[step]) return;
    if (step < 4) setStep((s) => (s + 1) as Step);
  };
  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const wide = step === 3;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header — centered logo + progress bar below */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-hairline">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-3 flex justify-center">
          <div className="font-display text-2xl tracking-tight text-foreground">
            Kinder Togas
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-3">
          <Stepper step={step} />
        </div>
      </header>

      {/* Content */}
      <main className="w-full pt-8 pb-16 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={wide ? "" : "mx-auto max-w-3xl px-4 sm:px-6"}
          >
            {step === 1 && (
              <StepLevel
                value={level}
                onChange={(l) => {
                  setLevel(l);
                  setTimeout(() => setStep(2), 220);
                }}
              />
            )}
            {step === 2 && (
              <StepService
                value={service}
                onChange={(s) => {
                  setService(s);
                  if (s === "renta") setTimeout(() => setStep(3), 220);
                }}
              />
            )}
            {step === 3 && (
              <StepConfig
                city={city}
                pkg={pkg}
                quantity={quantity}
                onCity={setCity}
                onPkg={setPkg}
                onQty={setQuantity}
                canContinue={canNext[3]}
                onContinue={goNext}
              />
            )}
            {step === 4 && (
              <StepSummary level={level} city={city} pkg={pkg} quantity={quantity} />
            )}
          </motion.div>
        </AnimatePresence>

        {step > 1 && (
          <div className={wide ? "mx-auto max-w-6xl px-4 sm:px-6 mt-8" : "mt-12"}>
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
