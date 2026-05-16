import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ArrowRight, Camera, Shirt, Sparkles, Layers } from "lucide-react";
import gownImg from "@/assets/gown-showcase.jpg";
import {
  CITIES,
  B_VARIANTS,
  PRICES,
  formatMXN,
  unitPrice,
  type City,
  type PackageChoice,
  type PackageBVariant,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  city?: City;
  pkg?: PackageChoice;
  quantity: number;
  onCity: (c: City) => void;
  onPkg: (p: PackageChoice) => void;
  onQty: (n: number) => void;
  canContinue: boolean;
  onContinue: () => void;
};

const FEATURES_A = [
  { icon: Camera, text: "Sesión fotográfica esencial en estudio." },
  { icon: Shirt, text: "Renta de toga, birrete y borla del año." },
  { icon: Sparkles, text: "Entrega y recolección coordinadas." },
];

const FEATURES_B: Record<PackageBVariant, { icon: typeof Camera; text: string }[]> = {
  standard: [
    { icon: Camera, text: "Impresión 9×12 cm en ambos lados (sin diseño)." },
    { icon: Shirt, text: "Toga premium, birrete, borla del año y estola." },
    { icon: Layers, text: "Acabado mate sobre papel fotográfico profesional." },
  ],
  hybrid: [
    { icon: Camera, text: "Impresión combinada 9×12 cm + 9×35 cm panorámica." },
    { icon: Shirt, text: "Toga premium, birrete, borla del año y estola." },
    { icon: Layers, text: "Formato híbrido: retrato + panorámica del grupo." },
  ],
  max: [
    { icon: Camera, text: "Impresión 9×35 cm panorámica en ambos lados." },
    { icon: Shirt, text: "Toga premium, birrete, borla del año y estola." },
    { icon: Layers, text: "Máxima calidad de impresión profesional." },
  ],
};

const STOLE_COLORS = ["#112244", "#7c1d1d", "#2f5d3a", "#8a6d3b", "#3b3b3b"];

export function StepConfig({
  city, pkg, quantity, onCity, onPkg, onQty, canContinue, onContinue,
}: Props) {
  const isB = pkg?.kind === "B";
  const features = !pkg
    ? FEATURES_A
    : pkg.kind === "A"
      ? FEATURES_A
      : FEATURES_B[pkg.variant];
  const total = unitPrice(pkg) * quantity;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="mb-8 sm:mb-10">
        <h2 className="font-display text-3xl sm:text-4xl text-foreground tracking-tight">
          Configura tu cotización
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Personaliza ciudad, paquete y cantidad. El total se actualiza en vivo.
        </p>
      </header>

      <div className="rounded-2xl border border-hairline bg-card overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_50px_-30px_rgba(17,34,68,0.18)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
          {/* LEFT — Visual showcase */}
          <div className="relative bg-cream/60 lg:sticky lg:top-0 lg:self-start">
            <div className="aspect-[4/5] lg:aspect-auto lg:h-[680px] w-full overflow-hidden">
              <img
                src={gownImg}
                alt="Toga de graduación premium con estola"
                width={896}
                height={1152}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === 0 ? "w-6 bg-navy" : "w-1.5 bg-foreground/20",
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2.5">
                {STOLE_COLORS.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Color de estola ${i + 1}`}
                    className={cn(
                      "h-5 w-5 rounded-full ring-1 ring-foreground/10 transition-transform hover:scale-110",
                      i === 0 && "ring-2 ring-offset-2 ring-navy",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Control panel */}
          <div className="p-6 sm:p-10 space-y-10">
            {/* Ciudad */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                Ciudad
              </p>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => {
                  const active = city === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onCity(c.id)}
                      className={cn(
                        "px-5 py-2 rounded-full border text-sm transition-all",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        active
                          ? "bg-navy text-navy-foreground border-navy"
                          : "border-hairline text-foreground hover:border-navy/40",
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Paquete — segmented */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                Paquete
              </p>
              <div className="relative inline-flex w-full rounded-full border border-hairline bg-muted/40 p-1">
                {(["A", "B"] as const).map((k) => {
                  const active = pkg?.kind === k;
                  const label = k === "A" ? "Paquete A — Básico" : "Paquete B — Personalizado";
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() =>
                        onPkg(
                          k === "A"
                            ? { kind: "A" }
                            : { kind: "B", variant: pkg?.kind === "B" ? pkg.variant : "standard" },
                        )
                      }
                      className="relative flex-1 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {active && (
                        <motion.span
                          layoutId="segmented-pill"
                          className="absolute inset-0 rounded-full bg-navy"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={cn("relative", active ? "text-navy-foreground" : "text-foreground/70")}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Variants */}
              <AnimatePresence initial={false} mode="wait">
                {isB && (
                  <motion.div
                    key="b-variants"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-2.5">
                      {B_VARIANTS.map((v) => {
                        const active = pkg?.kind === "B" && pkg.variant === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => onPkg({ kind: "B", variant: v.id })}
                            className={cn(
                              "w-full flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              active
                                ? "border-navy bg-cream"
                                : "border-hairline hover:border-navy/40",
                            )}
                          >
                            <div className="flex items-baseline gap-3 min-w-0">
                              <span className="text-[10px] tracking-[0.18em] text-navy font-semibold w-8 shrink-0">
                                {v.code}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">{v.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{v.desc}</p>
                              </div>
                            </div>
                            <span className="font-display text-base tabular-nums text-foreground whitespace-nowrap">
                              {formatMXN(v.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Paquete A price hint */}
              {pkg?.kind === "A" && (
                <div className="pt-4">
                  <div className="rounded-xl border border-navy bg-cream px-4 py-3.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Precio por alumno</span>
                    <span className="font-display text-base tabular-nums text-foreground">
                      {formatMXN(PRICES.A)}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Features */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                Incluye
              </p>
              <ul className="space-y-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 h-8 w-8 rounded-full border border-hairline flex items-center justify-center shrink-0">
                      <f.icon className="h-4 w-4 text-navy" strokeWidth={1.5} />
                    </span>
                    <span className="text-sm text-foreground/80 leading-relaxed pt-1">
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-hairline bg-background/95 backdrop-blur sticky bottom-0 z-30">
          <div className="px-6 sm:px-10 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Total estimado
              </p>
              <p className="font-display text-2xl sm:text-3xl text-foreground tabular-nums leading-tight">
                {formatMXN(total)}{" "}
                <span className="text-xs font-sans text-muted-foreground">MXN</span>
              </p>
            </div>

            <div className="flex items-center gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={() => onQty(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-full border border-hairline hover:border-navy/50 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Disminuir"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  onQty(Number.isFinite(n) && n >= 1 ? n : 1);
                }}
                className="font-display text-xl w-14 text-center bg-transparent border-0 focus:outline-none focus:ring-0 tabular-nums"
                aria-label="Cantidad de alumnos"
              />
              <button
                type="button"
                onClick={() => onQty(quantity + 1)}
                className="h-10 w-10 rounded-full border border-hairline hover:border-navy/50 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Aumentar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy text-navy-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
