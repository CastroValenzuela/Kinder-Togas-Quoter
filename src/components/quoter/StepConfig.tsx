import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import {
  CITIES,
  B_VARIANTS,
  PRICES,
  formatMXN,
  type City,
  type PackageChoice,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  city?: City;
  pkg?: PackageChoice;
  quantity: number;
  onCity: (c: City) => void;
  onPkg: (p: PackageChoice) => void;
  onQty: (n: number) => void;
};

export function StepConfig({ city, pkg, quantity, onCity, onPkg, onQty }: Props) {
  const isB = pkg?.kind === "B";

  return (
    <div>
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Paso 03</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2 text-foreground">
          Configura tu cotización
        </h2>
      </header>

      {/* Ciudad */}
      <section className="py-8 border-t border-hairline">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Ciudad
        </p>
        <div className="flex flex-wrap gap-3">
          {CITIES.map((c) => {
            const active = city === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCity(c.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full border text-sm transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "bg-navy text-navy-foreground border-navy"
                    : "border-hairline text-foreground hover:border-navy",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Paquete */}
      <section className="py-8 border-t border-hairline">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Paquete
        </p>

        <div className="space-y-3">
          <PackageRadio
            selected={pkg?.kind === "A"}
            onClick={() => onPkg({ kind: "A" })}
            title="Paquete A — Básico"
            desc="Servicio fotográfico esencial."
            price={PRICES.A}
          />

          <PackageRadio
            selected={isB}
            onClick={() => onPkg({ kind: "B", variant: pkg?.kind === "B" ? pkg.variant : "standard" })}
            title="Paquete B — Personalizado"
            desc="Elige el formato de impresión."
            price={isB ? undefined : PRICES.B_STANDARD}
            priceLabel={isB ? undefined : "desde"}
          />

          <AnimatePresence initial={false}>
            {isB && (
              <motion.div
                key="b-variants"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="pl-4 ml-4 border-l border-hairline space-y-2 pt-3">
                  {B_VARIANTS.map((v) => {
                    const active = pkg?.kind === "B" && pkg.variant === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => onPkg({ kind: "B", variant: v.id })}
                        className={cn(
                          "w-full flex items-center justify-between gap-4 rounded-lg border px-5 py-4 text-left transition-colors",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          active
                            ? "border-navy bg-cream"
                            : "border-hairline hover:border-navy",
                        )}
                      >
                        <div className="flex items-baseline gap-3 min-w-0">
                          <span className="text-[11px] tracking-[0.18em] text-navy font-medium">
                            {v.code}
                          </span>
                          <div className="min-w-0">
                            <p className="font-display text-base text-foreground">{v.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{v.desc}</p>
                          </div>
                        </div>
                        <span className="text-sm tabular-nums text-foreground whitespace-nowrap">
                          {formatMXN(v.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Cantidad */}
      <section className="py-8 border-t border-hairline">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Cantidad de alumnos
        </p>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onQty(Math.max(1, quantity - 1))}
            className="h-11 w-11 rounded-full border border-hairline hover:border-navy flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            className="font-display text-4xl w-24 text-center bg-transparent border-0 focus:outline-none focus:ring-0 tabular-nums"
            aria-label="Cantidad de alumnos"
          />
          <button
            type="button"
            onClick={() => onQty(quantity + 1)}
            className="h-11 w-11 rounded-full border border-hairline hover:border-navy flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Aumentar"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

function PackageRadio({
  selected, onClick, title, desc, price, priceLabel,
}: {
  selected?: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  price?: number;
  priceLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-4 rounded-lg border px-6 py-5 text-left transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected ? "border-navy bg-cream" : "border-hairline hover:border-navy",
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span
          className={cn(
            "h-4 w-4 rounded-full border-2 shrink-0",
            selected ? "border-navy bg-navy ring-2 ring-navy/20" : "border-muted-foreground/40",
          )}
        />
        <div className="min-w-0">
          <p className="font-display text-lg text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      {price !== undefined && (
        <div className="text-right whitespace-nowrap">
          {priceLabel && (
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{priceLabel}</p>
          )}
          <p className="text-sm tabular-nums text-foreground">{formatMXN(price)}</p>
        </div>
      )}
    </button>
  );
}
