import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { StepperBar, StepperLabel } from "./Stepper";
import { StepLevel } from "./StepLevel";
import { StepService } from "./StepService";
import { StepConfig } from "./StepConfig";
import { StepDetails } from "./StepDetails";
import { StepSummary } from "./StepSummary";
import {
  unitPrice,
  unitOriginalPrice,
  getDiscountPercent,
  levelLabel,
  cityLabel,
  packageLabel,
  colorLabel,
  stolaLabel,
  formatMXN,
  loadDynamicPrices,
  type Level,
  type ServiceType,
  type City,
  type PackageChoice,
} from "@/lib/pricing";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabase";

type Step = 1 | 2 | 3 | 4 | 5;

async function generateSequentialFolio(service: ServiceType | undefined, city: City | undefined): Promise<string> {
  const typePrefix = service === 'renta' ? 'R' : 'V';
  const cityPrefix = service === 'renta' ? (city === 'tijuana' ? 'TJ' : 'EN') : 'MX';
  const currentYear = new Date().getFullYear();
  let seq = 1;
  try {
    const { data: count, error } = await supabase
      .rpc('get_quote_count_for_year', { year_param: currentYear });
    if (!error) {
      seq = (count || 0) + 1;
    }
  } catch (err) {
    console.error("Error fetching count:", err);
    seq = Math.floor(1000 + Math.random() * 9000);
  }
  return `KT-${typePrefix}-${cityPrefix}-${currentYear}-${seq}`;
}

