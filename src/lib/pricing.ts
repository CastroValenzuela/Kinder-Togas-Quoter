import { Shapes, BookOpen, Library, GraduationCap, University, Award, type LucideIcon } from "lucide-react";

export type Level =
  | "preescolar"
  | "primaria"
  | "secundaria"
  | "preparatoria"
  | "universidad"
  | "posgrado";

export type ServiceType = "renta" | "venta";
export type City = "tijuana" | "ensenada";
export type PackageBVariant = "standard" | "hybrid" | "max" | "sec_a" | "sec_b" | "pri_a" | "pri_b" | "pri_c";
export type PackageChoice =
  | { kind: "A" }
  | { kind: "B"; variant: PackageBVariant };

export const LEVELS: { id: Level; label: string; icon: LucideIcon }[] = [
  { id: "preescolar", label: "Preescolar", icon: Shapes },
  { id: "primaria", label: "Primaria", icon: BookOpen },
  { id: "secundaria", label: "Secundaria", icon: Library },
  { id: "preparatoria", label: "Preparatoria", icon: GraduationCap },
  { id: "universidad", label: "Universidad", icon: University },
  { id: "posgrado", label: "Posgrado", icon: Award },
];

export const CITIES: { id: City; label: string }[] = [
  { id: "tijuana", label: "Tijuana" },
  { id: "ensenada", label: "Ensenada" },
];

// Precios editables (MXN, por alumno)
export const PRICES = {
  A: 350,
  B_STANDARD: 450, // B.1 9x12 ambos lados
  B_HYBRID: 550,   // B.2 9x12 + 9x35
  B_MAX: 650,      // B.3 9x35 ambos lados
  SEC_A: 550,      // Secundaria Diseño A (Mixto)
  SEC_B: 450,      // Secundaria Diseño B (Discreto)
  PRI_A: 650,      // Primaria Diseño A (Clásico Destacado - Grande ambos lados)
  PRI_B: 550,      // Primaria Diseño B (Clásico Equilibrado - Grande + Pequeño)
  PRI_C: 450,      // Primaria Diseño C (Básico Funcional - Sencillo ambos lados)
  UNI_A: 600,      // Universidad/Posgrado Opción A (Impresión)
  UNI_B: 680,      // Universidad/Posgrado Opción B (Bordado)
} as const;

export const B_VARIANTS: {
  id: PackageBVariant;
  code: string;
  title: string;
  desc: string;
  price: number;
}[] = [
  { id: "standard", code: "B.1", title: "Estándar Duo", desc: "9×12 cm en ambos lados (sin diseño)", price: PRICES.B_STANDARD },
  { id: "hybrid", code: "B.2", title: "Híbrido", desc: "9×12 cm + 9×35 cm", price: PRICES.B_HYBRID },
  { id: "max", code: "B.3", title: "Max Duo", desc: "9×35 cm en ambos lados", price: PRICES.B_MAX },
  { id: "sec_a", code: "S.A", title: "Diseño A - Mixto", desc: "Impresión mixta (institucional + discreta)", price: PRICES.SEC_A },
  { id: "sec_b", code: "S.B", title: "Diseño B - Discreto", desc: "Impresión discreta en ambos lados", price: PRICES.SEC_B },
  { id: "pri_a", code: "P.A", title: "Diseño A - Clásico Destacado", desc: "Impresión grande en ambos lados", price: PRICES.PRI_A },
  { id: "pri_b", code: "P.B", title: "Diseño B - Clásico Equilibrado", desc: "Impresión grande + pequeña", price: PRICES.PRI_B },
  { id: "pri_c", code: "P.C", title: "Diseño C - Básico Funcional", desc: "Impresión sencilla en ambos lados", price: PRICES.PRI_C },
  { id: "uni_b", code: "U.B", title: "Opción B - Bordado", desc: "Estola personalizada con bordado", price: PRICES.UNI_B },
];

export function unitPrice(pkg?: PackageChoice, level?: Level): number {
  if (!pkg) return 0;
  if (pkg.kind === "A") {
    if (level === "universidad" || level === "posgrado") return PRICES.UNI_A;
    return PRICES.A;
  }
  const variant = B_VARIANTS.find((v) => v.id === pkg.variant);
  return variant ? variant.price : 0;
}

export function packageLabel(pkg?: PackageChoice, level?: Level): string {
  if (!pkg) return "—";
  if (pkg.kind === "A") {
    if (level === "universidad" || level === "posgrado") return "Opción A — Impresión";
    return "Paquete A — Básico";
  }
  const v = B_VARIANTS.find((x) => x.id === pkg.variant)!;
  if (level === "universidad" || level === "posgrado") return "Opción B — Bordado";
  return `Paquete B — ${v.code} ${v.title}`;
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
