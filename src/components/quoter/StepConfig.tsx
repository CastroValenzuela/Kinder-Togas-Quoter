import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ArrowRight, Camera, Shirt, Sparkles, Layers } from "lucide-react";
import gownImg from "@/assets/gown-showcase.jpg";

import preescolarBalance from "@/assets/Preescolar/balance.jpg";

import preescolarNegroAzul from "@/assets/Preescolar/Paquete A/negro-azul.jpg";
import preescolarNegroDorado from "@/assets/Preescolar/Paquete A/negro-dorado.jpg";
import preescolarNegroPlata from "@/assets/Preescolar/Paquete A/negro-plata.jpg";
import preescolarNegroRojo from "@/assets/Preescolar/Paquete A/negro-rojo.jpg";

import preescolarAzulAzul from "@/assets/Preescolar/Paquete A/azul-azul.jpg";
import preescolarAzulDorado from "@/assets/Preescolar/Paquete A/azul-dorado.jpg";
import preescolarAzulPlata from "@/assets/Preescolar/Paquete A/azul-plata.jpg";
import preescolarAzulRojo from "@/assets/Preescolar/Paquete A/azul-rojo.jpg";

import preescolarVerdeAzul from "@/assets/Preescolar/Paquete A/verde-azul.jpg";
import preescolarVerdeDorado from "@/assets/Preescolar/Paquete A/verde-dorado.jpg";
import preescolarVerdePlata from "@/assets/Preescolar/Paquete A/verde-plata.jpg";
import preescolarVerdeRojo from "@/assets/Preescolar/Paquete A/verde-rojo.jpg";

import preescolarTurquesaAzul from "@/assets/Preescolar/Paquete A/turquesa-turquesa.jpg";
import preescolarTurquesaDorado from "@/assets/Preescolar/Paquete A/turquesa-dorado.jpg";
import preescolarTurquesaPlata from "@/assets/Preescolar/Paquete A/turquesa-plata.jpg";
import preescolarTurquesaRojo from "@/assets/Preescolar/Paquete A/turquesa-rojo.jpg";

import preescolarRojoAzul from "@/assets/Preescolar/Paquete A/rojo-azul.jpg";
import preescolarRojoDorado from "@/assets/Preescolar/Paquete A/rojo-dorado.jpg";
import preescolarRojoPlata from "@/assets/Preescolar/Paquete A/rojo-plata.jpg";
import preescolarRojoRojo from "@/assets/Preescolar/Paquete A/rojo-rojo.jpg";

import preescolarPremium from "@/assets/Preescolar/premium.jpg";

const preescolarNegro = preescolarNegroDorado;
const preescolarAzul = preescolarAzulDorado;
const preescolarMagenta = preescolarTurquesaDorado;
const preescolarVerde = preescolarVerdeDorado;
const preescolarRojo = preescolarRojoDorado;

import primariaAzul from "@/assets/Primaria/azul.jpg";
import primariaBalance from "@/assets/Primaria/balance.jpg";
import primariaMagenta from "@/assets/Primaria/magenta.jpg";
import primariaNegro from "@/assets/Primaria/negro.jpg";
import primariaPremium from "@/assets/Primaria/premium.jpg";
import primariaRojo from "@/assets/Primaria/rojo.jpg";
import primariaVerde from "@/assets/Primaria/verde.jpg";

import {
  CITIES,
  B_VARIANTS,
  PRICES,
  TOGA_COLORS,
  STOLA_COLORS,
  formatMXN,
  unitPrice,
  type City,
  type PackageChoice,
  type PackageBVariant,
  type Level,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  level?: Level;
  service?: "renta" | "venta";
  city?: City;
  pkg?: PackageChoice;
  quantity: number;
  togaColor: string;
  stolaColor: string;
  onCity: (c: City) => void;
  onPkg: (p: PackageChoice) => void;
  onQty: (n: number) => void;
  onTogaColor: (color: string) => void;
  onStolaColor: (color: string) => void;
  canContinue: boolean;
  onContinue: () => void;
};

