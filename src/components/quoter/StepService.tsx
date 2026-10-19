import type { ServiceType, Level } from "@/lib/pricing";
import { SelectableCard } from "./SelectableCard";
import { Package, ShoppingBag } from "lucide-react";

type Props = {
  value?: ServiceType;
  onChange: (s: ServiceType) => void;
  level?: Level;
};

export function StepService({ value, onChange }: Props) {
  return (
    <div>
      <header className="mb-8 sm:mb-10">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1E2346] font-bold tracking-tight">
          ¿Renta o venta?
        </h2>
        <p className="mt-2.5 text-[#64748B] text-sm sm:text-base font-normal">
          Selecciona si deseas rentar togas para el evento o comprar paquetes y recuerdos de graduación.
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
            Toga, birrete y servicio para el evento escolar.
          </p>
        </SelectableCard>

        <SelectableCard
          selected={value === "venta"}
          onClick={() => onChange("venta")}
          ariaLabel="Venta"
          className="py-8 sm:py-10"
        >
          <ShoppingBag className="h-8 w-8 text-[#1E2346]" strokeWidth={1.5} />
          <h3 className="font-serif text-2xl mt-4 font-bold text-[#1E2346]">Venta</h3>
          <p className="mt-2 text-sm text-[#64748B]">
            Togas infantiles, estolas y recuerdos listos para comprar y conservar.
          </p>
        </SelectableCard>
      </div>
    </div>
  );
}
