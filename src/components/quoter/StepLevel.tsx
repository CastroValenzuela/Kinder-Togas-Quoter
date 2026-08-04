import { LEVELS, type Level } from "@/lib/pricing";
import { SelectableCard } from "./SelectableCard";

type Props = {
  value?: Level;
  onChange: (l: Level) => void;
};

export function StepLevel({ value, onChange }: Props) {
  return (
    <div>
      <header className="mb-8 sm:mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#C5A85A] font-bold">PASO 01</p>
        <h2 className="font-serif text-3xl sm:text-4xl mt-2 text-[#1E2346] font-bold tracking-tight">
          ¿Para qué nivel escolar?
        </h2>
        <p className="mt-2.5 text-[#64748B] text-sm sm:text-base font-normal">
          Elige el nivel para personalizar tu cotización de togas y birretes.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {LEVELS.map(({ id, label, icon: Icon }) => (
          <SelectableCard
            key={id}
            selected={value === id}
            onClick={() => onChange(id)}
            ariaLabel={label}
          >
            <div className="flex items-center gap-4">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-[#1E2346]" strokeWidth={1.5} />
              <span className="font-serif text-lg sm:text-xl font-medium text-[#1E2346] leading-snug">{label}</span>
            </div>
          </SelectableCard>
        ))}
      </div>
    </div>
  );
}
