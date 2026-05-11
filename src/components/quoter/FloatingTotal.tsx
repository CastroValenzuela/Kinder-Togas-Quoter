import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { formatMXN } from "@/lib/pricing";

type Props = {
  total: number;
  canContinue: boolean;
  onContinue: () => void;
};

export function FloatingTotal({ total, canContinue, onContinue }: Props) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-40 pointer-events-none"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-4">
        <div className="pointer-events-auto flex items-center justify-between gap-4 rounded-full border border-hairline bg-background/95 backdrop-blur px-5 sm:px-7 py-3 shadow-[0_10px_30px_-15px_rgba(20,25,60,0.25)]">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Total estimado
            </p>
            <p className="font-display text-lg sm:text-xl text-foreground tabular-nums truncate">
              {formatMXN(total)} <span className="text-xs text-muted-foreground font-sans">MXN</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="inline-flex items-center gap-2 rounded-full bg-navy text-navy-foreground px-5 sm:px-6 py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Continuar <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
