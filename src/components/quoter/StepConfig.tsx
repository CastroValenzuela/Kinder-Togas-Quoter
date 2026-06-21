import { useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Minus, Plus, ArrowRight, Camera, Shirt, Sparkles, Layers, Truck, GraduationCap, Users, Gem, Award, Ruler, Palette, User, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
const assets = import.meta.glob('@/assets/**/*.{jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const getAsset = (path: string) => {
  const url = assets[`/src/assets/${path}`];
  if (!url) console.warn(`Asset not found: ${path}`);
  return url || "";
};

const PACKAGE_ASSETS: Record<string, { src: string, mask?: string, stolaNegro?: string }> = {
  pri_c: { src: getAsset('Renta/Primaria/B1/B1-base.jpg'), mask: getAsset('Renta/Primaria/B1/B1-estola-base.png'), stolaNegro: getAsset('Renta/Primaria/B1/B1-estola-negro.png') },
  pri_b: { src: getAsset('Renta/Primaria/B2/B2-base.jpg'), mask: getAsset('Renta/Primaria/B2/B2-estola-base.png'), stolaNegro: getAsset('Renta/Primaria/B2/B2-estola-negro.png') },
  pri_a: { src: getAsset('Renta/Primaria/B3/B3-base.jpg'), mask: getAsset('Renta/Primaria/B3/B3-estola-base.png'), stolaNegro: getAsset('Renta/Primaria/B3/B3-estola-negro.png') },
  sec_b: { src: getAsset('Renta/Secundaria/B1/B1-base.jpg'), mask: getAsset('Renta/Secundaria/B1/B1-estola-base.png'), stolaNegro: getAsset('Renta/Secundaria/B1/B1-estola-negro.png') },
  sec_a: { src: getAsset('Renta/Secundaria/B2/B2-base.jpg'), mask: getAsset('Renta/Secundaria/B2/B2-estola-base.png'), stolaNegro: getAsset('Renta/Secundaria/B2/B2-estola-negro.png') },
  prep_b: { src: getAsset('Renta/Preparatoria/B1/B1-base.jpg'), mask: getAsset('Renta/Preparatoria/B1/B1-estola-base.png'), stolaNegro: getAsset('Renta/Preparatoria/B1/B1-estola-negro.png') },
  prep_a: { src: getAsset('Renta/Preparatoria/B2/B2-base.jpg'), mask: getAsset('Renta/Preparatoria/B2/B2-estola-base.png'), stolaNegro: getAsset('Renta/Preparatoria/B2/B2-estola-negro.png') },
  prep_c1: { src: getAsset('Renta/Preparatoria/C1/C1-base.jpg'), mask: getAsset('Renta/Preparatoria/C1/C1-estola-base.png'), stolaNegro: getAsset('Renta/Preparatoria/C1/C1-estola-negro.png') },
  prep_c2: { src: getAsset('Renta/Preparatoria/C2/C2-base.jpg'), mask: getAsset('Renta/Preparatoria/C2/C2-estola-base.png'), stolaNegro: getAsset('Renta/Preparatoria/C2/C2-estola-negro.png') },
  uni_b: { src: getAsset('Renta/Universidad/B/B-base.jpg'), mask: getAsset('Renta/Universidad/B/B-estola-base.png'), stolaNegro: getAsset('Renta/Universidad/B/B-estola-negro.png') },
  uni_c: { src: getAsset('Renta/Universidad/C/C-base.jpg'), mask: getAsset('Renta/Universidad/C/C-estola-base.png'), stolaNegro: getAsset('Renta/Universidad/C/C-estola-negro.png') },
};

const PAQUETE_A_ASSETS: Record<string, string> = {
  primaria: getAsset('Renta/Primaria/Paquete A/negro-dorado.jpg'),
  secundaria: getAsset('Renta/Secundaria/Paquete A/negro-dorado.jpg'),
  preparatoria: getAsset('Renta/Preparatoria/Paquete A/negro-dorado.jpg'),
  universidad: getAsset('Renta/Universidad/A.jpg'),
};

const PREESCOLAR_PAQUETE_B: Record<string, string> = {
  esencial: getAsset('Renta/Preescolar/esencial.jpg'),
  hybrid: getAsset('Renta/Preescolar/balance.jpg'),
  max: getAsset('Renta/Preescolar/premium.jpg'),
};

const VENTA_PREESCOLAR_PAQUETE_B: Record<string, { src: string, mask?: string }> = {
  esencial: { src: getAsset('Venta/Preescolar/Estolas/E1.jpg'), mask: getAsset('Venta/Preescolar/Estolas/E1-mask.png') },
  hybrid: { src: getAsset('Venta/Preescolar/Estolas/E2.jpg'), mask: getAsset('Venta/Preescolar/Estolas/E2-mask.png') },
  max: { src: getAsset('Venta/Preescolar/Estolas/E3.jpg'), mask: getAsset('Venta/Preescolar/Estolas/E3-mask.png') },
};

const VENTA_PREESCOLAR_TOGAS: Record<string, string> = {
  azul: getAsset('Venta/Preescolar/Togas/azul.jpeg'),
  rojo: getAsset('Venta/Preescolar/Togas/rojo.jpeg'),
  negro: getAsset('Venta/Preescolar/Togas/negro.jpeg'),
  rosa: getAsset('Venta/Preescolar/Togas/rosa.jpeg'),
  azul_cielo: getAsset('Venta/Preescolar/Togas/azul-cielo.jpeg'),
};

const VENTA_PREESCOLAR_RECUERDOS: Record<string, string> = {
  medalla_standard: getAsset('Venta/Preescolar/Recuerdos/Medallas/medalla.jpeg'),
  medalla_personalizada: getAsset('Venta/Preescolar/Recuerdos/Medallas/medalla_personalizada.jpeg'),
  oso_graduacion_azul: getAsset('Venta/Preescolar/Recuerdos/Osos/oso_azul.jpeg'),
  oso_graduacion_rosa: getAsset('Venta/Preescolar/Recuerdos/Osos/oso_rosa.jpeg'),
};

const PREESCOLAR_PAQUETE_A: Record<string, Record<string, string>> = {
  negro: { dorada: getAsset('Renta/Preescolar/Paquete A/negro-dorado.jpg'), plateada: getAsset('Renta/Preescolar/Paquete A/negro-plata.jpg'), azul: getAsset('Renta/Preescolar/Paquete A/negro-azul.jpg'), roja: getAsset('Renta/Preescolar/Paquete A/negro-rojo.jpg'), default: getAsset('Renta/Preescolar/Paquete A/negro-dorado.jpg') },
  azul: { dorada: getAsset('Renta/Preescolar/Paquete A/azul-dorado.jpg'), plateada: getAsset('Renta/Preescolar/Paquete A/azul-plata.jpg'), azul: getAsset('Renta/Preescolar/Paquete A/azul-azul.jpg'), roja: getAsset('Renta/Preescolar/Paquete A/azul-rojo.jpg'), default: getAsset('Renta/Preescolar/Paquete A/azul-dorado.jpg') },
  verde: { dorada: getAsset('Renta/Preescolar/Paquete A/verde-dorado.jpg'), plateada: getAsset('Renta/Preescolar/Paquete A/verde-plata.jpg'), azul: getAsset('Renta/Preescolar/Paquete A/verde-azul.jpg'), roja: getAsset('Renta/Preescolar/Paquete A/verde-rojo.jpg'), default: getAsset('Renta/Preescolar/Paquete A/verde-dorado.jpg') },
  turquesa: { dorada: getAsset('Renta/Preescolar/Paquete A/turquesa-dorado.jpg'), plateada: getAsset('Renta/Preescolar/Paquete A/turquesa-plata.jpg'), azul: getAsset('Renta/Preescolar/Paquete A/turquesa-turquesa.jpg'), roja: getAsset('Renta/Preescolar/Paquete A/turquesa-rojo.jpg'), default: getAsset('Renta/Preescolar/Paquete A/turquesa-dorado.jpg') },
  rojo: { dorada: getAsset('Renta/Preescolar/Paquete A/rojo-dorado.jpg'), plateada: getAsset('Renta/Preescolar/Paquete A/rojo-plata.jpg'), azul: getAsset('Renta/Preescolar/Paquete A/rojo-azul.jpg'), roja: getAsset('Renta/Preescolar/Paquete A/rojo-rojo.jpg'), default: getAsset('Renta/Preescolar/Paquete A/rojo-dorado.jpg') },
  magenta: { dorada: getAsset('Renta/Preescolar/Paquete A/turquesa-dorado.jpg'), plateada: getAsset('Renta/Preescolar/Paquete A/turquesa-plata.jpg'), azul: getAsset('Renta/Preescolar/Paquete A/turquesa-turquesa.jpg'), roja: getAsset('Renta/Preescolar/Paquete A/turquesa-rojo.jpg'), default: getAsset('Renta/Preescolar/Paquete A/turquesa-dorado.jpg') },
};

import {
  CITIES,
  B_VARIANTS,
  PRICES,
  TOGA_COLORS,
  STOLA_COLORS,
  formatMXN,
  unitPrice,
  unitOriginalPrice,
  getDiscountPercent,
  type City,
  type PackageChoice,
  type PackageBVariant,
  type Level,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  level?: Level;
  service?: "renta" | "venta";
  city?: City;
  pkg?: PackageChoice & { variant?: PackageBVariant };
  productCategory?: "togas" | "estolas" | "birretes" | "borlas" | "recuerdos";
  quantity: number;
  togaColor: string;
  stolaColor: string;
  togaSize?: string;
  onCity: (c: City) => void;
  onPkg: (p: PackageChoice) => void;
  onProductCategory?: (cat: "togas" | "estolas" | "birretes" | "borlas" | "recuerdos") => void;
  onQty: (n: number) => void;
  onTogaColor: (color: string) => void;
  onStolaColor: (color: string) => void;
  onTogaSize?: (size: string) => void;
  canContinue: boolean;
  onContinue: () => void;
};

const FEATURES_A = [
  { icon: Layers, text: "Estola lisa" },
  { icon: Shirt, text: "Renta de toga, birrete y borla del año." },
  { icon: Truck, text: "Entrega y recolección coordinadas." },
];

const FEATURES_B: Record<"esencial" | "hybrid" | "max", { icon: typeof Camera; text: string }[]> = {
  esencial: [
    { icon: Camera, text: "Diseño compacto 9x12 cm en ambos lados." },
    { icon: Shirt, text: "Incluye toga premium, birrete, borla del año y estola." },
    { icon: Truck, text: "Entrega y recolección coordinadas." },
  ],
  hybrid: [
    { icon: Camera, text: "Impresión combinada 9×12 cm + 9×35 cm panorámica." },
    { icon: Shirt, text: "Toga premium, birrete, borla del año y estola." },
    { icon: Truck, text: "Entrega y recolección coordinadas." },
  ],
  max: [
    { icon: Camera, text: "Impresión 9×35 cm panorámica en ambos lados." },
    { icon: Shirt, text: "Toga premium, birrete, borla del año y estola." },
    { icon: Layers, text: "Máxima calidad de impresión profesional." },
  ],
};

const FEATURES_VENTA_PREESCOLAR: Record<"esencial" | "hybrid" | "max", { icon: typeof Camera; text: string }[]> = {
  esencial: [
    { icon: Camera, text: "Diseño clásico 9x12 cm por lado en ambos lados." },
    { icon: Sparkles, text: "Personalización esencial: Logo, nombre y año de graduación." },
    { icon: Layers, text: "Acabado premium: Tela satinada de alta calidad con impresión profesional." },
  ],
  hybrid: [
    { icon: Camera, text: "Diseño híbrido: 9×12 cm + 9×35 cm." },
    { icon: Sparkles, text: "Personalización equilibrada: Una impresión grande y una pequeña." },
    { icon: Layers, text: "Acabado premium: Tela satinada de alta calidad con impresión profesional." },
  ],
  max: [
    { icon: Camera, text: "Cobertura completa: Diseño en ambos lados de la estola." },
    { icon: Sparkles, text: "Personalización total: Nombre, logo escolar y temática personalizada." },
    { icon: Layers, text: "Acabado premium: Tela satinada de alta calidad con impresión profesional." },
  ],
};

const FEATURES_VENTA_TOGAS: Record<"toga_completa" | "toga_borla", { icon: typeof Camera; text: string }[]> = {
  toga_completa: [
    { icon: Shirt, text: "Incluye Toga de poliéster brillante de alta calidad." },
    { icon: GraduationCap, text: "Incluye Birrete clásico forrado con botón y listón reforzado." },
    { icon: Award, text: "Incluye Borla del año con charm 2026 dorado." },
    { icon: Layers, text: "Incluye Estola de graduación premium." },
  ],
  toga_borla: [
    { icon: Shirt, text: "Incluye Toga de poliéster brillante de alta calidad." },
    { icon: GraduationCap, text: "Incluye Birrete clásico forrado con botón y listón reforzado." },
    { icon: Award, text: "Incluye Borla del año con charm 2026 dorado." },
  ],
};

const FEATURES_VENTA_BIRRETES: Record<"birrete_decorado" | "birrete_liso", { icon: typeof Camera; text: string }[]> = {
  birrete_decorado: [
    { icon: Sparkles, text: "Birrete decorado personalizado (Nombre, Año y Temática)." },
    { icon: Layers, text: "Máximo impacto visual para el evento." },
  ],
  birrete_liso: [
    { icon: Layers, text: "Birrete liso en color de tu elección." },
    { icon: GraduationCap, text: "Incluye borla del año." },
  ]
};

const FEATURES_B_SEC: Record<"sec_a" | "sec_b", { icon: typeof Camera; text: string }[]> = {
  sec_a: [
    { icon: Camera, text: "Impresión mixta: institucional + datos discretos." },
    { icon: Shirt, text: "Toga, birrete, borla y estola personalizada." },
    { icon: Sparkles, text: "Presencia visual con equilibrio formal." },
  ],
  sec_b: [
    { icon: Camera, text: "Impresión discreta, sobria en ambos lados." },
    { icon: Shirt, text: "Toga, birrete, borla y estola personalizada." },
    { icon: Truck, text: "Entrega y recolección coordinadas." },
  ],
};

const FEATURES_B_PREP: Record<"prep_a" | "prep_b", { icon: typeof Camera; text: string }[]> = {
  prep_a: [
    { icon: Camera, text: "Impresión mixta: institucional + datos discretos." },
    { icon: Shirt, text: "Toga, birrete, borla y estola personalizada." },
    { icon: Sparkles, text: "Presencia visual con equilibrio formal." },
    { icon: Gem, text: "Calidad premium en cada detalle." },
  ],
  prep_b: [
    { icon: Camera, text: "Impresión discreta, sobria en ambos lados." },
    { icon: Shirt, text: "Toga, birrete, borla y estola personalizada." },
    { icon: Truck, text: "Entrega y recolección coordinadas." },
    { icon: Gem, text: "Calidad premium en cada detalle." },
  ],
};

const FEATURES_C_PREP: Record<"prep_c1" | "prep_c2", { icon: typeof Camera; text: string }[]> = {
  prep_c1: [
    { icon: Layers, text: "Estola bordada de alta calidad." },
    { icon: Shirt, text: "Toga, birrete, borla y estola personalizada." },
    { icon: Truck, text: "Entrega y recolección coordinadas." },
    { icon: Gem, text: "Calidad premium en cada detalle." },
  ],
  prep_c2: [
    { icon: Layers, text: "Estola bordada premium de alta definición." },
    { icon: Shirt, text: "Toga, birrete, borla y estola personalizada." },
    { icon: Truck, text: "Entrega y recolección coordinadas." },
    { icon: Gem, text: "Calidad premium en cada detalle." },
  ],
};

const FEATURES_B_PRI: Record<"pri_a" | "pri_b" | "pri_c", { icon: typeof Camera; text: string }[]> = {
  pri_a: [
    { icon: Camera, text: "Impresión grande en ambos lados (alta visibilidad)." },
    { icon: Shirt, text: "Toga, birrete, borla y estola representativa." },
    { icon: Truck, text: "Entrega y recolección coordinadas." },
  ],
  pri_b: [
    { icon: Camera, text: "Nombre grande + generación en tamaño discreto." },
    { icon: Shirt, text: "Toga, birrete, borla y estola armónica." },
    { icon: Truck, text: "Entrega y recolección coordinadas." },
  ],
  pri_c: [
    { icon: Camera, text: "Impresión sencilla y clara en ambos lados." },
    { icon: Shirt, text: "Toga, birrete, borla y estola básica funcional." },
    { icon: Truck, text: "Entrega y recolección coordinadas." },
  ],
};

const FEATURES_UNI_A = [
  { icon: Layers, text: "Estola lisa" },
  { icon: Shirt, text: "Renta de toga premium" },
  { icon: GraduationCap, text: "Birrete con borla institucional" },
  { icon: Truck, text: "Entrega y recolección coordinadas" },
];

const FEATURES_UNI_B = [
  { icon: Shirt, text: "Renta de toga premium" },
  { icon: GraduationCap, text: "Birrete con borla institucional" },
  { icon: Layers, text: "Estola satinada con impresión de alta calidad a color en ambos lados" },
  { icon: Truck, text: "Entrega y recolección coordinadas" },
  { icon: Users, text: "Atención personalizada y asesoría" },
];

const FEATURES_UNI_C = [
  { icon: Shirt, text: "Renta de toga premium" },
  { icon: GraduationCap, text: "Birrete con borla institucional" },
  { icon: Layers, text: "Estola satinada con bordado de alta calidad en ambos lados" },
  { icon: Truck, text: "Entrega y recolección coordinadas" },
  { icon: Users, text: "Atención personalizada y asesoría" },
];

const VENTA_PREESCOLAR_TOGA_COLORS = [
  { id: "azul", label: "Azul Rey", hex: "#1E40AF" },
  { id: "rojo", label: "Rojo", hex: "#DC2626" },
  { id: "negro", label: "Negro", hex: "#1A1A1A" },
  { id: "rosa", label: "Rosa", hex: "#FBCFE8" },
  { id: "azul_cielo", label: "Azul Cielo", hex: "#7DD3FC" },
];

const FEATURES_VENTA_BORLAS: Record<"borla_dije" | "borla_clasica", { icon: typeof Camera; text: string }[]> = {
  borla_dije: [
    { icon: Camera, text: "Personaliza el dije con foto del alumno, logo escolar, nombre, generación o temática especial." },
    { icon: Shirt, text: "Amplia variedad de colores disponibles para combinar con tu graduación." },
    { icon: Award, text: "Incluye charm 2026 dorado de alta calidad." },
    { icon: Gem, text: "Material resistente y acabado premium." },
    { icon: GraduationCap, text: "Ideal para preescolar, primaria y secundaria." },
  ],
  borla_clasica: [
    { icon: Award, text: "Incluye charm 2026 dorado de alta calidad." },
    { icon: Shirt, text: "Diseño clásico tradicional y elegante." },
    { icon: Gem, text: "Acabado de primera y durabilidad garantizada." },
  ],
};

const FEATURES_VENTA_RECUERDOS: Record<"medalla_standard" | "medalla_personalizada" | "oso_graduacion", { icon: typeof Award; text: string }[]> = {
  medalla_standard: [
    { icon: Award, text: "Medalla conmemorativa clásica de graduación." },
    { icon: Gem, text: "Listón satinado de alta calidad." },
    { icon: Sparkles, text: "Excelente detalle para el recuerdo." }
  ],
  medalla_personalizada: [
    { icon: Award, text: "Medalla personalizada con grabado de alta calidad." },
    { icon: User, text: "Nombre del alumno y año de graduación grabados." },
    { icon: Sparkles, text: "Acabado metálico premium." }
  ],
  oso_graduacion: [
    { icon: Shirt, text: "Oso de peluche de graduación con mini toga y birrete." },
    { icon: Palette, text: "Color de vestimenta a elegir (Azul o Rosa)." }
  ]
};

export function StepConfig({
  level,
  service,
  city,
  pkg,
  productCategory,
  quantity,
  togaColor,
  stolaColor,
  togaSize,
  onCity,
  onPkg,
  onProductCategory,
  onQty,
  onTogaColor,
  onStolaColor,
  onTogaSize,
  canContinue,
  onContinue,
}: Props) {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const isPreescolar = level === "preescolar";
  const isPrimaria = level === "primaria";
  const isSecundaria = level === "secundaria";
  const isPreparatoria = level === "preparatoria";
  const isUni = level === "universidad";
  const isB = pkg?.kind === "B";
  const isC = pkg?.kind === "C";

  // 3D Tilt Effect Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["2.5deg", "-2.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-2.5deg", "2.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x / rect.width - 0.5);
    mouseY.set(y / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  // Filtrar variantes según el nivel
  const visibleVariants = B_VARIANTS.filter((v) => {
    if (isSecundaria) return v.id.startsWith("sec_");
    if (isPrimaria) return v.id.startsWith("pri_");
    if (isPreparatoria) {
      if (pkg?.kind === "C") return v.id === "prep_c1" || v.id === "prep_c2";
      return v.id === "prep_a" || v.id === "prep_b";
    }
    if (isUni) return v.id.startsWith("uni_");
    return !v.id.startsWith("sec_") && !v.id.startsWith("pri_") && !v.id.startsWith("prep_") && !v.id.startsWith("uni_");
  });

  let features = FEATURES_A;
  if (service === "venta" && level === "preescolar") {
    if (productCategory === "togas") {
      features = FEATURES_VENTA_TOGAS[(pkg?.variant as "toga_completa" | "toga_borla") || "toga_completa"] || FEATURES_A;
    } else if (productCategory === "birretes") {
      features = FEATURES_VENTA_BIRRETES[(pkg?.variant as "birrete_decorado" | "birrete_liso") || "birrete_decorado"] || FEATURES_A;
    } else if (productCategory === "borlas") {
      features = FEATURES_VENTA_BORLAS[(pkg?.variant as "borla_dije" | "borla_clasica") || "borla_dije"] || FEATURES_A;
    } else if (productCategory === "recuerdos") {
      features = FEATURES_VENTA_RECUERDOS[(pkg?.variant as "medalla_standard" | "medalla_personalizada" | "oso_graduacion") || "medalla_standard"] || FEATURES_A;
    } else if (pkg?.kind === "B" && pkg.variant) {
      features = FEATURES_VENTA_PREESCOLAR[pkg.variant as "esencial" | "hybrid" | "max"] || FEATURES_A;
    }
  } else if (isUni) {
    if (pkg?.kind === "A") {
      features = FEATURES_UNI_A;
    } else if (pkg?.kind === "B" && pkg.variant === "uni_c") {
      features = FEATURES_UNI_C;
    } else {
      features = FEATURES_UNI_B;
    }
  } else if ((pkg?.kind === "B" || pkg?.kind === "C") && pkg?.variant) {
    if (pkg.variant.startsWith("sec_")) {
      features = FEATURES_B_SEC[pkg.variant as "sec_a" | "sec_b"] || FEATURES_A;
    } else if (pkg.variant.startsWith("pri_")) {
      features = FEATURES_B_PRI[pkg.variant as "pri_a" | "pri_b" | "pri_c"] || FEATURES_A;
    } else if (pkg.variant.startsWith("prep_")) {
      if (pkg.kind === "C") {
        features = FEATURES_C_PREP[pkg.variant as "prep_c1" | "prep_c2"] || FEATURES_A;
      } else {
        features = FEATURES_B_PREP[pkg.variant as "prep_a" | "prep_b"] || FEATURES_A;
      }
    } else {
      features = FEATURES_B[pkg.variant as "esencial" | "hybrid" | "max"] || FEATURES_A;
    }
  }

  const total = unitPrice(pkg, level, service) * quantity;

  // Get dynamic image showcase based on level and selected configuration
  const showcaseMedia = useMemo(() => {
    let result: string | { src: string; mask?: string; stolaNegro?: string } = getAsset('gown-showcase.jpg');
    
    if (level === "preescolar") {
      if (pkg?.kind === "A") {
        const colorVariants = PREESCOLAR_PAQUETE_A[togaColor] || PREESCOLAR_PAQUETE_A.negro;
        result = colorVariants[stolaColor] || colorVariants.default;
      } else if (pkg?.kind === "B" && pkg?.variant) {
        if (service === "venta") {
          if (productCategory === "togas") {
            const colorKey = togaColor === "roja" ? "rojo" : togaColor;
            result = VENTA_PREESCOLAR_TOGAS[colorKey] || VENTA_PREESCOLAR_TOGAS.negro;
          } else if (productCategory === "birretes") {
            let colorSuffix = "negro"; // default
            if (stolaColor === "azul") colorSuffix = "azul";
            else if (stolaColor === "roja" || stolaColor === "rojo") colorSuffix = "rojo";
            else if (stolaColor === "rosa_claro") colorSuffix = "rosa";
            else if (stolaColor === "azul_cielo") colorSuffix = "cielo";

            if (pkg.variant === "birrete_liso") {
              result = getAsset(`Venta/Preescolar/Birretes/liso-${colorSuffix}.jpg`);
            } else {
              result = getAsset(`Venta/Preescolar/Birretes/decorado-${colorSuffix}.jpg`);
            }
          } else if (productCategory === "borlas") {
            let colorSuffix = stolaColor;
            if (stolaColor === "azul_cielo") colorSuffix = "azulbebe";
            else if (stolaColor === "rosa_fiusha") colorSuffix = "fiusha";
            else if (stolaColor === "verde_esmeralda") colorSuffix = "esmeralda";
            else if (stolaColor === "verde_limon") colorSuffix = "limon";
            else if (stolaColor === "dorada") colorSuffix = "dorado";
            else if (stolaColor === "roja") colorSuffix = "rojo";

            // Placeholder hasta que suban las imagenes de la clásica
            if (pkg.variant === "borla_clasica") {
              result = getAsset(`Venta/Preescolar/Borlas/clasica-${colorSuffix}.jpg`);
            } else {
              result = getAsset(`Venta/Preescolar/Borlas/dije-${colorSuffix}.jpg`);
            }
          } else if (productCategory === "recuerdos") {
            if (pkg.variant === "oso_graduacion") {
              const isPink = stolaColor === "rosa";
              result = isPink ? VENTA_PREESCOLAR_RECUERDOS.oso_graduacion_rosa : VENTA_PREESCOLAR_RECUERDOS.oso_graduacion_azul;
            } else if (pkg.variant === "medalla_personalizada") {
              result = VENTA_PREESCOLAR_RECUERDOS.medalla_personalizada;
            } else {
              result = VENTA_PREESCOLAR_RECUERDOS.medalla_standard;
            }
          } else {
            result = VENTA_PREESCOLAR_PAQUETE_B[pkg.variant] || { src: getAsset('Venta/Preescolar/Estolas/E2.jpg') };
          }
        } else {
          result = PREESCOLAR_PAQUETE_B[pkg.variant] || getAsset('Renta/Preescolar/balance.jpg');
        }
      }
    } else {
      if (pkg?.kind === "A") {
        result = PAQUETE_A_ASSETS[level!] || getAsset('gown-showcase.jpg');
      } else if ((pkg?.kind === "B" || pkg?.kind === "C") && pkg?.variant) {
        result = PACKAGE_ASSETS[pkg.variant] || getAsset('gown-showcase.jpg');
      }
    }
    
    // Normalize return type
    return typeof result === "string" ? { src: result } : result;
  }, [level, pkg, togaColor, stolaColor, service]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="mb-8 sm:mb-10">
        <h2 className="font-display text-3xl sm:text-4xl text-foreground tracking-tight">
          Configura tu cotización
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Personaliza ciudad, paquete y cantidad. El total se actualiza en vivo.
        </p>
      </header>

      <div className="rounded-2xl border border-hairline bg-card overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_50px_-30px_rgba(17,34,68,0.18)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
          {/* LEFT — Visual showcase */}
          <div className="relative bg-cream/60 lg:sticky lg:top-0 lg:self-start perspective-[1000px]">
            <motion.div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="aspect-[4/5] lg:aspect-auto lg:h-[680px] w-full overflow-hidden relative flex items-center justify-center p-0 cursor-crosshair"
            >
              
              {/* Premium Skeleton Loader */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="w-[75%] h-[85%] bg-black/5 dark:bg-white/5 rounded-3xl animate-pulse" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={showcaseMedia.src + (stolaColor !== "blanco" ? stolaColor : "")}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={cn(
                    "relative max-h-full flex items-center justify-center z-10",
                    service === "venta" ? "w-full h-full" : "aspect-[816/1118]"
                  )}
                >
                  <img
                    src={showcaseMedia.src}
                    alt="Toga de graduación premium"
                    className={cn(
                      "w-full h-full object-contain"
                    )}
                  />

                  {showcaseMedia.mask && stolaColor !== "blanco" && productCategory !== "birretes" && productCategory !== "borlas" && (() => {
                     const activeStola = STOLA_COLORS.find((c) => c.id === stolaColor);
                     const stolaBg = (activeStola as any)?.gradient || activeStola?.hex || "transparent";
                     const isBlackStola = stolaColor === "negro";

                     const maskStyles = {
                       WebkitMaskImage: `url(${showcaseMedia.mask})`,
                       WebkitMaskSize: (showcaseMedia as any).maskSize || "contain",
                       WebkitMaskPosition: "center",
                       WebkitMaskRepeat: "no-repeat",
                       maskImage: `url(${showcaseMedia.mask})`,
                       maskSize: (showcaseMedia as any).maskSize || "contain",
                       maskPosition: "center",
                       maskRepeat: "no-repeat"
                     };

                    if (isBlackStola) {
                      // Si el usuario subió el PNG renderizado en negro, lo superponemos directamente.
                      if (showcaseMedia.stolaNegro) {
                        return (
                          <div className="absolute inset-0 z-20">
                            <img
                              src={showcaseMedia.stolaNegro}
                              alt="Estola negra"
                              className="w-full h-full object-contain drop-shadow-sm"
                            />
                          </div>
                        );
                      }

                      // Fallback: Usamos una escala mayor (1.06) para paquetes antiguos para empujar sus líneas blancas.
                      // Para B1 usamos 1.025 porque el usuario ya redujo la máscara manualmente.
                      const isB1 = pkg?.variant === "pri_c" || pkg?.variant === "sec_b";
                      const scaleClass = isB1 ? "scale-[1.025]" : "scale-[1.06]";

                      return (
                        <div 
                          className="absolute inset-0"
                          style={{ 
                            // Este drop shadow expande la estola negra 1 pixel hacia afuera en todas direcciones.
                            // Esto cubre perfectamente la línea blanca de la estola original que se asomaba por detrás.
                            filter: `drop-shadow(1px 0 0 #1A1A1A) drop-shadow(-1px 0 0 #1A1A1A) drop-shadow(0 1px 0 #1A1A1A) drop-shadow(0 -1px 0 #1A1A1A)` 
                          }}
                        >
                          {/* El contenedor con la máscara recorta exactamente la silueta de la estola */}
                          <div className="w-full h-full relative" style={maskStyles}>
                            <img
                              src={showcaseMedia.src}
                              alt="Estola negra con logos blancos"
                              // TRUCO MAESTRO DINÁMICO: scaleClass empuja las orillas blancas brillantes fuera de la máscara.
                              className={`w-full h-full object-contain invert grayscale brightness-[90%] contrast-[130%] ${scaleClass} origin-center`}
                            />
                            
                            {/* Cubrimos la mancha del cuello con negro puro desvanecido */}
                            <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none" />
                          </div>
                        </div>
                      );
                    }

                    const stolaSolidHex = activeStola?.hex || "transparent";

                    return (
                      <div 
                        className="absolute inset-0 mix-blend-multiply"
                        style={{ 
                          filter: `drop-shadow(1px 0 0 ${stolaSolidHex}) drop-shadow(-1px 0 0 ${stolaSolidHex}) drop-shadow(0 1px 0 ${stolaSolidHex}) drop-shadow(0 -1px 0 ${stolaSolidHex}) drop-shadow(0 0 1px ${stolaSolidHex})` 
                        }}
                      >
                        <div 
                          className="w-full h-full"
                          style={{
                            background: stolaBg,
                            ...maskStyles
                          }}
                        />
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* RIGHT — Control panel */}
          <div className="p-6 sm:p-10 space-y-10">
            {/* Ciudad — Only for Renta */}
            {service === "renta" && (
              <section>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                  Ciudad
                </p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((c) => {
                    const active = city === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onCity(c.id);
                          if (!pkg) {
                            onPkg({ kind: "A" });
                          }
                        }}
                        className={cn(
                          "px-5 py-2 rounded-full border text-sm transition-all cursor-pointer",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          active
                            ? "bg-navy text-navy-foreground border-navy"
                            : "border-hairline text-foreground hover:border-navy/40",
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Paquete — segmented / direct options for University and Venta Preescolar */}
            <section>
              {service === "venta" && level === "preescolar" && onProductCategory && (() => {
                const categories = [
                  { id: "togas", label: "Togas", icon: Shirt, desc: "Toga Completa" },
                  { id: "estolas", label: "Estolas", icon: Layers, desc: "E1, E2, E3" },
                  { id: "birretes", label: "Birretes", icon: GraduationCap, desc: "Decorado / Liso" },
                  { id: "borlas", label: "Borlas", icon: Sparkles, desc: "Dije / Clásica" },
                  { id: "recuerdos", label: "Recuerdos", icon: Gift, desc: "Oso / Medalla" },
                ] as const;

                return (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full mb-8">
                    {categories.map((cat) => {
                      const active = productCategory === cat.id;
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            if (!active) {
                              onProductCategory(cat.id);
                              if (cat.id === "togas") {
                                onPkg({ kind: "B", variant: "toga_completa" });
                                onTogaColor("negro");
                                onStolaColor("dorada");
                              } else if (cat.id === "birretes") {
                                onPkg({ kind: "B", variant: "birrete_decorado" });
                                onStolaColor("negro");
                              } else if (cat.id === "borlas") {
                                onPkg({ kind: "B", variant: "borla_dije" });
                                onStolaColor("negro");
                              } else if (cat.id === "recuerdos") {
                                onPkg({ kind: "B", variant: "medalla_standard" });
                                onStolaColor("dorada");
                                onTogaColor("negro");
                              } else {
                                onPkg({ kind: "B", variant: "esencial" });
                                onStolaColor("blanco");
                              }
                            }
                          }}
                          className={cn(
                            "relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-300 cursor-pointer group shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            active
                              ? "border-navy bg-cream/90 text-foreground font-semibold shadow-md scale-[1.03] -translate-y-0.5"
                              : "border-hairline bg-card/40 hover:bg-card hover:border-navy/30 text-muted-foreground hover:text-foreground",
                            cat.id === "recuerdos" ? "col-span-2 md:col-span-1" : "col-span-1"
                          )}
                        >
                          {/* Background Glow on Active */}
                          {active && (
                            <div className="absolute inset-0 rounded-2xl bg-navy/[0.01] blur-md pointer-events-none" />
                          )}

                          {/* Icon Wrapper */}
                          <div className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                            active 
                              ? "bg-navy text-navy-foreground" 
                              : "bg-muted group-hover:bg-muted/80 text-muted-foreground group-hover:text-foreground"
                          )}>
                            <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                          </div>

                          {/* Label */}
                          <span className={cn(
                            "text-xs sm:text-sm font-medium tracking-wide block transition-colors duration-300",
                            active ? "text-navy" : "text-foreground/80"
                          )}>
                            {cat.label}
                          </span>

                          {/* Subtext description */}
                          <span className="text-[10px] text-muted-foreground mt-0.5 block opacity-85 font-normal">
                            {cat.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                {(isUni || (service === "venta" && level === "preescolar")) ? (productCategory === "birretes" ? "Tipo de Birrete" : productCategory === "borlas" ? "Tipo de Borla" : (productCategory === "recuerdos" ? "Tipo de Recuerdo" : "Tipo de Estola")) : "Paquete"}
              </p>

              {(isUni || (service === "venta" && level === "preescolar")) ? (
                <div className="space-y-2.5">
                  {(isUni ? [
                    {
                      id: "uni_a",
                      code: "A",
                      title: "Opción A — Estola Lisa",
                      desc: "Estola lisa sin estampado ni bordado",
                      payload: { kind: "A" } as const,
                      isActive: pkg?.kind === "A"
                    },
                    {
                      id: "uni_b",
                      code: "B",
                      title: "Opción B — Impresión de Alta Calidad",
                      desc: "Estola personalizada con impresión digital de alta calidad",
                      payload: { kind: "B", variant: "uni_b" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "uni_b"
                    },
                    {
                      id: "uni_c",
                      code: "C",
                      title: "Opción C — Bordado de Alta Calidad",
                      desc: "Estola personalizada con bordado de alta resolución",
                      payload: { kind: "B", variant: "uni_c" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "uni_c"
                    }
                  ] : (productCategory === "togas" ? [
                    {
                      id: "toga_completa",
                      code: "T.1",
                      title: "Toga Completa",
                      desc: "Incluye Toga, Birrete y Estola",
                      price: PRICES.V_TOGA_BIRRETE_ESTOLA,
                      payload: { kind: "B", variant: "toga_completa" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "toga_completa"
                    },
                    {
                      id: "toga_borla",
                      code: "T.2",
                      title: "Toga y Birrete con Borla",
                      desc: "Toga y birrete con borla del año (sin estola)",
                      price: PRICES.V_TOGA_BIRRETE_BORLA,
                      payload: { kind: "B", variant: "toga_borla" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "toga_borla"
                    }
                  ] : productCategory === "birretes" ? [
                    {
                      id: "birrete_decorado",
                      code: "B.1",
                      title: "Birrete Decorado",
                      desc: "Birrete con decoración temática personalizada",
                      price: PRICES.V_B_DECORADO,
                      payload: { kind: "B", variant: "birrete_decorado" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "birrete_decorado"
                    },
                    {
                      id: "birrete_liso",
                      code: "B.2",
                      title: "Birrete Liso",
                      desc: "Birrete liso en color de tu elección",
                      price: PRICES.V_B_LISO,
                      payload: { kind: "B", variant: "birrete_liso" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "birrete_liso"
                    }
                  ] : productCategory === "borlas" ? [
                    {
                      id: "borla_dije",
                      code: "B.1",
                      title: "Borla con Dije",
                      desc: "Incluye dije conmemorativo de generación",
                      price: PRICES.V_B_BORLA_DIJE,
                      payload: { kind: "B", variant: "borla_dije" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "borla_dije"
                    },
                    {
                      id: "borla_clasica",
                      code: "B.2",
                      title: "Borla Clásica",
                      desc: "Diseño tradicional elegante",
                      price: PRICES.V_B_BORLA_CLASICA,
                      payload: { kind: "B", variant: "borla_clasica" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "borla_clasica"
                    }
                  ] : productCategory === "recuerdos" ? [
                    {
                      id: "medalla_standard",
                      code: "M.1",
                      title: "Medalla Estándar",
                      desc: "Medalla conmemorativa clásica de graduación",
                      price: PRICES.V_MEDALLA_STANDARD,
                      payload: { kind: "B", variant: "medalla_standard" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "medalla_standard"
                    },
                    {
                      id: "medalla_personalizada",
                      code: "M.2",
                      title: "Medalla Personalizada",
                      desc: "Medalla grabada con nombre y detalles personalizados",
                      price: PRICES.V_MEDALLA_PERSONALIZADA,
                      payload: { kind: "B", variant: "medalla_personalizada" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "medalla_personalizada"
                    },
                    {
                      id: "oso_graduacion",
                      code: "O.1",
                      title: "Oso de Graduación",
                      desc: "Oso de peluche con toga y birrete, color a elegir (Azul o Rosa)",
                      price: PRICES.V_OSO_GRADUACION,
                      payload: { kind: "B", variant: "oso_graduacion" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "oso_graduacion"
                    }
                  ] : [
                    {
                      id: "esencial",
                      code: "E.1",
                      title: "E.1 Clásica",
                      desc: "Diseño elegante y discreto (2 impresiones 9x12 cm)",
                      payload: { kind: "B", variant: "esencial" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "esencial"
                    },
                    {
                      id: "hybrid",
                      code: "E.2",
                      title: "E.2 Combinada",
                      desc: "Diseño híbrido y equilibrado (9x12 cm + 9x35 cm)",
                      payload: { kind: "B", variant: "hybrid" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "hybrid"
                    },
                    {
                      id: "max",
                      code: "E.3",
                      title: "E.3 Premium",
                      desc: "Cobertura completa y temática personalizada (2 de 9x35 cm)",
                      payload: { kind: "B", variant: "max" } as const,
                      isActive: pkg?.kind === "B" && pkg.variant === "max"
                    }
                  ])).map((opt) => {
                    const originalPrice = unitOriginalPrice(opt.payload, level, service);
                    const netPrice = unitPrice(opt.payload, level, service);
                    const discount = getDiscountPercent(opt.payload, level, service);
                    
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onPkg(opt.payload)}
                        className={cn(
                          "w-full flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors cursor-pointer",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          opt.isActive
                            ? "border-navy bg-cream"
                            : "border-hairline hover:border-navy/40",
                        )}
                      >
                        <div className="flex items-baseline gap-3 min-w-0">
                          <span className="text-[10px] tracking-[0.18em] text-navy font-semibold w-8 shrink-0">
                            {opt.code}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{opt.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{opt.desc}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 select-none">
                          <span className="font-sans font-semibold text-base tabular-nums text-foreground whitespace-nowrap">
                            {formatMXN(netPrice)}
                          </span>
                          {discount > 0 && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] line-through text-muted-foreground tabular-nums">
                                {formatMXN(originalPrice)}
                              </span>
                              <span className="text-[9px] font-bold text-white bg-[#C5A85A] px-1.5 py-0.5 rounded-md tracking-wider">
                                -{discount}%
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="relative inline-flex w-full rounded-full border border-hairline bg-muted/40 p-1">
                    {(level === "preparatoria" ? (["A", "B", "C"] as const) : (["A", "B"] as const)).map((k) => {
                      const active = pkg?.kind === k;
                      let label = "";
                      if (k === "A") label = "Paquete A — Básico";
                      else if (k === "B") label = "Paquete B — Personalizado";
                      else label = "Paquete C — Bordado";
                      
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            if (k === "C") {
                              const hasValidCVariant = pkg?.kind === "C" && pkg?.variant && (
                                pkg.variant === "prep_c1" || pkg.variant === "prep_c2"
                              );
                              const variant = hasValidCVariant ? pkg.variant : "prep_c1";
                              onPkg({ kind: "C", variant });
                            } else if (k === "B") {
                              let defaultVariant: PackageBVariant | undefined = undefined;
                              if (level === "preescolar") defaultVariant = "esencial";
                              else if (level === "primaria") defaultVariant = "pri_c";
                              else if (level === "secundaria") defaultVariant = "sec_b";
                              else if (level === "preparatoria") defaultVariant = "prep_b";

                              const hasValidBVariant = pkg?.kind === "B" && pkg?.variant && (
                                (level === "preescolar" && (pkg.variant === "esencial" || pkg.variant === "hybrid" || pkg.variant === "max")) ||
                                (level === "primaria" && (pkg.variant === "pri_c" || pkg.variant === "pri_b" || pkg.variant === "pri_a")) ||
                                (level === "secundaria" && (pkg.variant === "sec_b" || pkg.variant === "sec_a")) ||
                                (level === "preparatoria" && (pkg.variant === "prep_b" || pkg.variant === "prep_a"))
                              );

                              const variant = hasValidBVariant ? pkg.variant : defaultVariant;
                              onPkg({ kind: "B", variant });
                            } else {
                              onPkg({ kind: "A" });
                            }
                          }}
                          className="relative flex-1 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {active && (
                            <motion.span
                              layoutId="segmented-pill"
                              className="absolute inset-0 rounded-full bg-navy"
                              transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            />
                          )}
                          <span className={cn("relative", active ? "text-navy-foreground" : "text-foreground/70")}>
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Variants */}
                  <AnimatePresence initial={false} mode="wait">
                    {(isB || isC) && (
                      <motion.div
                        key={pkg?.kind === "C" ? "c-variants" : "b-variants"}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-2.5">
                          {visibleVariants.map((v) => {
                            const active = (pkg?.kind === "B" || pkg?.kind === "C") && pkg.variant === v.id;
                            const currentPayload = { kind: pkg?.kind || "B", variant: v.id } as const;
                            const originalPrice = unitOriginalPrice(currentPayload, level, service);
                            const netPrice = unitPrice(currentPayload, level, service);
                            const discount = getDiscountPercent(currentPayload, level, service);

                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => onPkg({ kind: pkg?.kind || "B", variant: v.id })}
                                className={cn(
                                  "w-full flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors cursor-pointer",
                                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  active
                                    ? "border-navy bg-cream"
                                    : "border-hairline hover:border-navy/40",
                                )}
                              >
                                <div className="flex items-baseline gap-3 min-w-0">
                                  <span className="text-[10px] tracking-[0.18em] text-navy font-semibold w-8 shrink-0">
                                    {v.code}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground">{v.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{v.desc}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0 select-none">
                                  <span className="font-sans font-semibold text-base tabular-nums text-foreground whitespace-nowrap">
                                    {formatMXN(netPrice)}
                                  </span>
                                  {discount > 0 && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] line-through text-muted-foreground tabular-nums">
                                        {formatMXN(originalPrice)}
                                      </span>
                                      <span className="text-[9px] font-bold text-white bg-[#C5A85A] px-1.5 py-0.5 rounded-md tracking-wider">
                                        -{discount}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Package price hint */}
                  {pkg?.kind === "A" && (() => {
                    const originalPrice = unitOriginalPrice(pkg, level, service);
                    const netPrice = unitPrice(pkg, level, service);
                    const discount = getDiscountPercent(pkg, level, service);
                    
                    return (
                      <div className="pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="w-full flex items-center justify-between gap-4 rounded-xl border border-navy bg-cream px-4 py-3.5 text-left">
                          <div className="flex items-baseline gap-3 min-w-0">
                            <span className="text-[10px] tracking-[0.18em] text-navy font-semibold w-8 shrink-0">
                              A
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">Básico</p>
                              <p className="text-xs text-muted-foreground truncate font-sans">Estola Lisa</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 select-none">
                            <span className="font-sans font-semibold text-base tabular-nums text-foreground whitespace-nowrap">
                              {formatMXN(netPrice)}
                            </span>
                            {discount > 0 && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] line-through text-muted-foreground tabular-nums">
                                  {formatMXN(originalPrice)}
                                </span>
                                <span className="text-[9px] font-bold text-white bg-[#C5A85A] px-1.5 py-0.5 rounded-md tracking-wider">
                                  -{discount}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </section>

            {/* Color de Toga */}
            {((service === "venta" && level === "preescolar" && productCategory === "togas") ||
              (service !== "venta" &&
              ((pkg?.kind === "A" && level === "preescolar") ||
              level === "primaria" ||
              level === "secundaria" ||
              level === "preparatoria" ||
              level === "universidad"))) && (
              <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                  Color de Toga
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {(service === "venta" ? VENTA_PREESCOLAR_TOGA_COLORS : TOGA_COLORS.filter((c) => level === "preescolar" || c.id === "negro")).map((c) => {
                    const active = togaColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onTogaColor(c.id)}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-medium transition-all cursor-pointer relative",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-navy bg-cream text-foreground"
                            : "border-hairline text-foreground/80 hover:border-navy/40",
                        )}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0 block"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Color de Estola */}
            {(() => {
              const visibleStolas = (() => {
                if (level === "preescolar" && service === "venta" && productCategory === "recuerdos") {
                  if (pkg?.variant === "oso_graduacion") {
                    return [
                      { id: "azul", label: "Color Azul", hex: "#1D4ED8" },
                      { id: "rosa", label: "Color Rosa", hex: "#FBCFE8" }
                    ];
                  }
                  return [];
                }
                return STOLA_COLORS.filter((s: any) => {
                  if (level === "preescolar") {
                    if (service === "venta") {
                      if (productCategory === "togas") {
                        if (pkg?.variant === "toga_borla") return false;
                        const ids = ["azul_pastel", "azul_turquesa", "azul_marino", "rosa_claro", "rosa_fiusha", "lila", "morado", "anaranjado", "verde_limon", "verde_esmeralda", "verde_bandera", "roja", "blanco", "amarillo"];
                        return ids.includes(s.id);
                      }
                      if (productCategory === "birretes") {
                        return ["negro", "azul", "roja", "rosa_claro", "azul_cielo"].includes(s.id);
                      }
                      if (productCategory === "borlas") {
                        // Negro, Azul Rey, Azul Bebé, Fucsia, Lila, Rojo, Guinda, Verde Esmeralda, Verde Limón, Dorado, Blanco
                        return ["negro", "azul", "azul_cielo", "rosa_fiusha", "lila", "roja", "guinda", "verde_esmeralda", "verde_limon", "dorada", "blanco"].includes(s.id);
                      }
                      const ids = ["azul_pastel", "azul_turquesa", "azul_marino", "rosa_claro", "rosa_fiusha", "lila", "morado", "anaranjado", "verde_limon", "verde_esmeralda", "verde_bandera", "roja", "blanco", "amarillo"];
                      return ids.includes(s.id);
                    }
                    if (pkg?.kind === "A") return s.isBasic;
                    return false;
                  }
                  if (pkg?.kind === "B" || pkg?.kind === "C") return true;
                  return s.id === "dorada";
                });
              })();

              if (visibleStolas.length === 0) return null;

              return (
                <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                    {productCategory === "birretes" ? "Color de Birrete" : productCategory === "borlas" ? "Color de Borla" : (productCategory === "recuerdos" ? "Color del Oso" : "Color de Estola")}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {visibleStolas.map((s) => {
                      const active = stolaColor === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onStolaColor(s.id)}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-xs sm:text-sm font-medium transition-all cursor-pointer relative",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "border-navy bg-cream text-foreground"
                              : "border-hairline text-foreground/80 hover:border-navy/40",
                          )}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0 block"
                            style={{ background: (s as any).gradient || s.hex }}
                          />
                          <span>{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })()}

            {/* Talla de Toga (Solo Venta Preescolar Togas) */}
            {service === "venta" && level === "preescolar" && productCategory === "togas" && onTogaSize && (
              <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Talla de Toga
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[10px] uppercase tracking-wider text-navy font-semibold flex items-center gap-1 hover:underline cursor-pointer focus:outline-none"
                  >
                    <Ruler className="h-3.5 w-3.5 text-navy" strokeWidth={1.5} /> Ver guía de medidas
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {["XS", "S", "M", "L", "XL"].map((sz) => {
                    const active = togaSize === sz;
                    const heightHelper: Record<string, string> = {
                      XS: "91-97 cm",
                      S: "99-105 cm",
                      M: "106-112 cm",
                      L: "114-119 cm",
                      XL: "122-127 cm",
                    };
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onTogaSize(sz)}
                        className={cn(
                          "flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer relative min-w-[75px]",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-navy bg-cream text-foreground font-semibold"
                            : "border-hairline text-foreground/80 hover:border-navy/40",
                        )}
                      >
                        <span>{sz}</span>
                        <span className="text-[9px] text-muted-foreground font-normal">{heightHelper[sz]}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Features */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                Incluye
              </p>
              <ul className="space-y-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 h-8 w-8 rounded-full border border-hairline flex items-center justify-center shrink-0">
                      <f.icon className="h-4 w-4 text-navy" strokeWidth={1.5} />
                    </span>
                    <span className="text-sm text-foreground/80 leading-relaxed pt-1">
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-hairline bg-background/95 backdrop-blur sticky bottom-0 z-30">
          <div className="px-6 sm:px-10 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Total estimado
              </p>
              <p className="font-sans font-semibold text-2xl sm:text-3xl text-foreground tabular-nums leading-tight">
                {formatMXN(total)}{" "}
                <span className="text-xs font-sans text-muted-foreground">MXN</span>
              </p>
            </div>

            <div className="flex items-center gap-3 sm:ml-auto">
              <button
                type="button"
                onClick={() => onQty(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-full border border-hairline hover:border-navy/50 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                aria-label="Disminuir"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  onQty(Number.isFinite(n) && n >= 1 ? n : 1);
                }}
                className="font-sans font-semibold text-xl w-14 text-center bg-transparent border-0 focus:outline-none focus:ring-0 tabular-nums"
                aria-label="Cantidad de alumnos"
              />
              <button
                type="button"
                onClick={() => onQty(quantity + 1)}
                className="h-10 w-10 rounded-full border border-hairline hover:border-navy/50 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                aria-label="Aumentar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy text-navy-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Guía de Medidas (Preescolar)</DialogTitle>
            <DialogDescription>
              Encuentra la talla ideal de la toga de tu pequeño según su estatura.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 border border-hairline rounded-xl overflow-hidden bg-card">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-hairline">
                  <th className="p-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Talla</th>
                  <th className="p-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Medida</th>
                  <th className="p-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Estatura (cm)</th>
                  <th className="p-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Estatura (Pies)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr className="hover:bg-muted/20">
                  <td className="p-3 font-bold">XS</td>
                  <td className="p-3">21"</td>
                  <td className="p-3 font-sans">91 - 97 cm</td>
                  <td className="p-3 font-sans">3'0" - 3'2"</td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="p-3 font-bold">S</td>
                  <td className="p-3">24"</td>
                  <td className="p-3 font-sans">99 - 105 cm</td>
                  <td className="p-3 font-sans">3'3" - 3'5"</td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="p-3 font-bold">M</td>
                  <td className="p-3">27"</td>
                  <td className="p-3 font-sans">106 - 112 cm</td>
                  <td className="p-3 font-sans">3'6" - 3'8"</td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="p-3 font-bold">L</td>
                  <td className="p-3">30"</td>
                  <td className="p-3 font-sans">114 - 119 cm</td>
                  <td className="p-3 font-sans">3'9" - 3'11"</td>
                </tr>
                <tr className="hover:bg-muted/20">
                  <td className="p-3 font-bold">XL</td>
                  <td className="p-3">33"</td>
                  <td className="p-3 font-sans">122 - 127 cm</td>
                  <td className="p-3 font-sans">4'0" - 4'2"</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
            * Se recomienda medir desde el hombro hasta los tobillos para asegurar el largo de la toga.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