const FEATURES_A = [
  { icon: Camera, text: "Impresión combinada 9×12 cm." },
  { icon: Shirt, text: "Renta de toga, birrete y borla del año." },
  { icon: Sparkles, text: "Entrega y recolección coordinadas." },
];

const FEATURES_B: Record<"hybrid" | "max", { icon: typeof Camera; text: string }[]> = {
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

const FEATURES_B_SEC: Record<"sec_a" | "sec_b", { icon: typeof Camera; text: string }[]> = {
  sec_a: [
    { icon: Camera, text: "Impresión mixta: institucional + datos discretos." },
    { icon: Shirt, text: "Toga, birrete, borla y estola personalizada." },
    { icon: Sparkles, text: "Presencia visual con equilibrio formal." },
  ],
  sec_b: [
    { icon: Camera, text: "Impresión discreta, sobria en ambos lados." },
    { icon: Shirt, text: "Toga, birrete, borla y estola personalizada." },
    { icon: Sparkles, text: "Recomendado para colegios de imagen clásica." },
  ],
};

const FEATURES_B_PRI: Record<"pri_a" | "pri_b" | "pri_c", { icon: typeof Camera; text: string }[]> = {
  pri_a: [
    { icon: Camera, text: "Impresión grande en ambos lados (alta visibilidad)." },
    { icon: Shirt, text: "Toga, birrete, borla y estola representativa." },
    { icon: Sparkles, text: "Ideal para eventos oficiales y fotos grupales." },
  ],
  pri_b: [
    { icon: Camera, text: "Nombre grande + generación en tamaño discreto." },
    { icon: Shirt, text: "Toga, birrete, borla y estola armónica." },
    { icon: Sparkles, text: "Diseño limpio y ordenado, elegancia visual." },
  ],
  pri_c: [
    { icon: Camera, text: "Impresión sencilla y clara en ambos lados." },
    { icon: Shirt, text: "Toga, birrete, borla y estola básica funcional." },
    { icon: Layers, text: "Ideal para grupos grandes o presupuestos ajustados." },
  ],
};

const FEATURES_UNI_A = [
  { icon: Shirt, text: "Renta de toga y birrete (incluida)." },
  { icon: Sparkles, text: "Estola personalizada por IMPRESIÓN (DTF o sublimación)." },
];

const FEATURES_UNI_B = [
  { icon: Shirt, text: "Renta de toga y birrete (incluida)." },
  { icon: Layers, text: "Estola personalizada con BORDADO." },
];

export function StepConfig({
  level, service, city, pkg, quantity, togaColor, stolaColor, onCity, onPkg, onQty, onTogaColor, onStolaColor, canContinue, onContinue,
}: Props) {
  const isB = pkg?.kind === "B";
  const isSecundaria = level === "secundaria";
  const isPrimaria = level === "primaria";
  const isUni = level === "universidad" || level === "posgrado";
  
  // Filtrar variantes según el nivel
  const visibleVariants = B_VARIANTS.filter((v) => {
    if (isSecundaria) return v.id.startsWith("sec_");
    if (isPrimaria) return v.id.startsWith("pri_");
    return !v.id.startsWith("sec_") && !v.id.startsWith("pri_") && !v.id.startsWith("uni_");
  });

  let features = FEATURES_A;
  if (isUni) {
    features = pkg?.kind === "A" ? FEATURES_UNI_A : FEATURES_UNI_B;
  } else if (pkg?.kind === "B") {
    if (pkg.variant.startsWith("sec_")) {
      features = FEATURES_B_SEC[pkg.variant as "sec_a" | "sec_b"] || FEATURES_A;
    } else if (pkg.variant.startsWith("pri_")) {
      features = FEATURES_B_PRI[pkg.variant as "pri_a" | "pri_b" | "pri_c"] || FEATURES_A;
    } else {
      features = FEATURES_B[pkg.variant as "hybrid" | "max"] || FEATURES_A;
    }
  }

  const total = unitPrice(pkg, level) * quantity;

  // Get dynamic image showcase based on level and selected configuration
  const showcaseImage = useMemo(() => {
    if (level === "preescolar") {
      if (pkg?.kind === "A") {
        if (togaColor === "azul") {
          if (stolaColor === "dorada") return preescolarAzulDorado;
          if (stolaColor === "plateada") return preescolarAzulPlata;
          if (stolaColor === "azul") return preescolarAzulAzul;
          if (stolaColor === "roja") return preescolarAzulRojo;
          return preescolarAzul;
        }
        if (togaColor === "magenta") {
          if (stolaColor === "dorada") return preescolarTurquesaDorado;
          if (stolaColor === "plateada") return preescolarTurquesaPlata;
          if (stolaColor === "azul") return preescolarTurquesaAzul;
          if (stolaColor === "roja") return preescolarTurquesaRojo;
          return preescolarMagenta;
        }
        if (togaColor === "rojo") {
          if (stolaColor === "dorada") return preescolarRojoDorado;
          if (stolaColor === "plateada") return preescolarRojoPlata;
          if (stolaColor === "azul") return preescolarRojoAzul;
          if (stolaColor === "roja") return preescolarRojoRojo;
          return preescolarRojo;
        }
        if (togaColor === "verde") {
          if (stolaColor === "dorada") return preescolarVerdeDorado;
          if (stolaColor === "plateada") return preescolarVerdePlata;
          if (stolaColor === "azul") return preescolarVerdeAzul;
          if (stolaColor === "roja") return preescolarVerdeRojo;
          return preescolarVerde;
        }
        
        // stolaColor specific check for black toga
        if (stolaColor === "dorada") return preescolarNegroDorado;
        if (stolaColor === "plateada") return preescolarNegroPlata;
        if (stolaColor === "azul") return preescolarNegroAzul;
        if (stolaColor === "roja") return preescolarNegroRojo;
        
        return preescolarNegro;
      } else if (pkg?.kind === "B") {
        if (pkg.variant === "hybrid") return preescolarBalance;
        if (pkg.variant === "max") return preescolarPremium;
        return preescolarNegro; // fallback
      }
    } else if (level === "primaria") {
      if (pkg?.kind === "A") {
        if (togaColor === "azul") return primariaAzul;
        if (togaColor === "magenta") return primariaMagenta;
        if (togaColor === "rojo") return primariaRojo;
        if (togaColor === "verde") return primariaVerde;
        return primariaNegro;
      } else if (pkg?.kind === "B") {
        if (pkg.variant === "pri_b") return primariaBalance;
        if (pkg.variant === "pri_a") return primariaPremium;
        return primariaNegro; // fallback for pri_c
      }
    }
    return gownImg; // default generic fallback for other levels
  }, [level, pkg, togaColor, stolaColor]);

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
          {/* LEFT — Visual showcase */}
          <div className="relative bg-cream/60 lg:sticky lg:top-0 lg:self-start">
            <div className="aspect-[4/5] lg:aspect-auto lg:h-[680px] w-full overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={showcaseImage}
                  src={showcaseImage}
                  alt="Toga de graduación premium con estola"
                  width={896}
                  height={1152}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — Control panel */}
          <div className="p-6 sm:p-10 space-y-10">
            {/* Ciudad — Only for Renta */}
            {service === "renta" && (
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
                          "px-5 py-2 rounded-full border text-sm transition-all cursor-pointer",
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
            )}

            {/* Paquete — segmented */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                Paquete
              </p>
              <div className="relative inline-flex w-full rounded-full border border-hairline bg-muted/40 p-1">
                {(["A", "B"] as const).map((k) => {
                  const active = pkg?.kind === k;
                  const label = k === "A" 
                    ? (isUni ? "Opción A — Impresión" : "Paquete A — Básico") 
                    : (isUni ? "Opción B — Bordado" : "Paquete B — Personalizado");
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() =>
                        onPkg(
                          k === "A"
                            ? { kind: "A" }
                            : { kind: "B", variant: isSecundaria ? "sec_b" : isPrimaria ? "pri_a" : isUni ? "uni_b" : "hybrid" },
                        )
                      }
                      className="relative flex-1 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                {isB && !isUni && (
                  <motion.div
                    key="b-variants"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-2.5">
                      {visibleVariants.map((v) => {
                        const active = pkg?.kind === "B" && pkg.variant === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => onPkg({ kind: "B", variant: v.id })}
                            className={cn(
                              "w-full flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors cursor-pointer",
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
                            <span className="font-sans font-semibold text-base tabular-nums text-foreground whitespace-nowrap">
                              {formatMXN(v.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Package price hint */}
              {(pkg?.kind === "A" || (pkg?.kind === "B" && isUni)) && (
                <div className="pt-4">
                  {pkg?.kind === "A" && !isUni ? (
                    <div className="w-full flex items-center justify-between gap-4 rounded-xl border border-navy bg-cream px-4 py-3.5 text-left">
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className="text-[10px] tracking-[0.18em] text-navy font-semibold w-8 shrink-0">
                          A
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">Básico</p>
                          <p className="text-xs text-muted-foreground truncate">9×12 cm en ambos lados</p>
                        </div>
                      </div>
                      <span className="font-sans font-semibold text-base tabular-nums text-foreground whitespace-nowrap">
                        {formatMXN(unitPrice(pkg, level))}
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-navy bg-cream px-4 py-3.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Precio por alumno</span>
                      <span className="font-sans font-semibold text-base tabular-nums text-foreground">
                        {formatMXN(unitPrice(pkg, level))}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Color de Toga — Only for Paquete A and levels Preescolar/Primaria */}
            {pkg?.kind === "A" && (level === "preescolar" || level === "primaria") && (
              <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                  Color de Toga
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {TOGA_COLORS.map((c) => {
                    const active = togaColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onTogaColor(c.id)}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-medium transition-all cursor-pointer relative",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-navy bg-cream text-foreground"
                            : "border-hairline text-foreground/80 hover:border-navy/40",
                        )}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0 block"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Color de Estola — Only for Preescolar */}
            {level === "preescolar" && (
              <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                  Color de Estola
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {STOLA_COLORS.map((s) => {
                    const active = stolaColor === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onStolaColor(s.id)}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-medium transition-all cursor-pointer relative",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-navy bg-cream text-foreground"
                            : "border-hairline text-foreground/80 hover:border-navy/40",
                        )}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0 block"
                          style={{ backgroundColor: s.hex }}
                        />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground/50 mt-2.5 italic leading-relaxed">
                  Nota: La estola será confeccionada en el color seleccionado; las imágenes de muestra representan el estilo general del paquete.
                </p>
              </section>
            )}

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
              <p className="font-sans font-semibold text-2xl sm:text-3xl text-foreground tabular-nums leading-tight">
                {formatMXN(total)}{" "}
                <span className="text-xs font-sans text-muted-foreground">MXN</span>
              </p>
            </div>

            <div className="flex items-center gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={() => onQty(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-full border border-hairline hover:border-navy/50 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
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
                className="font-sans font-semibold text-xl w-14 text-center bg-transparent border-0 focus:outline-none focus:ring-0 tabular-nums"
                aria-label="Cantidad de alumnos"
              />
              <button
                type="button"
                onClick={() => onQty(quantity + 1)}
                className="h-10 w-10 rounded-full border border-hairline hover:border-navy/50 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                aria-label="Aumentar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy text-navy-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
