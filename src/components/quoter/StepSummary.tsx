import { Download, Facebook, Loader2, Mail, MessageCircle, ShieldCheck, Star, Truck, UserCheck, Users } from "lucide-react";
import {
  formatMXN,
  unitPrice,
  packageLabel,
  levelLabel,
  cityLabel,
  formatDate,
  colorLabel,
  stolaLabel,
  type Level,
  type City,
  type PackageChoice,
} from "@/lib/pricing";
import { generateQuotePDF } from "@/lib/quote-pdf";
import { useState } from "react";

type Props = {
  level?: Level;
  city?: City;
  pkg?: PackageChoice;
  quantity: number;
  school: string;
  contact: string;
  phone: string;
  date: string;
  email: string;
  quoteNumber?: string;
  togaColor?: string;
  stolaColor?: string;
  onEditStep?: (step: 1 | 2 | 3 | 4 | 5) => void;
  service?: "renta" | "venta";
};

export function StepSummary({ level, city, pkg, quantity, school, contact, phone, date, email, quoteNumber, service, togaColor, stolaColor, onEditStep }: Props) {
  const unit = unitPrice(pkg);
  const total = unit * quantity;

  const rows = [
    { label: "Folio de Cotización", value: quoteNumber || "Generando...", step: null },
    { label: "Institución", value: school, step: 4 },
    { label: "Solicitante", value: contact, step: 4 },
    { label: "Nivel escolar", value: levelLabel(level), step: 1 },
    { label: "Servicio", value: service === "renta" ? "Renta" : "Venta", step: 2 },
    { label: "Ciudad", value: cityLabel(city), step: 3 },
    { label: "Paquete", value: packageLabel(pkg, level), step: 3 },
    { label: "Precio unitario", value: formatMXN(unit), step: 3 },
    { label: "Cantidad de alumnos", value: String(quantity), step: 3 },
    { label: "Teléfono", value: phone, step: 4 },
  ];
  if (date) rows.splice(3, 0, { label: "Fecha evento", value: formatDate(date), step: 4 });

  // Add Toga Color and Estola Design details specifically for Preescolar and Primaria
  if (level === "preescolar" || level === "primaria") {
    const selectedToga = pkg?.kind === "A" ? colorLabel(togaColor) : "Negro";
    const stolaVal = level === "preescolar"
      ? stolaLabel(stolaColor)
      : (pkg?.kind === "A" 
          ? "Oro / Amarillo" 
          : (pkg?.variant === "hybrid" || pkg?.variant === "pri_b" ? "Blanco (Diseño Balance)" : "Blanco (Diseño Premium)"));

    const packageIndex = rows.findIndex(r => r.label === "Paquete");
    if (packageIndex !== -1) {
      rows.splice(packageIndex + 1, 0, 
        { label: "Color Toga", value: selectedToga, step: pkg?.kind === "A" ? 3 : null },
        { label: "Estola", value: stolaVal, step: 3 }
      );
    }
  }

  return (
    <div>
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Paso 05</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2 text-foreground">
          {quoteNumber ? "Cotización Finalizada" : "Generando Cotización..."}
        </h2>
      </header>

      {!quoteNumber ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Loader2 className="h-12 w-12 text-navy animate-spin mb-6" />
          <p className="text-muted-foreground font-medium">Asignando folio oficial y guardando datos...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 items-start">
          
          {/* 1. Summary Table */}
          <div className="border-t border-hairline order-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-6 py-4 border-b border-hairline group">
            <span className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{r.label}</span>
            {r.step && onEditStep ? (
              <button
                onClick={() => onEditStep(r.step as 1|2|3|4|5)}
                className="text-base text-foreground text-right hover:text-navy hover:underline decoration-navy/30 underline-offset-4 transition-colors cursor-pointer text-left sm:text-right text-balance"
                title={`Editar ${r.label.toLowerCase()}`}
              >
                {r.value}
              </button>
            ) : (
              <span className="text-base text-foreground text-right">{r.value}</span>
            )}
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-6 pt-8 pb-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Total</span>
          <span className="font-sans font-semibold text-4xl sm:text-5xl text-navy tabular-nums">
            {formatMXN(total)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-right">Cotización válida 15 días.</p>
      </div>

      {/* 2. Thank You Card (Shows up on right for desktop, bottom for mobile) */}
      <div className="order-3 lg:order-2 pt-8 lg:pt-0 lg:pl-12 lg:border-l lg:border-hairline border-t lg:border-t-0 border-hairline flex flex-col items-center text-center h-full justify-center">
        <h3 className="font-display text-2xl sm:text-3xl text-navy mb-4">
          Gracias por confiar en Kinder Togas
        </h3>
        <p className="max-w-md text-sm text-muted-foreground leading-relaxed mb-10">
          Nos encantará acompañarlos en este momento tan especial y crear recuerdos que se queden para siempre.
        </p>

        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="h-10 w-10 rounded-full bg-cream flex items-center justify-center text-navy shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-foreground">Atención personalizada</span>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="h-10 w-10 rounded-full bg-cream flex items-center justify-center text-navy shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-foreground">Envíos a todo México</span>
          </div>

          <div className="h-px bg-hairline w-1/2 mx-auto my-4" />

          <div className="space-y-4">
            <a 
              href="https://wa.me/526461305987" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-4 hover:text-navy transition-colors group"
            >
              <div className="h-10 w-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">WhatsApp: 646 130 59 87</span>
            </a>

            <a 
              href="https://facebook.com/kindertogas" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-4 hover:text-navy transition-colors group"
            >
              <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                <Facebook className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">Facebook: Kinder Togas</span>
            </a>
          </div>
        </div>

        <div className="mt-12 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold">
            Especialistas en graduaciones escolares
          </p>
          <p className="text-[10px] text-muted-foreground/40 font-medium">
            2026
          </p>
        </div>
      </div>

      {/* 3. Action Buttons (Download) */}
      <div className="order-2 lg:order-3 lg:col-span-2 pt-8 pb-4 flex flex-col sm:flex-row justify-center items-center gap-6 lg:mt-4 lg:border-t border-hairline">
        <button
          type="button"
          onClick={() => generateQuotePDF({ level, city, pkg, quantity, school, contact, phone, date, email, quoteNumber, togaColor, stolaColor })}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-navy text-navy-foreground px-10 py-4.5 text-base font-semibold hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="h-5 w-5" /> Descargar mi Cotización (PDF)
        </button>
      </div>

      </div>
      )}
    </div>
  );
}
