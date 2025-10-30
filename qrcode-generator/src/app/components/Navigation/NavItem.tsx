import { NavItemProps } from "@/types/navigation";
import { motion } from "framer-motion";

// Desktop Navigation Item
export function DesktopNavItem({
  variants,
  icon,
  label,
  onClick,
  isActive,
}: Readonly<NavItemProps>) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative px-3 py-2 rounded-lg overflow-hidden group ${
        isActive ? "text-white" : "text-black hover:text-white"
      }`}
      variants={variants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.span
          className="absolute inset-0 rounded-lg opacity-20 bg-amber-800"
          layoutId="navActiveBackground"
          transition={{ type: "spring", duration: 0.4 }}
        />
      )}

      {/* Hover indicator */}
      <span
        className={`absolute inset-0 rounded-lg ${
          isActive ? "bg-amber-500/10" : "bg-zinc-700/0 group-hover:bg-zinc-700/30"
        } transition-all duration-300`}
      />

      {/* Content */}
      <span className="relative flex items-center">
        <span className="mr-1.5">{icon}</span>
        <span className="text-sm font-medium tracking-wide">{label}</span>
      </span>
    </motion.button>
  );
}

// Mobile Navigation Item
export function MobileNavItem({
  icon,
  label,
  onClick,
  isActive,
  variants,
}: Readonly<NavItemProps>) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-linear-to-r from-amber-500/10 to-amber-600/10 text-white border border-amber-500/20"
          : "bg-zinc-800/30 hover:bg-zinc-800/50 text-gray-200 border border-transparent"
      }`}
      variants={variants}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <span
        className={`flex items-center justify-center size-9 rounded-lg mr-3 ${
          isActive
            ? "bg-linear-to-r from-amber-500/20 to-amber-600/20 text-white"
            : "bg-zinc-700/50 text-gray-300"
        }`}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>

      {isActive && (
        <svg
          className="size-5 ml-auto text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
        </svg>
      )}
    </motion.button>
  );
}
