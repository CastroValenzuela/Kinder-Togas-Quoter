import { Shapes, BookOpen, Library, GraduationCap, University, Award, type LucideIcon } from "lucide-react";

export type Level =
  | "preescolar"
  | "primaria"
  | "secundaria"
  | "preparatoria"
  | "universidad";

export type ServiceType = "renta" | "venta";
export type City = "tijuana" | "ensenada";
export type PackageBVariant = "esencial" | "hybrid" | "max" | "sec_a" | "sec_b" | "pri_a" | "pri_b" | "pri_c" | "prep_a" | "prep_b" | "prep_c1" | "prep_c2" | "uni_b" | "uni_c";
export type PackageChoice =
  | { kind: "A" }
  | { kind: "B"; variant?: PackageBVariant }
  | { kind: "C"; variant?: PackageBVariant };

export const LEVELS: { id: Level; label: string; icon: LucideIcon }[] = [
  { id: "preescolar", label: "Preescolar", icon: Shapes },
  { id: "primaria", label: "Primaria", icon: BookOpen },
  { id: "secundaria", label: "Secundaria", icon: Library },
  { id: "preparatoria", label: "Preparatoria", icon: GraduationCap },
  { id: "universidad", label: "Universidad y Posgrado", icon: University },
];

export interface TogaColorOption {
  id: string;
  label: string;
  hex: string;
}

export const TOGA_COLORS: TogaColorOption[] = [
  { id: "negro", label: "Negro", hex: "#1A1A1A" },
  { id: "azul", label: "Azul", hex: "#1E40AF" },
  { id: "magenta", label: "Turquesa", hex: "#06B6D4" },
  { id: "rojo", label: "Rojo", hex: "#DC2626" },
  { id: "verde", label: "Verde", hex: "#16A34A" },
];

export function colorLabel(color?: string): string {
  if (!color) return "—";
  const dict: Record<string, string> = {
    negro: "Negro",
    azul: "Azul",
    magenta: "Turquesa",
    rojo: "Rojo",
    verde: "Verde",
  };
  return dict[color.toLowerCase()] || color;
}

export const STOLA_COLORS = [
  { id: "dorada", label: "Dorado", hex: "#EAB308", isBasic: true },
  { id: "plateada", label: "Plateada", hex: "#94A3B8", isBasic: true },
  { id: "azul", label: "Azul Rey", hex: "#1D4ED8", isBasic: true },
  { id: "roja", label: "Rojo", hex: "#DC2626", isBasic: true },
  { id: "verde_esmeralda", label: "Verde Esmeralda", hex: "#10B981" },
  { id: "negro", label: "Negro", hex: "#1A1A1A" },
  { id: "verde_bandera", label: "Verde Bandera", hex: "#166534" },
  { id: "turquesa", label: "Turquesa", hex: "#06B6D4" },
  { id: "azul_cielo", label: "Azul Cielo", hex: "#7DD3FC" },
  { id: "lila", label: "Lila", hex: "#D8B4E2" },
  { id: "morado", label: "Morado", hex: "#7E22CE" },
  { id: "blanco", label: "Blanco", hex: "#FFFFFF" },
  { id: "naranja", label: "Naranja", hex: "#F97316" },
  { id: "cafe", label: "Café", hex: "#78350F" },
  { id: "gris_acero", label: "Gris Acero", hex: "#475569" },
  { id: "rosa_fiusha", label: "Rosa Fiusha", hex: "#D946EF" },
  { id: "rosa_claro", label: "Rosa Claro", hex: "#FBCFE8" },
];

export function stolaLabel(stola?: string): string {
  if (!stola) return "—";
  const dict: Record<string, string> = {
    oro: "Dorado",
    dorada: "Dorado",
    plateada: "Plateada",
    azul: "Azul Rey",
    roja: "Rojo",
    verde_esmeralda: "Verde Esmeralda",
    negro: "Negro",
    verde_bandera: "Verde Bandera",
    turquesa: "Turquesa",
    azul_cielo: "Azul Cielo",
    lila: "Lila",
    morado: "Morado",
    blanco: "Blanco",
    naranja: "Naranja",
    cafe: "Café",
    gris_acero: "Gris Acero",
    rosa_fiusha: "Rosa Fiusha",
    rosa_claro: "Rosa Claro",
    balance: "Blanco (Diseño Balance)",
    premium: "Blanco (Diseño Premium)",
  };
  return dict[stola.toLowerCase()] || stola;
}

