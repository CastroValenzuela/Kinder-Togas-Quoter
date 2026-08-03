import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SalesCatalog, type SalesCategory } from "../components/quoter/SalesCatalog";
import { ProductDetail } from "../components/quoter/ProductDetail";
import { StepperBar, StepperLabel } from "../components/quoter/Stepper";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mockup-ventas2")({
  component: MockupVentas2,
});

function MockupVentas2() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<SalesCategory | null>(null);

  const isDetailView = selectedCategory !== null;

  return (
    <div className="h-screen bg-[#F8FAFC] relative flex flex-col overflow-hidden">
      {/* Navbar mockup */}
      <header className="shrink-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isDetailView) {
                  setSelectedCategory(null);
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="gap-2 text-muted-foreground hover:text-foreground h-10 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Regresar</span>
            </Button>

            <div className="font-display text-xl tracking-tight text-foreground hidden sm:block border-l border-border pl-4 transition-all">
              Kinder Togas
              <span className="text-muted-foreground/40 font-sans text-sm ml-2">
                {isDetailView ? "Paso 2: Configura tu producto" : "Paso 1: Elige tu categoría"}
              </span>
            </div>
          </div>

          <div className="text-[11px] uppercase tracking-widest text-navy/50 font-bold bg-navy/5 px-3 py-1.5 rounded-full">
            Modo Preview
          </div>
        </div>
        <StepperBar step={isDetailView ? 3 : 2} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <StepperLabel step={isDetailView ? 3 : 2} />
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        {!isDetailView ? (
          <SalesCatalog onSelect={(cat) => setSelectedCategory(cat)} />
        ) : (
          <ProductDetail
            variant="accordion"
            category={selectedCategory}
            onBack={() => setSelectedCategory(null)}
          />
        )}
      </main>

      {/* Floating Support Button */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          alert("Aquí se abriría el WhatsApp de atención al cliente.");
        }}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg shadow-[#25D366]/30 hover:scale-105 hover:shadow-xl transition-all duration-300 group flex items-center gap-3"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-sm tracking-wide">
          ¿Dudas? Habla con un asesor
        </span>
      </a>
    </div>
  );
}
