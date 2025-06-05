import React from "react";
import { motion } from "framer-motion";
import { ErrorStateProps } from "@/types/common";

export default function ErrorState({
  title = "Error Loading Data",
  message = "We couldn't retrieve the data. Please try again later.",
}: Readonly<ErrorStateProps>) {
  return (
    <motion.div
      className="text-center p-8 rounded-xl bg-red-50 dark:bg-deep-navy border border-red-200 dark:border-red-800/30 shadow-lg max-w-2xl mx-auto my-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg
        className="w-12 h-12 text-red-500 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
        {title}
      </h2>
      <p className="text-red-600 dark:text-red-300">{message}</p>
    </motion.div>
  );
}
