import cn from "classnames";
import { motion } from "framer-motion";

interface SpinnerProps {
  readonly sm?: boolean;
  readonly md?: boolean;
  readonly lg?: boolean;
  readonly xl?: boolean;
}

export default function Spinner({ sm, md, lg, xl }: SpinnerProps) {
  // Default to md if no size is specified
  const size = { sm, md: !sm && !lg && !xl, lg, xl };

  const sizeClass = cn({
    "w-4 h-4": size.sm,
    "w-6 h-6": size.md,
    "w-8 h-8": size.lg,
    "w-12 h-12": size.xl,
  });

  return (
    <output
      aria-busy="true"
      className="inline-flex justify-center items-center"
    >
      <div className={cn("relative", sizeClass)}>
        {/* Background ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700",
            sizeClass
          )}
        ></div>

        {/* Primary spinning ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-t-transparent border-rich-gold dark:border-rich-gold",
            sizeClass
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        ></motion.div>

        {/* Inner pulse effect */}
        <motion.div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            sizeClass
          )}
          animate={{ scale: [0.8, 1, 0.8], opacity: [0.6, 0.8, 0.6] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="w-1/3 h-1/3 rounded-full bg-rich-gold/80 dark:bg-rich-gold/80 blur-[1px]"></div>
        </motion.div>
      </div>
      <span className="sr-only">Loading...</span>
    </output>
  );
}