import { supabase } from "@/lib/supabase";

export const CITIES: { id: City; label: string }[] = [
  { id: "ensenada", label: "Ensenada" },
  { id: "tijuana", label: "Tijuana" },
];

// Precios editables (MXN, por alumno) — Objeto mutable de base para compatibilidad hacia atrás
export const PRICES = {
  // Preescolar (desacoplado)
  A_PREESCOLAR: 350,
  B_ESENCIAL_PREESCOLAR: 450,
  B_BALANCE_PREESCOLAR: 480,
  B_PREMIUM_PREESCOLAR: 510,

  // Primaria (desacoplado)
  A_PRIMARIA: 350,
  B_BALANCE_PRIMARIA: 480,
  B_PREMIUM_PRIMARIA: 510,
  PRI_C: 450,
  PRI_B: 480,
  PRI_A: 510,

  // Secundaria (desacoplado)
  A_SECUNDARIA: 350,
  SEC_B: 500,
  SEC_A: 550,

  // Preparatoria (desacoplado)
  A_PREPARATORIA: 350,
  PREP_B: 500,
  PREP_A: 550,
  PREP_C1: 600,
  PREP_C2: 720,

  // Universidad / Posgrado
  UNI_A: 550,
  UNI_B: 600,
  UNI_C: 720,
};

// Descuentos editables (% de descuento) — Objeto mutable
export const DISCOUNTS = {
  A_PREESCOLAR: 0,
  B_ESENCIAL_PREESCOLAR: 0,
  B_BALANCE_PREESCOLAR: 0,
  B_PREMIUM_PREESCOLAR: 0,

  A_PRIMARIA: 0,
  B_BALANCE_PRIMARIA: 0,
  B_PREMIUM_PRIMARIA: 0,
  PRI_C: 0,
  PRI_B: 0,
  PRI_A: 0,

  A_SECUNDARIA: 0,
  SEC_B: 0,
  SEC_A: 0,

  A_PREPARATORIA: 0,
  PREP_B: 0,
  PREP_A: 0,
  PREP_C1: 0,
  PREP_C2: 0,

  UNI_A: 0,
  UNI_B: 0,
  UNI_C: 0,
};

export const B_VARIANTS: {
  id: PackageBVariant;
  code: string;
  title: string;
  desc: string;
  price: number;
}[] = [
  { id: "esencial", code: "B.1", title: "Esencial", desc: "Diseño elegante y discreto", price: PRICES.B_ESENCIAL_PREESCOLAR },
  { id: "hybrid", code: "B.2", title: "Balance", desc: "9×12 cm + 9×35 cm", price: PRICES.B_BALANCE_PRIMARIA },
  { id: "max", code: "B.3", title: "Premium", desc: "9×35 cm en ambos lados", price: PRICES.B_PREMIUM_PRIMARIA },
  { id: "sec_b", code: "B.1", title: "Diseño B1", desc: "Impresión discreta en ambos lados", price: PRICES.SEC_B },
  { id: "sec_a", code: "B.2", title: "Diseño B2", desc: "Impresión mixta (institucional + discreta)", price: PRICES.SEC_A },
  { id: "prep_b", code: "B.1", title: "Diseño B1", desc: "Impresión discreta en ambos lados", price: PRICES.PREP_B },
  { id: "prep_a", code: "B.2", title: "Diseño B2", desc: "Impresión mixta (institucional + discreta)", price: PRICES.PREP_A },
  { id: "prep_c1", code: "C.1", title: "Diseño C1", desc: "Estola bordada de alta calidad", price: PRICES.PREP_C1 },
  { id: "prep_c2", code: "C.2", title: "Diseño C2", desc: "Estola bordada premium de alta definición", price: PRICES.PREP_C2 },
  { id: "pri_c", code: "B.1", title: "Básico Funcional", desc: "Impresión sencilla en ambos lados (9 x 12 cm)", price: PRICES.PRI_C },
  { id: "pri_b", code: "B.2", title: "Clásico Equilibrado", desc: "Impresión grande en un lado (9 x 28 cm) y chica en el otro (9 x 12 cm).", price: PRICES.PRI_B },
  { id: "pri_a", code: "B.3", title: "Clásico Destacado", desc: "Impresión grande en ambos lados 9 x 28 cm", price: PRICES.PRI_A },
  { id: "uni_b", code: "U.B", title: "Opción B - Bordado Sencillo", desc: "Estola personalizada con bordado clásico", price: PRICES.UNI_B },
  { id: "uni_c", code: "U.C", title: "Opción C - Bordado Premium", desc: "Estola premium con bordado detallado de alta definición", price: PRICES.UNI_C },
];

