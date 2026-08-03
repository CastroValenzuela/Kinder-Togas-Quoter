import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { SalesCategory } from "./SalesCatalog";
import { StepConfig } from "./StepConfig";
import { StepConfigTabs } from "./StepConfigTabs";
import { StepConfigAccordion } from "./StepConfigAccordion";
import { StepConfigHidden } from "./StepConfigHidden";
import { type PackageChoice, type Level, LEVELS, loadDynamicPrices } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface ProductDetailProps {
  category: SalesCategory;
  onBack: () => void;
  variant?: "default" | "tabs" | "accordion" | "hidden";
}

export function ProductDetail({ category, onBack, variant = "default" }: ProductDetailProps) {
  // State for StepConfig
  const [level, setLevel] = useState<Level>("preescolar");
  const [pkg, setPkg] = useState<PackageChoice>({ kind: "B", variant: "esencial" });
  const [togaColor, setTogaColor] = useState<string>("negro");
  const [stolaColor, setStolaColor] = useState<string>("blanco");
  const [quantity, setQuantity] = useState<number>(1);
  const [, setPricesLoaded] = useState(false);

  // Load dynamic pricing rules on mount
  useEffect(() => {
    loadDynamicPrices().then(() => {
      setPricesLoaded(true);
    });
  }, []);

  // Initialize correct package based on category
  useEffect(() => {
    if (category === "birretes") {
      setPkg({ kind: "B", variant: "birrete_decorado" });
      setStolaColor("negro"); // Used as birrete color in StepConfig for ventas
    } else if (category === "borlas") {
      setPkg({ kind: "B", variant: "borla_dije" });
      setStolaColor("dorada");
    } else {
      setPkg({ kind: "B", variant: "esencial" });
      setStolaColor("blanco");
    }
  }, [category]);

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 bg-[#F8FAFC] flex-1 flex flex-col min-h-0 pb-4 sm:pb-8">
      {/* Controles extra para el Mockup (Regresar y Nivel Escolar) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 shrink-0 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-navy transition-colors font-medium text-sm bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Regresar al Catálogo
        </button>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm overflow-x-auto max-w-full custom-scrollbar">
          <span className="text-[10px] font-bold text-navy uppercase tracking-widest pl-3 pr-1">
            Nivel:
          </span>
          {LEVELS.map((lvl) => {
            const isEnabled = lvl.id === "preescolar";
            return (
              <button
                key={lvl.id}
                disabled={!isEnabled}
                onClick={() => {
                  if (!isEnabled) return;
                  setLevel(lvl.id);
                  // Reset package when level changes to avoid invalid states
                  if (lvl.id !== "preescolar" && category !== "togas") {
                    // If accessories are only mapped for preescolar in StepConfig currently,
                    // we might need to handle it. For now, just change the level.
                  }
                }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap",
                  level === lvl.id
                    ? "bg-navy text-white shadow-sm"
                    : isEnabled
                      ? "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      : "opacity-40 cursor-not-allowed text-slate-400 bg-transparent",
                )}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render the EXACT same component used in Step 3 of Quoter */}
      <div className="bg-[#F8FAFC] flex-1 flex flex-col min-h-0">
        {variant === "tabs" && (
          <StepConfigTabs
            level={level}
            service="venta"
            productCategory={category as any}
            pkg={pkg}
            togaColor={togaColor}
            stolaColor={stolaColor}
            quantity={quantity}
            onPkg={setPkg}
            onTogaColor={setTogaColor}
            onStolaColor={setStolaColor}
            onQty={setQuantity}
            onProductCategory={() => {}}
            onCity={() => {}}
            canContinue={true}
            onContinue={() =>
              alert(
                `Añadido a cotización:\nCategoría: ${category}\nNivel: ${level}\nTotal: Calculado en vivo.`,
              )
            }
          />
        )}
        {variant === "accordion" && (
          <StepConfigAccordion
            level={level}
            service="venta"
            productCategory={category as any}
            pkg={pkg}
            togaColor={togaColor}
            stolaColor={stolaColor}
            quantity={quantity}
            onPkg={setPkg}
            onTogaColor={setTogaColor}
            onStolaColor={setStolaColor}
            onQty={setQuantity}
            onProductCategory={() => {}}
            onCity={() => {}}
            canContinue={true}
            onContinue={() =>
              alert(
                `Añadido a cotización:\nCategoría: ${category}\nNivel: ${level}\nTotal: Calculado en vivo.`,
              )
            }
          />
        )}
        {variant === "hidden" && (
          <StepConfigHidden
            level={level}
            service="venta"
            productCategory={category as any}
            pkg={pkg}
            togaColor={togaColor}
            stolaColor={stolaColor}
            quantity={quantity}
            onPkg={setPkg}
            onTogaColor={setTogaColor}
            onStolaColor={setStolaColor}
            onQty={setQuantity}
            onProductCategory={() => {}}
            onCity={() => {}}
            canContinue={true}
            onContinue={() =>
              alert(
                `Añadido a cotización:\nCategoría: ${category}\nNivel: ${level}\nTotal: Calculado en vivo.`,
              )
            }
          />
        )}
        {variant === "default" && (
          <StepConfig
            level={level}
            service="venta"
            productCategory={category as any}
            pkg={pkg}
            togaColor={togaColor}
            stolaColor={stolaColor}
            quantity={quantity}
            onPkg={setPkg}
            onTogaColor={setTogaColor}
            onStolaColor={setStolaColor}
            onQty={setQuantity}
            onProductCategory={() => {}}
            onCity={() => {}}
            canContinue={true}
            onContinue={() =>
              alert(
                `Añadido a cotización:\nCategoría: ${category}\nNivel: ${level}\nTotal: Calculado en vivo.`,
              )
            }
          />
        )}
      </div>
    </div>
  );
}
