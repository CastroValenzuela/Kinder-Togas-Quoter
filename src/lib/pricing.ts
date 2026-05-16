import { Sparkle, BookOpen, Library, GraduationCap, University, Award, type LucideIcon } from "lucide-react";

export type Level =
  | "preescolar"
  | "primaria"
  | "secundaria"
  | "preparatoria"
  | "universidad"
  | "posgrado";

export type ServiceType = "renta" | "venta";
export type City = "tijuana" | "ensenada";
export type PackageBVariant = "standard" | "hybrid" | "max";
export type PackageChoice =
  | { kind: "A" }
  | { kind: "B"; variant: PackageBVariant };

export const LEVELS: { id: Level; label: string; icon: LucideIcon }[] = [
  { id: "preescolar", label: "Preescolar", icon: Sparkle },
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
];

export function unitPrice(pkg?: PackageChoice): number {
  if (!pkg) return 0;
  if (pkg.kind === "A") return PRICES.A;
  switch (pkg.variant) {
    case "standard": return PRICES.B_STANDARD;
    case "hybrid":   return PRICES.B_HYBRID;
    case "max":      return PRICES.B_MAX;
  }
}

export function packageLabel(pkg?: PackageChoice): string {
  if (!pkg) return "—";
  if (pkg.kind === "A") return "Paquete A — Básico";
  const v = B_VARIANTS.find((x) => x.id === pkg.variant)!;
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