/**
 * Carga los precios y descuentos reales configurados en Supabase.
 * Actualiza los objetos PRICES, DISCOUNTS y el array B_VARIANTS en caliente.
 */
export async function loadDynamicPrices(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("pricing")
      .select("key, price, discount_percent");

    if (error) {
      console.warn("No se pudieron cargar precios de Supabase, usando valores locales:", error.message);
      return false;
    }

    if (data && data.length > 0) {
      // 1. Actualizar las propiedades de PRICES y DISCOUNTS en caliente
      data.forEach((row: { key: string; price: number | string; discount_percent?: number | string }) => {
        const valKey = row.key as keyof typeof PRICES;
        if (valKey in PRICES) {
          PRICES[valKey] = Number(row.price);
        }
        if (valKey in DISCOUNTS) {
          DISCOUNTS[valKey] = Number(row.discount_percent || 0);
        }
      });

      // 2. Sincronizar los precios dentro de B_VARIANTS para que las opciones del cotizador se enteren de la tarifa real
      B_VARIANTS.forEach((variant) => {
        if (variant.id === "esencial") variant.price = PRICES.B_ESENCIAL_PREESCOLAR;
        if (variant.id === "hybrid") variant.price = PRICES.B_BALANCE_PRIMARIA;
        if (variant.id === "max") variant.price = PRICES.B_PREMIUM_PRIMARIA;
        if (variant.id === "sec_b") variant.price = PRICES.SEC_B;
        if (variant.id === "sec_a") variant.price = PRICES.SEC_A;
        if (variant.id === "prep_b") variant.price = PRICES.PREP_B;
        if (variant.id === "prep_a") variant.price = PRICES.PREP_A;
        if (variant.id === "prep_c1") variant.price = PRICES.PREP_C1;
        if (variant.id === "prep_c2") variant.price = PRICES.PREP_C2;
        if (variant.id === "pri_c") variant.price = PRICES.PRI_C;
        if (variant.id === "pri_b") variant.price = PRICES.PRI_B;
        if (variant.id === "pri_a") variant.price = PRICES.PRI_A;
        if (variant.id === "uni_b") variant.price = PRICES.UNI_B;
        if (variant.id === "uni_c") variant.price = PRICES.UNI_C;
      });

      console.log("Tarifas y descuentos cargados y aplicados desde Supabase correctamente.");
      return true;
    }
    return false;
  } catch (err) {
    console.error("Fallo inesperado al sincronizar precios:", err);
    return false;
  }
}

/**
 * Mapea un paquete o variante a su llave (key) de precios
 */
