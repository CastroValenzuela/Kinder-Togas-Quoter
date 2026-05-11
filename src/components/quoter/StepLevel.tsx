import { LEVELS, type Level } from "@/lib/pricing";
import { SelectableCard } from "./SelectableCard";

type Props = {
  value?: Level;
  onChange: (l: Level) => void;
};

export function StepLevel({ value, onChange }: Props) {
  return (
    <div>
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Paso 01</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2 text-foreground">
          ¿Para qué nivel escolar?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Elige el nivel para personalizar tu cotización de togas y birretes.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LEVELS.map(({ id, label, icon: Icon }) => (
          <SelectableCard
            key={id}
            selected={value === id}
            onClick={() => onChange(id)}
            ariaLabel={label}
          >
            <div className="flex items-center gap-4">
              <Icon
                className="h-7 w-7 text-navy"
                strokeWidth={1.5}
              />
              <span className="font-display text-xl text-foreground">{label}</span>
            </div>
          </SelectableCard>
        ))}
      </div>
    </div>
  );
}
