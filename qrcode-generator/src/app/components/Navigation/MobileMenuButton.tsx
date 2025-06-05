import React from "react";
import { motion } from "framer-motion";
import { MobileMenuButtonProps } from "@/types/navigation";

export default function MobileMenuButton({
  isMenuOpen,
  toggleMenu,
}: Readonly<MobileMenuButtonProps>) {
  return (
    <motion.button
      className="lg:hidden relative size-14 flex items-center justify-center rounded-lg focus:outline-none bg-transparent"
      onClick={toggleMenu}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{ backgroundColor: "transparent", boxShadow: "none" }}
    >
      <span
        className="absolute inset-0 rounded-lg bg-transparent"
        style={{ backgroundColor: "transparent", opacity: 0 }}
      />

      <div className="relative w-8 h-5 flex flex-col justify-between items-center">
        <motion.span
          className="w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
          animate={{
            opacity: isMenuOpen ? 0 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className="w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
          animate={{
            opacity: isMenuOpen ? 0 : 1,
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
        <motion.span
          className="w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
          animate={{
            opacity: isMenuOpen ? 0 : 1,
          }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
      </div>
    </motion.button>
  );
}