export function getPriceKey(pkg?: PackageChoice, level?: Level): keyof typeof PRICES | undefined {
  if (!pkg) return undefined;
  
  if (pkg.kind === "A") {
    if (level === "preescolar") return "A_PREESCOLAR";
    if (level === "primaria") return "A_PRIMARIA";
    if (level === "secundaria") return "A_SECUNDARIA";
    if (level === "preparatoria") return "A_PREPARATORIA";
    if (level === "universidad") return "UNI_A";
    return "A_PRIMARIA"; // fallback seguro
  }
  
  if (pkg.variant === "esencial") {
    if (level === "preescolar") return "B_ESENCIAL_PREESCOLAR";
    return "B_ESENCIAL_PREESCOLAR"; // fallback seguro
  }
  
  if (pkg.variant === "hybrid") {
    if (level === "preescolar") return "B_BALANCE_PREESCOLAR";
    if (level === "primaria") return "B_BALANCE_PRIMARIA";
    return "B_BALANCE_PRIMARIA"; // fallback seguro
  }
  
  if (pkg.variant === "max") {
    if (level === "preescolar") return "B_PREMIUM_PREESCOLAR";
    if (level === "primaria") return "B_PREMIUM_PRIMARIA";
    return "B_PREMIUM_PRIMARIA"; // fallback seguro
  }

  if (pkg.variant === "sec_b") return "SEC_B";
  if (pkg.variant === "sec_a") return "SEC_A";
  if (pkg.variant === "prep_b") return "PREP_B";
  if (pkg.variant === "prep_a") return "PREP_A";
  if (pkg.variant === "prep_c1") return "PREP_C1";
  if (pkg.variant === "prep_c2") return "PREP_C2";
  if (pkg.variant === "pri_c") return "PRI_C";
  if (pkg.variant === "pri_b") return "PRI_B";
  if (pkg.variant === "pri_a") return "PRI_A";
  if (pkg.variant === "uni_b") return "UNI_B";
  if (pkg.variant === "uni_c") return "UNI_C";
  
  return undefined;
}

/**
 * Obtiene el precio unitario original de un paquete sin aplicar descuento.
 */
export function unitOriginalPrice(pkg?: PackageChoice, level?: Level): number {
  if (!pkg) return 0;
  const key = getPriceKey(pkg, level);
  if (key && key in PRICES) {
    return PRICES[key];
  }
  return 0;
}

/**
 * Obtiene el porcentaje de descuento de un paquete.
 */
export function getDiscountPercent(pkg?: PackageChoice, level?: Level): number {
  const key = getPriceKey(pkg, level);
  if (key && key in DISCOUNTS) {
    return DISCOUNTS[key];
  }
  return 0;
}

/**
 * Retorna el precio unitario neto (aplicando descuento si existiera).
 */
export function unitPrice(pkg?: PackageChoice, level?: Level): number {
  const basePrice = unitOriginalPrice(pkg, level);
  const discountPercent = getDiscountPercent(pkg, level);
  if (discountPercent > 0) {
    return Math.round(basePrice * (1 - discountPercent / 100));
  }
  return basePrice;
}

export function packageLabel(pkg?: PackageChoice, level?: Level): string {
  if (!pkg) return "—";
  if (pkg.kind === "A") {
    if (level === "universidad") return "Opción A — Impresión";
    return "Paquete A — Básico";
  }
  if (level === "universidad") {
    const v = B_VARIANTS.find((x) => x.id === pkg.variant);
    if (!v) return "Opción B/C — Bordado";
    return v.title;
  }
  const v = B_VARIANTS.find((x) => x.id === pkg.variant);
  if (!v) {
    if (pkg.kind === "C") return "Paquete C — Bordado";
    return "Paquete B — Personalizado";
  }
  const prefix = pkg.kind === "C" ? "Paquete C" : "Paquete B";
  return `${prefix} — ${v.code} ${v.title}`;
}

export function levelLabel(l?: Level): string {
  return LEVELS.find((x) => x.id === l)?.label ?? "—";
}

export function cityLabel(c?: City): string {
  return CITIES.find((x) => x.id === c)?.label ?? "—";
}

export function formatMXN(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(d: string): string {
  if (!d) return "—";
  try {
    const parts = d.split("-");
    if (parts.length !== 3) return d;
    const [year, month, day] = parts.map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return d;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return d;
  }
}
