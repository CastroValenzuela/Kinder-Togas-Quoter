import type { ServiceType } from "@/lib/pricing";
import { SelectableCard } from "./SelectableCard";
import { Package, ShoppingBag } from "lucide-react";

type Props = {
  value?: ServiceType;
  onChange: (s: ServiceType) => void;
};

export function StepService({ value, onChange }: Props) {
  return (
    <div>
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Paso 02</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2 text-foreground">
          ¿Renta o venta?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Por ahora solo cotizamos servicio de renta.
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

        <SelectableCard disabled ariaLabel="Venta — próximamente" className="py-10">
          <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.18em] text-navy bg-cream border border-navy/20 rounded-full px-2.5 py-1">
            Próximamente
          </span>
          <ShoppingBag className="h-8 w-8 text-foreground" strokeWidth={1.5} />
          <h3 className="font-display text-2xl mt-5">Venta</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Disponible próximamente.
          </p>
        </SelectableCard>
      </div>
    </div>
  );
}