export function Quoter() {
  // SSR-safe localStorage helper
  const ls = (key: string) => typeof window !== "undefined" ? localStorage.getItem(key) : null;

  const [step, setStep] = useState<Step>(() => {
    const saved = ls("kt-quote-step");
    return saved ? (Number(saved) as Step) : 1;
  });
  const [level, setLevel] = useState<Level | undefined>(() => (ls("kt-quote-level") as Level) || undefined);
  const [service, setService] = useState<ServiceType | undefined>(() => (ls("kt-quote-service") as ServiceType) || undefined);
  const [city, setCity] = useState<City | undefined>(() => (ls("kt-quote-city") as City) || "ensenada");
  const [pkg, setPkg] = useState<PackageChoice | undefined>(() => {
    const saved = ls("kt-quote-pkg");
    return saved ? JSON.parse(saved) : { kind: "A" };
  });
  const [quantity, setQuantity] = useState(() => Number(ls("kt-quote-qty")) || 1);
  const [school, setSchool] = useState(() => ls("kt-quote-school") || "");
  const [schoolAddress, setSchoolAddress] = useState(() => ls("kt-quote-school-address") || "");
  const [contact, setContact] = useState(() => ls("kt-quote-contact") || "");
  const [phone, setPhone] = useState(() => ls("kt-quote-phone") || "");
  const [date, setDate] = useState(() => ls("kt-quote-date") || "");
  const [email, setEmail] = useState(() => ls("kt-quote-email") || "");
  const [quoteNumber, setQuoteNumber] = useState(() => ls("kt-quote-number") || "");
  const [togaColor, setTogaColor] = useState<string>(() => ls("kt-quote-toga-color") || "negro");
  const [stolaColor, setStolaColor] = useState<string>(() => ls("kt-quote-stola-color") || "dorada");
  const [honeypot, setHoneypot] = useState("");
  const [startTime] = useState(() => Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  // Load dynamic pricing rules on mount
  useEffect(() => {
    loadDynamicPrices().then(() => {
      setPricesLoaded(true);
    });
  }, []);

  // Force correct toga/stola color locks when level or package changes
  useEffect(() => {
    if (level && level !== "preescolar") {
      if (togaColor !== "negro") {
        setTogaColor("negro");
      }
      if (pkg?.kind === "A" && stolaColor !== "dorada") {
        setStolaColor("dorada");
      }
    }
  }, [level, pkg, togaColor, stolaColor]);

  // Persistence
  useEffect(() => {
    localStorage.setItem("kt-quote-step", String(step));
    if (level) localStorage.setItem("kt-quote-level", level);
    else localStorage.removeItem("kt-quote-level");
    if (service) localStorage.setItem("kt-quote-service", service);
    else localStorage.removeItem("kt-quote-service");
    if (city) localStorage.setItem("kt-quote-city", city);
    else localStorage.removeItem("kt-quote-city");
    if (pkg) localStorage.setItem("kt-quote-pkg", JSON.stringify(pkg));
    else localStorage.removeItem("kt-quote-pkg");
    localStorage.setItem("kt-quote-qty", String(quantity));
    localStorage.setItem("kt-quote-school", school);
    localStorage.setItem("kt-quote-school-address", schoolAddress);
    localStorage.setItem("kt-quote-contact", contact);
    localStorage.setItem("kt-quote-phone", phone);
    localStorage.setItem("kt-quote-date", date);
    localStorage.setItem("kt-quote-email", email);
    localStorage.setItem("kt-quote-toga-color", togaColor);
    localStorage.setItem("kt-quote-stola-color", stolaColor);
    if (quoteNumber) localStorage.setItem("kt-quote-number", quoteNumber);
    else localStorage.removeItem("kt-quote-number");
  }, [step, level, service, city, pkg, quantity, school, schoolAddress, contact, phone, date, email, quoteNumber, togaColor, stolaColor]);

  const total = useMemo(() => unitPrice(pkg, level) * quantity, [pkg, level, quantity, pricesLoaded]);

  // Save to Supabase
  useEffect(() => {
    async function save() {
      if (step === 5 && !isSaved && !isSaving && school && contact && phone && turnstileToken) {
        setIsSaving(true);
        
        let qNum = quoteNumber;
        if (!qNum) {
          qNum = await generateSequentialFolio(service, city);
        }

        // Anti-spam checks:
        // 1. Honeypot must be empty
        // 2. Form must take at least 3 seconds to complete
        const isBot = honeypot.length > 0 || (Date.now() - startTime) < 3000;

        if (isBot) {
          console.log("Bot detected, skipping save.");
          // Silently succeed to fool the bot
          setQuoteNumber(qNum);
          setIsSaved(true);
          setIsSaving(false);
          return;
        }
        
        try {
          const payload = {
            quote_number: qNum,
            institution_name: school,
            institution_address: schoolAddress || null,
            contact_name: contact,
            contact_phone: phone,
            contact_email: email || null,
            estimated_date: date || null,
            school_level: level,
            service_option: service,
            city: city || null,
            package_kind: pkg?.kind,
            package_variant: pkg?.kind === 'B' ? pkg.variant : null,
            student_count: quantity,
            unit_price: unitPrice(pkg, level),
            total_price: total,
            toga_color: togaColor,
            stola_color: stolaColor,
            discount_percent: getDiscountPercent(pkg, level),
            original_unit_price: unitOriginalPrice(pkg, level),
          };
          
          const res = await fetch('https://qqfqwvxmhiacoyqwobjd.supabase.co/functions/v1/submit-quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ turnstileToken, quoteData: payload })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Server error');
          }

          setQuoteNumber(qNum);
          setIsSaved(true);
        } catch (e) {
          console.error("Exception saving quote:", e);
        } finally {
          setIsSaving(false);
        }
      }
    }
    save();
  }, [step, quoteNumber, isSaved, isSaving, school, contact, phone, email, level, city, pkg, quantity, date, total, service, honeypot, startTime, togaColor, stolaColor, turnstileToken]);
  void total;

  const canNext: Record<Step, boolean> = {
    1: !!level,
    2: !!service,
    3: (service === 'renta' ? !!city : true) && 
       !!pkg && 
       (pkg.kind === "A" || !!pkg.variant) && 
       quantity >= 1,
    4: school.trim().length >= 3 && 
       contact.trim().length >= 3 && 
       phone.replace(/\D/g, '').length === 10 && 
       /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
       date !== "",
    5: true,
  };

  const goNext = async () => {
    if (!canNext[step]) return;
    
    if (step === 4) {
      // Generate Folio early to open WhatsApp with it
      const qNum = quoteNumber || await generateSequentialFolio(service, city);
      setQuoteNumber(qNum);
      setStep(5);
    } else if (step < 5) {
      setStep((s) => (s + 1) as Step);
    }
  };
  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const resetQuoter = () => {
    localStorage.clear(); // Simple way to clear all kt-quote-*
    setStep(1);
    setLevel(undefined);
    setService(undefined);
    setCity(undefined);
    setPkg(undefined);
    setQuantity(1);
    setSchool("");
    setContact("");
    setPhone("");
    setDate("");
    setEmail("");
    setQuoteNumber("");
    setTogaColor("negro");
    setStolaColor("dorada");
    setIsSaved(false);
  };

  const wide = step === 3;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header — centered logo, full-width progress bar, label */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-4 flex items-center justify-center relative">
          <Turnstile
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
            onSuccess={(token) => setTurnstileToken(token)}
          />
          {step > 1 && (
            <div className="absolute left-4 sm:left-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={step === 5 ? resetQuoter : goBack}
                className="gap-2 text-muted-foreground hover:text-foreground h-10 -ml-2"
              >
                {step === 5 ? <Plus className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                <span className="hidden sm:inline">{step === 5 ? "Nueva cotización" : "Regresar"}</span>
              </Button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Kinder Togas Logo" className="h-10 w-10 object-contain" />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
              <div className="font-display text-2xl tracking-tight text-foreground whitespace-nowrap">
                Kinder Togas
              </div>
              <div className="hidden sm:block h-6 w-px bg-border self-center" />
              <div className="font-display text-2xl tracking-tight text-muted-foreground/40 whitespace-nowrap">
                Cotizador
              </div>
            </div>
          </div>
          <div className="absolute right-4 sm:right-6 flex items-center gap-2">
            {(step > 1 || level || service) && step < 5 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetQuoter}
                  className="text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors px-2 h-8"
                >
                  Reiniciar
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { 
                resetQuoter(); 
                setTimeout(() => {
                  window.location.href = "https://kindertogas.com/";
                }, 50);
              }}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-navy transition-colors px-2 h-8"
            >
              Salir
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 -mt-3 pb-3 flex justify-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 font-medium text-center">
            Momentos que se quedan para siempre
          </p>
        </div>
        <StepperBar step={step} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <StepperLabel step={step} />
        </div>
      </header>

      {/* Content */}
      <main className="w-full pt-6 pb-16 flex-1">
        {/* Selection Summary Pills */}
        {((level && step > 1) || (service && step > 2) || ((city || pkg) && step > 3)) && step < 5 && (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-wrap gap-2">
              {level && step > 1 && (
                <button type="button" onClick={() => setStep(1)} className="px-3 py-1 bg-white border border-border rounded-full text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="text-[9px] text-muted-foreground/40 font-medium">Nivel:</span>
                  <span className="text-foreground/80">{levelLabel(level)}</span>
                </button>
              )}
              {service && step > 2 && (
                <button type="button" onClick={() => setStep(2)} className="px-3 py-1 bg-white border border-border rounded-full text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="text-[9px] text-muted-foreground/40 font-medium">Servicio:</span>
                  <span className="text-foreground/80">{service === "renta" ? "Renta" : "Venta"}</span>
                </button>
              )}
              {city && step > 3 && (
                <button type="button" onClick={() => setStep(3)} className="px-3 py-1 bg-white border border-border rounded-full text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="text-[9px] text-muted-foreground/40 font-medium">Ciudad:</span>
                  <span className="text-foreground/80">{cityLabel(city)}</span>
                </button>
              )}
              {pkg && step > 3 && (
                <button type="button" onClick={() => setStep(3)} className="px-3 py-1 bg-white border border-border rounded-full text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="text-[9px] text-muted-foreground/40 font-medium">Paquete:</span>
                  <span className="text-foreground/80">{packageLabel(pkg, level)}</span>
                </button>
              )}
              {quantity > 0 && step > 3 && (
                <button type="button" onClick={() => setStep(3)} className="px-3 py-1 bg-white border border-border rounded-full text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="text-[9px] text-muted-foreground/40 font-medium">Paquetes:</span>
                  <span className="text-foreground/80">{quantity}</span>
                </button>
              )}
              {((pkg?.kind === "A" && level === "preescolar") || level !== "preescolar") && togaColor && step > 3 && (
                <button type="button" onClick={() => setStep(3)} className="px-3 py-1 bg-white border border-border rounded-full text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-in fade-in slide-in-from-top-1 duration-300">
                  <span className="text-[9px] text-muted-foreground/40 font-medium">Toga:</span>
                  <span className="text-foreground/80">{colorLabel(togaColor)}</span>
                </button>
              )}
              {stolaColor && step > 3 && (
                <button type="button" onClick={() => setStep(3)} className="px-3 py-1 bg-white border border-border rounded-full text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-in fade-in slide-in-from-top-1 duration-300">
                  <span className="text-[9px] text-muted-foreground/40 font-medium">Estola:</span>
                  <span className="text-foreground/80">{stolaLabel(stolaColor)}</span>
                </button>
              )}
              {total > 0 && step > 3 && (
                <button type="button" onClick={() => setStep(3)} className="px-3 py-1 bg-navy border border-navy rounded-full text-[10px] uppercase tracking-wider font-bold text-navy-foreground flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="text-[9px] text-navy-foreground/70 font-medium">Total:</span>
                  <span className="text-navy-foreground tabular-nums">{formatMXN(total)}</span>
                </button>
              )}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={wide ? "" : "mx-auto max-w-3xl px-4 sm:px-6"}
          >
            {step === 1 && (
              <StepLevel
                value={level}
                onChange={(l) => {
                  setLevel(l);
                  setCity("ensenada");
                  setPkg({ kind: "A" });
                  if (l !== "preescolar") {
                    setTogaColor("negro");
                    setStolaColor("dorada");
                  }
                  setTimeout(() => setStep(2), 220);
                }}
              />
            )}
            {step === 2 && (
              <StepService
                value={service}
                onChange={(s) => {
                  setService(s);
                  if (s === "renta") setTimeout(() => setStep(3), 220);
                }}
              />
            )}
            {step === 3 && (
              <StepConfig
                level={level}
                service={service}
                city={city}
                pkg={pkg}
                quantity={quantity}
                togaColor={togaColor}
                stolaColor={stolaColor}
                onCity={setCity}
                onPkg={setPkg}
                onQty={setQuantity}
                onTogaColor={setTogaColor}
                onStolaColor={setStolaColor}
                canContinue={canNext[3]}
                onContinue={goNext}
              />
            )}
            {step === 4 && (
              <StepDetails
                school={school}
                schoolAddress={schoolAddress}
                contact={contact}
                phone={phone}
                date={date}
                email={email}
                honeypot={honeypot}
                onSchool={setSchool}
                onSchoolAddress={setSchoolAddress}
                onContact={setContact}
                onPhone={setPhone}
                onDate={setDate}
                onEmail={setEmail}
                onHoneypot={setHoneypot}
                onContinue={goNext}
              />
            )}
            {step === 5 && (
              <StepSummary
                level={level}
                service={service}
                city={city}
                pkg={pkg}
                quantity={quantity}
                school={school}
                contact={contact}
                phone={phone}
                date={date}
                email={email}
                quoteNumber={quoteNumber}
                togaColor={togaColor}
                stolaColor={stolaColor}
                onEditStep={(targetStep) => {
                  if (isSaved) {
                    setIsSaved(false);
                    setQuoteNumber("");
                  }
                  setStep(targetStep);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-background mt-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex items-center justify-center gap-3">
          <img src={logo} alt="Kinder Togas" className="h-7 w-7 object-contain" />
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            © {new Date().getFullYear()} Kinder Togas. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
