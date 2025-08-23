import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { NavLogoProps } from "@/types/navigation";

export default function NavLogo({ onLogoClick }: Readonly<NavLogoProps>) {
  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 20,
        delay: 0.2,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const glowVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 0.6, 0],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop" as const,
      },
    },
  };

  return (
    <motion.button
      className="group flex items-center focus:outline-none"
      onClick={onLogoClick}
      variants={logoVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-lg"
          variants={glowVariants}
        />
        <Image
          src="https://i.imgur.com/MiwxKii.png"
          alt="PERSiBER Logo"
          width={40}
          height={40}
          priority
          className="object-contain z-10"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
    </motion.button>
  );
}
