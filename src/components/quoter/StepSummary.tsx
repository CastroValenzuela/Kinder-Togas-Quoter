import { Download, Mail } from "lucide-react";
import {
  formatMXN,
  unitPrice,
  packageLabel,
  levelLabel,
  cityLabel,
  type Level,
  type City,
  type PackageChoice,
} from "@/lib/pricing";
import { generateQuotePDF } from "@/lib/quote-pdf";
import { useState } from "react";
import { EmailModal } from "./EmailModal";

type Props = {
  level?: Level;
  city?: City;
  pkg?: PackageChoice;
  quantity: number;
};

export function StepSummary({ level, city, pkg, quantity }: Props) {
  const [emailOpen, setEmailOpen] = useState(false);
  const unit = unitPrice(pkg);
  const total = unit * quantity;

  const rows = [
    ["Nivel escolar", levelLabel(level)],
    ["Ciudad", cityLabel(city)],
    ["Paquete", packageLabel(pkg)],
    ["Precio unitario", formatMXN(unit)],
    ["Cantidad de alumnos", String(quantity)],
  ];

  return (
    <div>
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Paso 04</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2 text-foreground">
          Resumen de tu cotización
        </h2>
      </header>

      <div className="border-t border-hairline">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-6 py-4 border-b border-hairline">
            <span className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{k}</span>
            <span className="text-base text-foreground text-right">{v}</span>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-6 pt-8 pb-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Total</span>
          <span className="font-display text-4xl sm:text-5xl text-navy tabular-nums">
            {formatMXN(total)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-right">Cotización válida 15 días.</p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => generateQuotePDF({ level, city, pkg, quantity })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy text-navy-foreground px-7 py-3.5 text-sm font-medium hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Download className="h-4 w-4" /> Descargar PDF
        </button>
        <button
          type="button"
          onClick={() => setEmailOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-navy text-navy px-7 py-3.5 text-sm font-medium hover:bg-cream transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Mail className="h-4 w-4" /> Enviar por Email
        </button>
      </div>

      <EmailModal
        open={emailOpen}
        onOpenChange={setEmailOpen}
        quote={{ level, city, pkg, quantity }}
      />
    </div>
  );
}
