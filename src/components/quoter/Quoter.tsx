import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Plus, RotateCcw, ShoppingBag, X as XIcon } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { StepperBar, StepperLabel } from "./Stepper";
import { StepLevel } from "./StepLevel";
import { StepService } from "./StepService";
import { StepConfig } from "./StepConfig";
import { StepDetails } from "./StepDetails";
import { StepSummary } from "./StepSummary";
import { CartDrawer } from "./CartDrawer";
import { cn } from "@/lib/utils";
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
  getItemInfo,
  isSameProductConfig,
  type Level,
  type ServiceType,
  type City,
  type PackageChoice,
  type QuoteItem,
} from "@/lib/pricing";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabase";
import { MEXICO_STATES } from "@/lib/mexico-locations";
import bgStep1 from "@/assets/bg-step1.jpg";
import bgStep2 from "@/assets/bg-step2.jpg";

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
  // Check URL query parameters for direct level linking (e.g. ?level=primaria or ?nivel=primaria)
  const getUrlLevel = (): Level | undefined => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get("level") || params.get("nivel"))?.toLowerCase();
    if (!raw) return undefined;
    if (raw === "preescolar") return "preescolar";
    if (raw === "primaria") return "primaria";
    if (raw === "secundaria") return "secundaria";
    if (raw === "prepa" || raw === "preparatoria") return "preparatoria";
    if (raw === "universidad" || raw === "posgrado" || raw === "doctorado") return "universidad";
    return undefined;
  };

  const [step, setStep] = useState<Step>(1);
  const [level, setLevel] = useState<Level | undefined>(undefined);
  const [service, setService] = useState<ServiceType | undefined>(undefined);
  const [city, setCity] = useState<City>("ensenada");
  const [pkg, setPkg] = useState<PackageChoice | undefined>({ kind: "A" });
  const [quantity, setQuantity] = useState(1);
  const [school, setSchool] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [togaColor, setTogaColor] = useState<string>("negro");
  const [stolaColor, setStolaColor] = useState<string>("dorada");
  const [togaSize, setTogaSize] = useState<string>("M");
  const [productCategory, setProductCategory] = useState<"togas" | "estolas" | "birretes" | "borlas" | "recuerdos">("togas");
  const [stateSelected, setStateSelected] = useState("");
  const [citySelected, setCitySelected] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [honeypot, setHoneypot] = useState("");

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Amazon-style: Si es exactamente el mismo producto/configuración, suma la cantidad
  const handleAddItem = (item: QuoteItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((it) => isSameProductConfig(it, item));
      if (existingIndex >= 0) {
        return prev.map((it, idx) => {
          if (idx !== existingIndex) return it;
          const mergedQty = it.quantity + item.quantity;
          return {
            ...it,
            quantity: mergedQty,
            totalPrice: it.unitPrice * mergedQty,
          };
        });
      }
      return [...prev, item];
    });
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        return {
          ...it,
          quantity: newQty,
          totalPrice: it.unitPrice * newQty,
        };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };
  const [startTime] = useState(() => Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Restore client-side state safely after hydration
  useEffect(() => {
    setIsMounted(true);

    const initialUrlLevel = getUrlLevel();
    if (initialUrlLevel) {
      setLevel(initialUrlLevel);
      if (initialUrlLevel !== "preescolar") {
        setService("renta");
        setStep(3);
        setTogaColor("negro");
        setStolaColor("dorada");
      } else {
        setStep(2);
      }
      return;
    }

    try {
      const savedStep = localStorage.getItem("kt-quote-step");
      const savedLevel = localStorage.getItem("kt-quote-level") as Level | null;
      const savedService = localStorage.getItem("kt-quote-service") as ServiceType | null;
      const savedCity = localStorage.getItem("kt-quote-city") as City | null;
      const savedPkg = localStorage.getItem("kt-quote-pkg");
      const savedQty = localStorage.getItem("kt-quote-qty");
      const savedSchool = localStorage.getItem("kt-quote-school");
      const savedSchoolAddress = localStorage.getItem("kt-quote-school-address");
      const savedContact = localStorage.getItem("kt-quote-contact");
      const savedPhone = localStorage.getItem("kt-quote-phone");
      const savedDate = localStorage.getItem("kt-quote-date");
      const savedEmail = localStorage.getItem("kt-quote-email");
      const savedNumber = localStorage.getItem("kt-quote-number");
      const savedTogaColor = localStorage.getItem("kt-quote-toga-color");
      const savedStolaColor = localStorage.getItem("kt-quote-stola-color");
      const savedTogaSize = localStorage.getItem("kt-quote-toga-size");
      const savedCategory = localStorage.getItem("kt-quote-product-category") as any;
      const savedState = localStorage.getItem("kt-quote-state-selected");
      const savedCitySelected = localStorage.getItem("kt-quote-city-selected");
      const savedItems = localStorage.getItem("kt-quote-items");

      if (savedLevel) setLevel(savedLevel);
      if (savedStep) {
        const s = Number(savedStep) as Step;
        if (savedLevel && savedLevel !== "preescolar" && s === 2) {
          setStep(3);
          setService("renta");
        } else {
          setStep(s);
        }
      }
      if (savedService) setService(savedService);
      if (savedCity) setCity(savedCity);
      if (savedPkg) setPkg(JSON.parse(savedPkg));
      if (savedQty) setQuantity(Number(savedQty) || 1);
      if (savedSchool) setSchool(savedSchool);
      if (savedSchoolAddress) setSchoolAddress(savedSchoolAddress);
      if (savedContact) setContact(savedContact);
      if (savedPhone) setPhone(savedPhone);
      if (savedDate) setDate(savedDate);
      if (savedEmail) setEmail(savedEmail);
      if (savedNumber) setQuoteNumber(savedNumber);
      if (savedTogaColor) setTogaColor(savedTogaColor);
      if (savedStolaColor) setStolaColor(savedStolaColor);
      if (savedTogaSize) setTogaSize(savedTogaSize);
      if (savedCategory) setProductCategory(savedCategory);
      if (savedState) setStateSelected(savedState);
      if (savedCitySelected) setCitySelected(savedCitySelected);
      if (savedItems) setItems(JSON.parse(savedItems));
    } catch (e) {
      console.warn("Could not restore stored quoter state", e);
    }
  }, []);

  // Synchronize schoolAddress for Venta based on selected state and city
  useEffect(() => {
    if (service === "venta" && stateSelected) {
      if (citySelected) {
        const stateName = MEXICO_STATES.find(s => s.id === stateSelected)?.name || stateSelected;
        setSchoolAddress(`${citySelected}, ${stateName}`);
      } else {
        setSchoolAddress("");
      }
    }
  }, [service, stateSelected, citySelected]);

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
    } else if (level === "preescolar" && service === "renta") {
      if (pkg?.kind === "A" && stolaColor === "blanco") {
        setStolaColor("dorada");
      }
    }
  }, [level, service, pkg, togaColor, stolaColor]);

  // Default to "azul" when graduation bear is selected and no valid color is set
  useEffect(() => {
    if (level === "preescolar" && service === "venta" && productCategory === "recuerdos" && pkg?.kind === "B" && pkg.variant === "oso_graduacion") {
      if (stolaColor !== "azul" && stolaColor !== "rosa") {
        setStolaColor("azul");
      }
    }
  }, [level, service, productCategory, pkg, stolaColor]);

  // Persistence
  useEffect(() => {
    if (!isMounted) return;
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
    localStorage.setItem("kt-quote-toga-size", togaSize);
    localStorage.setItem("kt-quote-product-category", productCategory);
    localStorage.setItem("kt-quote-state-selected", stateSelected);
    localStorage.setItem("kt-quote-city-selected", citySelected);
    if (items.length > 0) localStorage.setItem("kt-quote-items", JSON.stringify(items));
    else localStorage.removeItem("kt-quote-items");
    if (quoteNumber) localStorage.setItem("kt-quote-number", quoteNumber);
    else localStorage.removeItem("kt-quote-number");
  }, [isMounted, step, level, service, city, pkg, quantity, school, schoolAddress, contact, phone, date, email, quoteNumber, togaColor, stolaColor, productCategory, stateSelected, citySelected, items]);

  const total = useMemo(() => {
    if (items.length > 0) {
      return items.reduce((acc, it) => acc + it.totalPrice, 0);
    }
    return unitPrice(pkg, level, service) * quantity;
  }, [items, pkg, level, service, quantity, pricesLoaded]);

  // Save to Supabase
  useEffect(() => {
    async function save() {
      const isTesting = typeof window !== "undefined" && (window as any).__PLAYWRIGHT_TEST__;
      if (step === 5 && !isSaved && !isSaving && school && contact && phone && (turnstileToken || isTesting)) {
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
          const totalUnits = items.length > 0 ? items.reduce((acc, it) => acc + it.quantity, 0) : quantity;
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
            city: service === 'venta' ? citySelected : (city || null),
            package_kind: items.length > 0 ? (items.length === 1 ? items[0].pkg.kind : "MIXTO") : pkg?.kind,
            package_variant: items.length > 0 ? (items.length === 1 ? (items[0].pkg.variant || null) : null) : (pkg?.kind === 'B' ? pkg.variant : null),
            student_count: totalUnits,
            unit_price: items.length === 1 ? items[0].unitPrice : unitPrice(pkg, level, service),
            total_price: total,
            toga_color: items.length === 1 ? (items[0].togaColor || null) : (service === 'venta' ? (productCategory === 'togas' ? togaColor : (productCategory === 'recuerdos' ? togaColor : null)) : togaColor),
            stola_color: items.length === 1 ? (items[0].stolaColor || null) : stolaColor,
            discount_percent: items.length === 1 ? (items[0].discountPercent || 0) : getDiscountPercent(pkg, level, service),
            original_unit_price: items.length === 1 ? (items[0].originalUnitPrice || 0) : unitOriginalPrice(pkg, level, service),
            toga_size: items.length === 1 ? (items[0].togaSize || null) : (service === 'venta' && productCategory === 'togas' ? togaSize : null),
            items: items.length > 0 ? items : undefined,
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
  }, [step, quoteNumber, isSaved, isSaving, school, contact, phone, email, level, city, pkg, quantity, date, total, service, honeypot, startTime, togaColor, stolaColor, turnstileToken, stateSelected, citySelected, productCategory, togaSize, items]);
  void total;

  const canNext: Record<Step, boolean> = {
    1: !!level,
    2: !!service,
    3: items.length > 0
       ? true
       : ((service === 'renta' ? !!city : true) && 
          !!pkg && 
          (pkg.kind === "A" || !!pkg.variant) && 
          quantity >= 1),
    4: school.trim().length >= 3 && 
       contact.trim().length >= 3 && 
       phone.replace(/\D/g, '').length === 10 && 
       /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
       date !== "" &&
       (service === "venta"
         ? !!stateSelected && !!citySelected
         : true),
    5: true,
  };

  const goNext = async () => {
    if (!canNext[step]) return;
    
    if (step === 3) {
      if (items.length === 0 && pkg) {
        const info = getItemInfo({ pkg, level, service, productCategory, togaColor, stolaColor, togaSize });
        const unit = unitPrice(pkg, level, service);
        const origUnit = unitOriginalPrice(pkg, level, service);
        const disc = getDiscountPercent(pkg, level, service);
        const singleItem: QuoteItem = {
          id: `item-${Date.now()}`,
          category: productCategory,
          pkg: { ...pkg },
          quantity,
          level,
          service,
          togaColor,
          stolaColor,
          togaSize: (service === "venta" && productCategory === "togas") ? togaSize : undefined,
          unitPrice: unit,
          originalUnitPrice: origUnit,
          discountPercent: disc,
          totalPrice: unit * quantity,
          label: info.label,
          details: info.details,
        };
        setItems([singleItem]);
      }
      setStep(4);
    } else if (step === 4) {
      // Generate Folio early to open WhatsApp with it
      const qNum = quoteNumber || await generateSequentialFolio(service, city);
      setQuoteNumber(qNum);
      setStep(5);
    } else if (step < 5) {
      setStep((s) => (s + 1) as Step);
    }
  };

  const goBack = () => {
    if (step === 3 && level !== "preescolar") {
      setStep(1);
      return;
    }
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const totalDisplaySteps = level && level !== "preescolar" ? 4 : 5;
  const currentDisplayStep = useMemo(() => {
    if (level && level !== "preescolar") {
      if (step === 1) return 1;
      if (step === 3) return 2;
      if (step === 4) return 3;
      if (step === 5) return 4;
    }
    return step;
  }, [level, step]);

  const resetQuoter = () => {
    localStorage.clear(); // Simple way to clear all kt-quote-*
    setItems([]);
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
    setTogaSize("M");
    setProductCategory("togas");
    setStateSelected("");
    setCitySelected("");
    setIsSaved(false);
  };

  const wide = step === 3;

  return (
    <div className={`min-h-screen flex flex-col relative ${(step === 1 || step === 2) ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
      {step === 1 && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 hidden sm:block opacity-70 xl:opacity-100 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${bgStep1})`,
            backgroundPosition: 'right center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 10%, black 30%)',
            maskImage: 'linear-gradient(to right, transparent 0%, transparent 10%, black 30%)',
          }}
        />
      )}
      {step === 2 && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 hidden sm:block opacity-60 xl:opacity-100 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${bgStep2})`,
            backgroundPosition: 'right center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 35%, black 75%)',
            maskImage: 'linear-gradient(to right, transparent 0%, transparent 35%, black 75%)',
          }}
        />
      )}
      
      {/* Header — centered logo with slogan, back button on left, REINICIAR | SALIR on right */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 sm:py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {isMounted && !(typeof window !== "undefined" && (window as any).__PLAYWRIGHT_TEST__) && import.meta.env.VITE_TURNSTILE_SITE_KEY && (
            <div className="absolute opacity-0 pointer-events-none">
              <Turnstile
                siteKey={typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "1x00000000000000000000AA" : import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
              />
            </div>
          )}

          {/* LEFT: Regresar */}
          <div className="flex items-center justify-start min-w-0">
            {step > 1 && (
              <button
                type="button"
                onClick={step === 5 ? resetQuoter : goBack}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-[#1E2346] transition cursor-pointer"
                title={step === 5 ? "Nueva cotización" : "Regresar al paso anterior"}
              >
                {step === 5 ? <Plus className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" strokeWidth={2} />}
                <span className="hidden sm:inline">{step === 5 ? "Nueva" : "Regresar"}</span>
              </button>
            )}
          </div>

          {/* CENTER: Logo + Kinder Togas | Cotizador + Slogan */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <img src={logo} alt="Logo" className="h-6 w-6 sm:h-7 sm:w-7 object-contain shrink-0" />
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="font-serif text-lg sm:text-2xl font-bold text-[#1E2346] tracking-tight">
                  Kinder Togas
                </span>
                <span className="text-slate-300 font-light text-base sm:text-xl">|</span>
                <span className="font-serif text-lg sm:text-2xl font-normal text-[#C5A85A]">
                  Cotizador
                </span>
              </div>
            </div>
            <p className="text-[8px] sm:text-[9.5px] uppercase tracking-[0.22em] sm:tracking-[0.25em] text-[#64748B]/80 font-medium mt-0.5">
              Momentos que se quedan para siempre
            </p>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {/* Si ya hay productos en la cotización, botón para ver el carrito con piezas y subtotal */}
            {isMounted && items.length > 0 && step < 5 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative h-7 sm:h-8 px-2.5 sm:px-3 rounded-full bg-[#1E2346] hover:bg-[#1E2346]/90 text-white flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer shadow-2xs mr-1"
                title="Ver desglose de mi cotización"
                aria-label="Abrir cotización"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-[#C5A85A] shrink-0" />
                <span className="tabular-nums font-bold text-[#C5A85A]">{items.length}</span>
                <span className="text-slate-400 text-[10px]">·</span>
                <span className="tabular-nums text-slate-100 font-medium text-[11px] sm:text-xs">
                  {formatMXN(total)}
                </span>
              </button>
            )}

            {isMounted && (step > 1 || level || service) && step < 5 && (
              <button
                type="button"
                onClick={resetQuoter}
                className="text-[10px] sm:text-[11px] font-semibold text-slate-500 hover:text-[#1E2346] uppercase tracking-wider transition cursor-pointer"
                title="Reiniciar cotizador"
              >
                Reiniciar
              </button>
            )}

            {isMounted && (step > 1 || level || service) && step < 5 && (
              <span className="text-slate-300 hidden sm:inline">|</span>
            )}

            <button
              type="button"
              onClick={() => { 
                resetQuoter(); 
                setTimeout(() => { window.location.href = "https://kindertogas.com/"; }, 50);
              }}
              className="text-[10px] sm:text-[11px] font-semibold text-slate-500 hover:text-[#1E2346] uppercase tracking-wider transition cursor-pointer"
              title="Salir a kindertogas.com"
              aria-label="Salir"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Integrated slim progress bar */}
        <StepperBar step={step} totalSteps={totalDisplaySteps} currentStepIndex={currentDisplayStep} />

        {/* Pill in the upper-left corner just below the progress bar line */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-2.5 pb-2">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-50 border border-slate-200/80 shadow-2xs text-xs select-none">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#C5A85A] uppercase tracking-wider">
              Paso {currentDisplayStep} de {totalDisplaySteps}
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-[#1E2346]">
              {step === 1 && "Nivel"}
              {step === 2 && "Servicio"}
              {step === 3 && "Configuración"}
              {step === 4 && "Datos de contacto"}
              {step === 5 && "Resumen"}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="w-full pt-4 pb-12 flex-1 relative z-10">
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
                  if (l !== "preescolar") {
                    setService("renta");
                    setPkg({ kind: "A" });
                    setTogaColor("negro");
                    setStolaColor("dorada");
                    setTimeout(() => setStep(3), 220);
                  } else {
                    setPkg({ kind: "A" });
                    setTimeout(() => setStep(2), 220);
                  }
                }}
              />
            )}
            {step === 2 && (
              <StepService
                value={service}
                level={level}
                onChange={(s) => {
                  setService(s);
                  if (s === "venta" && level === "preescolar") {
                    setProductCategory("togas");
                    setPkg({ kind: "B", variant: "toga_birrete_borla" });
                    setTogaColor("guinda");
                    setStolaColor("blanco");
                  } else {
                    setPkg({ kind: "A" });
                  }
                  setTimeout(() => setStep(3), 220);
                }}
              />
            )}
            {step === 3 && (
              <StepConfig
                level={level}
                service={service}
                city={city}
                pkg={pkg}
                productCategory={productCategory}
                quantity={quantity}
                togaColor={togaColor}
                stolaColor={stolaColor}
                togaSize={togaSize}
                items={items}
                onCity={setCity}
                onPkg={setPkg}
                onProductCategory={setProductCategory}
                onQty={setQuantity}
                onTogaColor={setTogaColor}
                onStolaColor={setStolaColor}
                onTogaSize={setTogaSize}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onSetItems={setItems}
                onOpenCart={() => setIsCartOpen(true)}
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
                service={service}
                stateSelected={stateSelected}
                citySelected={citySelected}
                onSchool={setSchool}
                onSchoolAddress={setSchoolAddress}
                onContact={setContact}
                onPhone={setPhone}
                onDate={setDate}
                onEmail={setEmail}
                onHoneypot={setHoneypot}
                onStateSelected={setStateSelected}
                onCitySelected={setCitySelected}
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
                togaSize={togaSize}
                items={items}
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
      <footer className="border-t border-[#E5E0D8] bg-[#FCFBF8] mt-auto relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex items-center justify-center gap-3">
          <img src={logo} alt="Kinder Togas" className="h-7 w-7 object-contain" />
          <p className="text-sm text-navy whitespace-nowrap">
            © {new Date().getFullYear()} Kinder Togas. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddMore={() => {
          setIsCartOpen(false);
          if (step !== 3) setStep(3);
        }}
        onProceed={() => {
          setIsCartOpen(false);
          setStep(4);
        }}
      />
    </div>
  );
}
