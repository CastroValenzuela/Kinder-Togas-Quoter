import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { formatMXN, type QuoteItem } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  items: QuoteItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onAddMore: () => void;
  onProceed: () => void;
};

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onAddMore,
  onProceed,
}: Props) {
  const grandTotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
  const totalUnits = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden border-l border-slate-200"
            role="dialog"
            aria-modal="true"
            aria-label="Tu Cotización"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-hairline flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#1E2346]/5 flex items-center justify-center text-[#1E2346]">
                  <ShoppingBag className="h-5 w-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1E2346] leading-tight">
                    Tu Cotización
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {items.length === 0
                      ? "Sin artículos"
                      : `${items.length} ${items.length === 1 ? "artículo" : "artículos"} · ${totalUnits} ${totalUnits === 1 ? "pieza" : "piezas"}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full border border-hairline hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
                aria-label="Cerrar cotización"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <h4 className="font-serif text-base font-semibold text-slate-800 mb-1">
                    Tu cotización está vacía
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs mb-6">
                    Personaliza cualquier paquete o artículo y presiona "Agregar a mi cotización" para verlo aquí.
                  </p>
                  <button
                    type="button"
                    onClick={onAddMore}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E2346] text-white text-xs font-semibold hover:bg-[#1E2346]/90 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Configurar un producto</span>
                  </button>
                </div>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="relative rounded-2xl border border-slate-200/80 p-4 bg-[#FDFBF7]/50 hover:bg-[#FDFBF7] transition-all group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-[0.16em] text-[#C5A85A] block mb-0.5">
                          {it.level ? `${it.level} · ` : ""}{it.service || "Producto"}
                        </span>
                        <h4 className="font-semibold text-sm text-[#1E2346] leading-tight">
                          {it.label}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(it.id)}
                        className="text-slate-400 hover:text-red-600 transition p-1 rounded-md cursor-pointer shrink-0"
                        title="Eliminar este artículo"
                        aria-label={`Eliminar ${it.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {it.details && (
                      <p className="text-xs text-slate-600 mb-3 leading-snug">
                        {it.details}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
                      {/* Stepper de cantidad */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (it.quantity <= 1) {
                              onRemoveItem(it.id);
                            } else {
                              onUpdateQuantity(it.id, it.quantity - 1);
                            }
                          }}
                          className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center transition cursor-pointer",
                            it.quantity <= 1
                              ? "hover:bg-red-50 text-slate-400 hover:text-red-600"
                              : "hover:bg-slate-100 text-slate-600"
                          )}
                          aria-label={it.quantity <= 1 ? "Eliminar artículo" : "Disminuir cantidad"}
                          title={it.quantity <= 1 ? "Eliminar de la cotización" : "Disminuir cantidad"}
                        >
                          {it.quantity <= 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        </button>
                        <span className="font-sans font-bold text-xs w-7 text-center tabular-nums text-slate-800">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(it.id, it.quantity + 1)}
                          className="h-6 w-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-sans font-bold text-sm text-[#1E2346] tabular-nums block">
                          {formatMXN(it.totalPrice)} MXN
                        </span>
                        <span className="text-[10px] text-muted-foreground block -mt-0.5">
                          {formatMXN(it.unitPrice)} c/u
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 sm:p-6 border-t border-hairline bg-white shrink-0 space-y-3.5 shadow-[0_-10px_25px_-15px_rgba(0,0,0,0.06)]">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground block">
                      Total Estimado
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Precios con IVA incluido
                    </span>
                  </div>
                  <span className="font-sans font-bold text-2xl text-[#1E2346] tabular-nums">
                    {formatMXN(grandTotal)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">MXN</span>
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {/* Botón Principal Continuar */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onProceed();
                    }}
                    className="w-full py-3.5 px-6 rounded-full bg-[#1E2346] text-white font-semibold text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>Continuar a Datos del Evento</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {/* Botón Secundario Agregar más */}
                  <button
                    type="button"
                    onClick={onAddMore}
                    className="w-full py-2.5 px-6 rounded-full border border-[#1E2346]/20 text-[#1E2346] font-semibold text-xs hover:bg-[#1E2346]/5 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Agregar otro producto a la cotización</span>
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
