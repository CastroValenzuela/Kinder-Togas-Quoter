import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function SelectableCard({
  selected,
  disabled,
  onClick,
  children,
  className,
  ariaLabel,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-pressed={selected}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "group relative w-full text-left rounded-xl border px-6 py-6 transition-all duration-200 cursor-pointer shadow-xs select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A85A]/50",
        disabled && "opacity-40 cursor-not-allowed bg-slate-50 border-slate-200",
        !disabled && !selected && "border-[#E2E8F0] bg-white hover:border-[#C5A85A]/60 hover:bg-[#FDFBF7]/40 text-[#1E2346]",
        selected && "border-[#C5A85A] bg-[#FDFBF7] text-[#1E2346] shadow-[0_2px_10px_rgba(197,168,90,0.12)]",
        className,
      )}
    >
      {selected && (
        <div className="absolute top-3.5 right-3.5 h-5 w-5 rounded-full bg-[#1E2346] text-white flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-200">
          <Check className="h-3 w-3 stroke-[3]" />
        </div>
      )}
      {children}
    </motion.button>
  );
}
