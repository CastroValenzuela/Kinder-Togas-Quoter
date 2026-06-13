import type { ServiceType, Level } from "@/lib/pricing";
import { SelectableCard } from "./SelectableCard";
import { Package, ShoppingBag } from "lucide-react";

type Props = {
  value?: ServiceType;
  onChange: (s: ServiceType) => void;
  level?: Level;
};

export function StepService({ value, onChange, level }: Props) {
  const isPreescolar = level === "preescolar";

  return (
    <div>
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Paso 02</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2 text-foreground">
          ¿Renta o venta?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Cotiza servicio de renta para todos los niveles, o venta de estolas personalizadas.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectableCard
          selected={value === "renta"}
          onClick={() => onChange("renta")}
          ariaLabel="Renta"
          className="py-10"
        >
          <Package className="h-8 w-8 text-navy" strokeWidth={1.5} />
          <h3 className="font-display text-2xl mt-5">Renta</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Toga, birrete y servicio fotográfico para el evento.
          </p>
        </SelectableCard>

        {isPreescolar ? (
          <SelectableCard
            selected={value === "venta"}
            onClick={() => onChange("venta")}
            ariaLabel="Venta"
            className="py-10"
          >

            <ShoppingBag className="h-8 w-8 text-navy" strokeWidth={1.5} />
            <h3 className="font-display text-2xl mt-5">Venta</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Estolas y birretes personalizados listos para comprar y conservar.
            </p>
          </SelectableCard>
        ) : (
          <SelectableCard disabled ariaLabel="Venta — Solo Preescolar" className="py-10 opacity-70">
            <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.18em] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
              Solo Preescolar
            </span>
            <ShoppingBag className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <h3 className="font-display text-2xl mt-5 text-muted-foreground">Venta</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Venta disponible por ahora solo para Preescolar.
            </p>
          </SelectableCard>
        )}
      </div>
    </div>
  );
}

