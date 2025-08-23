import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { HeroSectionProps } from "@/types/landing";

export default function HeroSection({
  isAuthenticated,
  containerVariants,
  itemVariants,
}: Readonly<HeroSectionProps>) {
  return (
    <motion.div
      className="relative z-10 max-w-6xl w-full mx-auto py-12 md:py-20 lg:py-28"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Content Column */}
        <motion.div
          className="order-2 lg:order-1 space-y-8"
          variants={itemVariants}
        >
          <motion.div
            className="h-1 w-20 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 1, duration: 0.6 }}
          />

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight gradient-text"
            variants={itemVariants}
          >
            PERSiBER Event Management
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed"
            variants={itemVariants}
          >
            Welcome to the PERSiBER Event Management System. A premium solution
            for organizing and managing your events with elegance.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 pt-4"
            variants={itemVariants}
          >
            {/* Modified Link to conditionally redirect based on auth state */}
            <Link
              href={
                isAuthenticated ? "/guests" : "/auth/login?redirect=/guests"
              }
            >
              <motion.div
                className="px-8 py-4 bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy dark:text-deep-navy rounded-md font-medium text-lg inline-flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(212, 175, 55, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Image Column with enhanced styling */}
        <motion.div
          className="order-1 lg:order-2 flex justify-center items-center"
          variants={itemVariants}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="p-5">
              <Image
                src="https://i.imgur.com/MiwxKii.png"
                alt="PERSiBER Logo"
                width={300}
                height={300}
                className="object-contain w-44 h-44 md:w-64 md:h-64"
                sizes="(max-width: 768px) 176px, 256px"
                priority
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
