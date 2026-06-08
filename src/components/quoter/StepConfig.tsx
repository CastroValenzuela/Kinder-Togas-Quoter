import { useMemo } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Minus, Plus, ArrowRight, Camera, Shirt, Sparkles, Layers, Truck, GraduationCap, Users, Gem } from "lucide-react";
const assets = import.meta.glob('@/assets/**/*.{jpg,png}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

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
  esencial: { src: getAsset('Venta/Preescolar/E1.jpg'), mask: getAsset('Venta/Preescolar/E1-mask.png') },
  hybrid: { src: getAsset('Venta/Preescolar/E2.jpg'), mask: getAsset('Venta/Preescolar/E2-mask.png') },
  max: { src: getAsset('Venta/Preescolar/E3.jpg'), mask: getAsset('Venta/Preescolar/E3-mask.png') },
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
  pkg?: PackageChoice;
  quantity: number;
  togaColor: string;
  stolaColor: string;
  onCity: (c: City) => void;
  onPkg: (p: PackageChoice) => void;
  onQty: (n: number) => void;
  onTogaColor: (color: string) => void;
  onStolaColor: (color: string) => void;
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

export function StepConfig({
  level, service, city, pkg, quantity, togaColor, stolaColor, onCity, onPkg, onQty, onTogaColor, onStolaColor, canContinue, onContinue,
}: Props) {
  const isB = pkg?.kind === "B";
  const isC = pkg?.kind === "C";
  const isSecundaria = level === "secundaria";
  const isPrimaria = level === "primaria";
  const isPreparatoria = level === "preparatoria";
  const isUni = level === "universidad";

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
    if (pkg?.kind === "B" && pkg.variant) {
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

  const total = unitPrice(pkg, level) * quantity;

  // Get dynamic image showcase based on level and selected configuration
  const showcaseMedia = useMemo(() => {
    let result: string | { src: string; mask?: string; stolaNegro?: string } = getAsset('gown-showcase.jpg');
    
    if (level === "preescolar") {
      if (pkg?.kind === "A") {
        const colorVariants = PREESCOLAR_PAQUETE_A[togaColor] || PREESCOLAR_PAQUETE_A.negro;
        result = colorVariants[stolaColor] || colorVariants.default;
      } else if (pkg?.kind === "B" && pkg?.variant) {
        if (service === "venta") {
          result = VENTA_PREESCOLAR_PAQUETE_B[pkg.variant] || getAsset('Venta/Preescolar/E2.jpg');
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

                  {showcaseMedia.mask && stolaColor !== "blanco" && (() => {
                     const activeStola = STOLA_COLORS.find((c) => c.id === stolaColor);
                     const stolaBg = (activeStola as any)?.gradient || activeStola?.hex || "transparent";
                     const isBlackStola = stolaColor === "negro";

                     const maskStyles = {
                       WebkitMaskImage: `url(${showcaseMedia.mask})`,
                       WebkitMaskSize: "contain",
                       WebkitMaskPosition: "center",
                       WebkitMaskRepeat: "no-repeat",
                       maskImage: `url(${showcaseMedia.mask})`,
                       maskSize: "contain",
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
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                {(isUni || (service === "venta" && level === "preescolar")) ? "Opción de Estola" : "Paquete"}
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
                  ]).map((opt) => {
                    const originalPrice = unitOriginalPrice(opt.payload, level);
                    const netPrice = unitPrice(opt.payload, level);
                    const discount = getDiscountPercent(opt.payload, level);
                    
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
                            const originalPrice = unitOriginalPrice(currentPayload, level);
                            const netPrice = unitPrice(currentPayload, level);
                            const discount = getDiscountPercent(currentPayload, level);

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
                    const originalPrice = unitOriginalPrice(pkg, level);
                    const netPrice = unitPrice(pkg, level);
                    const discount = getDiscountPercent(pkg, level);
                    
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
            {service !== "venta" &&
              ((pkg?.kind === "A" && level === "preescolar") ||
              level === "primaria" ||
              level === "secundaria" ||
              level === "preparatoria" ||
              level === "universidad") && (
              <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                  Color de Toga
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {TOGA_COLORS.filter((c) => level === "preescolar" || c.id === "negro").map((c) => {
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
              const visibleStolas = STOLA_COLORS.filter((s: any) => {
                if (level === "preescolar") {
                  if (service === "venta") {
                    const ids = ["azul_pastel", "azul_turquesa", "azul_marino", "rosa_claro", "rosa_fiusha", "lila", "morado", "anaranjado", "verde_limon", "verde_esmeralda", "verde_bandera", "rojo", "blanco", "amarillo"];
                    return ids.includes(s.id);
                  }
                  if (pkg?.kind === "A") return s.isBasic;
                  return false;
                }
                if (pkg?.kind === "B" || pkg?.kind === "C") return true;
                return s.id === "dorada";
              });

              if (visibleStolas.length === 0) return null;

              return (
                <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                    Color de Estola
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
    </div>
  );
}
