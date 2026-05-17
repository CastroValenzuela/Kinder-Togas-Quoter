import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function SelectableCard({ selected, disabled, onClick, children, className, ariaLabel }: Props) {
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
        "group relative w-full text-left rounded-lg border bg-card px-6 py-6 transition-colors cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled && "opacity-40 cursor-not-allowed",
        !disabled && !selected && "border-hairline hover:border-navy",
        selected && "border-navy bg-cream",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
