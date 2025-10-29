import React from "react";
import { motion } from "framer-motion";
import { ToggleSwitchProps } from "@/types/common";

export default function ToggleSwitch({
  isActive,
  onToggle,
  label,
  title,
  size = "md",
  disabled = false,
  ariaLabel,
  layout = "inline",
  colorScheme = "default",
  variants,
}: Readonly<ToggleSwitchProps>) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "w-10 h-5",
          toggle: "w-3 h-3",
          translateX: isActive ? 20 : 0,
        };
      case "lg":
        return {
          container: "w-16 h-8",
          toggle: "w-6 h-6",
          translateX: isActive ? 32 : 0,
        };
      default: // md
        return {
          container: "w-12 h-6",
          toggle: "w-4 h-4",
          translateX: isActive ? 24 : 0,
        };
    }
  };

  const getColorClasses = () => {
    if (colorScheme === "emerald") {
      return isActive
        ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
        : "bg-gray-600";
    }

    return isActive
      ? "bg-gradient-to-r from-rich-gold to-accent-amber"
      : "bg-gray-600";
  };

  // Special case for attendance toggle (w-14 h-7 with w-5 h-5 toggle)
  const getAttendanceClasses = () => {
    return {
      container: "w-14 h-7",
      toggle: "w-5 h-5",
      translateX: isActive ? 26 : 0,
    };
  };

  const sizeClasses = title && layout === "between" ? getAttendanceClasses() : getSizeClasses();
  const colorClasses = getColorClasses();

  const toggleButton = (
    <motion.button
      onClick={onToggle}
      disabled={disabled}
      className={`relative ${
        sizeClasses.container
      } flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${colorClasses} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      aria-label={ariaLabel}
      variants={variants}
    >
      <motion.span
        className={`absolute bg-white ${sizeClasses.toggle} rounded-full shadow-md transform transition-transform duration-300`}
        animate={{
          translateX: sizeClasses.translateX,
        }}
      />
    </motion.button>
  );

  // Title with toggle (between layout) - like GuestAttendanceToggle
  if (title && layout === "between") {
    return (
      <div className="flex items-center justify-between">
        <motion.h2
          className="text-xl font-bold text-white"
          variants={variants}
        >
          {title}
        </motion.h2>
        {toggleButton}
      </div>
    );
  }

  // Label with toggle (stacked layout)
  if (label && layout === "stacked") {
    return (
      <div className="flex flex-col items-center space-y-2">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        {toggleButton}
      </div>
    );
  }

  // Inline layout (default)
  return toggleButton;
}
