import React from "react";
import { motion } from "framer-motion";
import { QRScannerInstructionsProps } from "@/types/qr";

export default function QRScannerInstructions({
  variants,
  containerVariants,
  itemVariants,
}: Readonly<QRScannerInstructionsProps>) {
  const instructions = [
    {
      step: "1",
      title: "Allow Camera Access",
      description: "When prompted, allow access to your device's camera",
      icon: (
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-rich-gold"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      step: "2",
      title: "Center the QR Code",
      description: "Position the QR code within the scanner frame",
      icon: (
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-rich-gold"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      step: "3",
      title: "Access Guest Data",
      description: "Upon successful scan, you'll be directed to the guest page",
      icon: (
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-rich-gold"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  return (
    <motion.section
      className="mb-8 md:mb-12"
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.7 }}
    >
      <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
        <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-center text-warm-charcoal dark:text-white">
          How to Use the Scanner
        </h3>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {instructions.map((instruction) => (
            <motion.div
              key={instruction.step}
              variants={itemVariants}
              className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700/30"
            >
              <div className="bg-rich-gold/20 p-2 md:p-3 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
                {instruction.icon}
              </div>
              <h4 className="font-medium mb-1 text-center text-warm-charcoal dark:text-white text-sm md:text-base">
                {instruction.step}. {instruction.title}
              </h4>
              <p className="text-xs md:text-sm text-center text-gray-600 dark:text-gray-400">
                {instruction.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
