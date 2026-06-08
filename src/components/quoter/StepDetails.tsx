import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format, addMonths, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MEXICO_STATES, MEXICO_CITIES_BY_STATE } from "@/lib/mexico-locations";

type Props = {
  school: string;
  schoolAddress: string;
  contact: string;
  phone: string;
  date: string;
  email: string;
  honeypot: string;
  service?: "renta" | "venta";
  stateSelected: string;
  citySelected: string;
  onSchool: (s: string) => void;
  onSchoolAddress: (s: string) => void;
  onContact: (c: string) => void;
  onPhone: (p: string) => void;
  onDate: (d: string) => void;
  onEmail: (e: string) => void;
  onHoneypot: (h: string) => void;
  onStateSelected: (s: string) => void;
  onCitySelected: (c: string) => void;
  onContinue: () => void;
};

export function StepDetails({
  school,
  schoolAddress,
  contact,
  phone,
  date,
  email,
  honeypot,
  service,
  stateSelected,
  citySelected,
  onSchool,
  onSchoolAddress,
  onContact,
  onPhone,
  onDate,
  onEmail,
  onHoneypot,
  onStateSelected,
  onCitySelected,
  onContinue,
}: Props) {
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const canContinue = 
    school.trim().length >= 3 && 
    contact.trim().length >= 3 && 
    phone.replace(/\D/g, '').length === 10 && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    date !== "" &&
    (service === "venta"
      ? !!stateSelected && !!citySelected
      : true);

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-10 text-center sm:text-left">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Paso 04</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2 text-foreground">
          Detalles de contacto
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Estos datos aparecerán en tu PDF oficial de cotización.
        </p>
      </header>

      <div className="space-y-6">
        {/* Honeypot field (hidden from users, but filled by bots) */}
        <div className="sr-only" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
          <Label htmlFor="website">Website</Label>
          <input 
            id="website" 
            name="website" 
            type="text" 
            tabIndex={-1} 
            autoComplete="off" 
            value={honeypot}
            onChange={(e) => onHoneypot(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">Institución o Escuela</Label>
          <Input
            id="school"
            placeholder="Ej. Primaria Benito Juárez"
            value={school}
            onChange={(e) => {
              onSchool(e.target.value);
              // reset school address if rented, but if sales it will be handled by state/city effects
              if (service !== "venta") {
                onSchoolAddress("");
              }
            }}
            className="h-12 text-base"
          />
          <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
            Mínimo 3 caracteres
          </p>
        </div>

        {/* Searchable State & City Autocomplete for Venta */}
        {service === "venta" && (
          <div className="space-y-5 border border-hairline rounded-2xl p-5 bg-cream/40 animate-in fade-in slide-in-from-top-3 duration-300">
            <h3 className="text-xs uppercase tracking-wider font-bold text-navy mb-1">Dirección de Envío</h3>
            
            {/* Estado Selector */}
            <div className="space-y-2 flex flex-col">
              <Label>Estado de la República</Label>
              <Popover open={stateOpen} onOpenChange={setStateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={stateOpen}
                    className="h-12 w-full justify-between text-base font-normal bg-background hover:bg-background border-input text-left px-3.5"
                  >
                    <span className="truncate">
                      {stateSelected
                        ? MEXICO_STATES.find((state) => state.id === stateSelected)?.name
                        : "Seleccionar estado..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar estado..." />
                    <CommandList>
                      <CommandEmpty>No se encontró el estado.</CommandEmpty>
                      <CommandGroup>
                        {MEXICO_STATES.map((state) => (
                          <CommandItem
                            key={state.id}
                            value={state.name}
                            onSelect={() => {
                              onStateSelected(state.id);
                              onCitySelected("");
                              setStateOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                stateSelected === state.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {state.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Ciudad Selector */}
            {stateSelected && (
              <div className="space-y-2 flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
                <Label>Ciudad o Municipio</Label>
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={cityOpen}
                      className="h-12 w-full justify-between text-base font-normal bg-background hover:bg-background border-input text-left px-3.5"
                    >
                      <span className="truncate">
                        {citySelected
                          ? citySelected
                          : "Seleccionar ciudad..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar ciudad..." />
                      <CommandList>
                        <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                        <CommandGroup>
                          {(MEXICO_CITIES_BY_STATE[stateSelected] || []).map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={() => {
                                onCitySelected(city);
                                setCityOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  citySelected === city ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="contact">Nombre del Solicitante</Label>
          <Input
            id="contact"
            placeholder="Ej. Prof. Juan Pérez"
            value={contact}
            onChange={(e) => onContact(e.target.value)}
            className="h-12 text-base"
          />
          <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
            Mínimo 3 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono / WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Ej. (646) 123-4567"
            value={phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').substring(0, 10);
              let formatted = "";
              if (digits.length > 0) {
                if (digits.length <= 3) {
                  formatted = `(${digits}`;
                } else if (digits.length <= 6) {
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                } else {
                  formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
                }
              }
              onPhone(formatted);
            }}
            className="h-12 text-base"
          />
          {phone.length > 0 && phone.replace(/\D/g, '').length < 10 && (
            <p className="text-[10px] text-destructive mt-1.5 ml-1 font-medium animate-pulse">
              El teléfono debe tener exactamente 10 dígitos (llevas {phone.replace(/\D/g, '').length} de 10).
            </p>
          )}
          {phone.replace(/\D/g, '').length === 10 && (
            <p className="text-[10px] text-emerald-600 mt-1.5 ml-1 font-semibold flex items-center gap-1">
              <span>✓ Teléfono de 10 dígitos válido</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="Ej. correo@ejemplo.com"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            className="h-12 text-base"
          />
          {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <p className="text-[10px] text-destructive mt-1.5 ml-1 font-medium">
              Por favor ingresa un correo válido.
            </p>
          )}
        </div>

        <div className="space-y-2 flex flex-col">
          <Label htmlFor="date">Fecha estimada de ceremonia</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                id="date"
                type="button"
                className={cn(
                  "flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) && "text-muted-foreground"
                )}
              >
                {date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? (
                  format(new Date(date + "T12:00:00"), "PPP", { locale: es })
                ) : (
                  <span>Seleccionar fecha...</span>
                )}
                <CalendarIcon className="h-5 w-5 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + "T12:00:00") : undefined}
                onSelect={(d) => onDate(d ? format(d, "yyyy-MM-dd") : "")}
                disabled={(d) => d < startOfDay(new Date()) || d > addMonths(new Date(), 18)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-navy text-navy-foreground px-8 py-4 text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Finalizar y Generar Folio <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
