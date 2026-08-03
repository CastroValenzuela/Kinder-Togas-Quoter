import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Zap } from "lucide-react";

// Mocking imports for images since we only have some available in the reverted state
import imgToga from "@/assets/Renta/Preescolar/premium.jpg";
import imgBirrete from "@/assets/Venta/Preescolar/Birretes/decorado-azul.jpg";
import imgBorla from "@/assets/Venta/Preescolar/Borlas/clasica-dorado.jpg";
import imgEstola from "@/assets/Venta/Preescolar/Estolas/E1.jpg";
import imgRecuerdo from "@/assets/Venta/Preescolar/Recuerdos/Osos/oso_azul.jpeg";

export type SalesCategory = "togas" | "estolas" | "birretes" | "borlas" | "recuerdos";

type Props = {
  onSelect?: (category: SalesCategory) => void;
};

interface CategoryItem {
  id: string;
  title: string;
  description: string;
  img: string;
  category: SalesCategory;
  tag?: string;
  icon?: any;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "togas",
    title: "Paquetes de Togas",
    description: "Togas nuevas y personalizadas, listas para conservar como recuerdo.",
    img: imgToga,
    category: "togas" as SalesCategory,
    tag: "Popular",
  },
  {
    id: "estolas",
    title: "Estolas",
    description: "Estolas personalizadas sublimadas o bordadas con tu logo escolar.",
    img: imgEstola,
    category: "estolas" as SalesCategory,
  },
  {
    id: "birretes",
    title: "Birretes",
    description: "Birretes decorados a mano y lisos, listos para brillar.",
    img: imgBirrete,
    category: "birretes" as SalesCategory,
  },
  {
    id: "borlas",
    title: "Borlas",
    description: "Borlas de todos los colores y dijes metálicos con el año.",
    img: imgBorla,
    category: "borlas" as SalesCategory,
  },
  {
    id: "recuerdos",
    title: "Recuerdos",
    description: "Osos de graduación de peluche y medallas de excelencia.",
    img: imgRecuerdo,
    category: "recuerdos" as SalesCategory,
  },
];

export function SalesCatalog({ onSelect = () => {} }: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden">
      <header className="mb-4 text-center max-w-2xl mx-auto px-4 mt-2">
        <div className="inline-flex items-center justify-center p-2 bg-navy/5 text-navy rounded-xl mb-2">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-foreground tracking-tight">
          Catálogo de Productos
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Selecciona una categoría para ver los detalles.
        </p>
      </header>

      {/* 5 columns on large screens to fit everything on one page without scrolling, smaller images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 max-w-[1400px] mx-auto px-4 w-full mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.category)}
            className="group relative flex flex-col text-left cursor-pointer bg-card rounded-2xl border border-hairline overflow-hidden shadow-sm hover:shadow-xl hover:shadow-navy/5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:-translate-y-1"
          >
            {/* Image container is now shorter with aspect-video to keep images small */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
              {cat.tag && (
                <div className="absolute top-3 left-3 z-20">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-navy text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                    {cat.tag}
                  </span>
                </div>
              )}

              {cat.img ? (
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                  {cat.icon && <cat.icon className="w-12 h-12 text-slate-300" strokeWidth={1} />}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1225]/60 via-transparent to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-60" />
            </div>

            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-white relative z-10">
              <div>
                <h3 className="font-display text-base font-bold text-foreground mb-1 group-hover:text-[#C5A85A] transition-colors duration-300">
                  {cat.title}
                </h3>
                <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>
              <div className="mt-3 flex items-center text-navy font-bold text-[9px] uppercase tracking-[0.1em]">
                <span>Ver opciones</span>
                <ArrowRight className="ml-1.5 h-3 w-3 transform transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Trust Badges Section */}
      <div className="max-w-4xl mx-auto px-4 w-full mt-auto mb-4">
        <div className="border-t border-slate-200/60 pt-4 pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 text-slate-600">
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider text-slate-800">
                  Envíos a todo México
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2.5 text-slate-600">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider text-slate-800">
                  Calidad Garantizada
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2.5 text-slate-600">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider text-slate-800">
                  Cotización Rápida
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
