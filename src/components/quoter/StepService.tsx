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
      <header className="mb-8 sm:mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#C5A85A] font-bold">PASO 02</p>
        <h2 className="font-serif text-3xl sm:text-4xl mt-2 text-[#1E2346] font-bold tracking-tight">
          ¿Renta o venta?
        </h2>
        <p className="mt-2.5 text-[#64748B] text-sm sm:text-base font-normal">
          Cotiza servicio de renta para todos los niveles, o venta de estolas personalizadas.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectableCard
          selected={value === "renta"}
          onClick={() => onChange("renta")}
          ariaLabel="Renta"
          className="py-8 sm:py-10"
        >
          <Package className="h-8 w-8 text-[#1E2346]" strokeWidth={1.5} />
          <h3 className="font-serif text-2xl mt-4 font-bold text-[#1E2346]">Renta</h3>
          <p className="mt-2 text-sm text-[#64748B]">
            Toga, birrete y servicio fotográfico para el evento.
          </p>
        </SelectableCard>

        {isPreescolar ? (
          <SelectableCard
            selected={value === "venta"}
            onClick={() => onChange("venta")}
            ariaLabel="Venta"
            className="py-8 sm:py-10"
          >
            <ShoppingBag className="h-8 w-8 text-[#1E2346]" strokeWidth={1.5} />
            <h3 className="font-serif text-2xl mt-4 font-bold text-[#1E2346]">Venta</h3>
            <p className="mt-2 text-sm text-[#64748B]">
              Estolas y birretes personalizados listos para comprar y conservar.
            </p>
          </SelectableCard>
        ) : (
          <SelectableCard disabled ariaLabel="Venta — Solo Preescolar" className="py-8 sm:py-10 opacity-70">
            <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.18em] text-[#C5A85A] bg-[#FDFBF7] border border-[#C5A85A]/30 rounded-full px-2.5 py-1 font-bold">
              Solo Preescolar
            </span>
            <ShoppingBag className="h-8 w-8 text-[#64748B]" strokeWidth={1.5} />
            <h3 className="font-serif text-2xl mt-4 font-bold text-[#64748B]">Venta</h3>
            <p className="mt-2 text-sm text-[#64748B]">
              Venta disponible por ahora solo para Preescolar.
            </p>
          </SelectableCard>
        )}
      </div>
    </div>
  );
}
