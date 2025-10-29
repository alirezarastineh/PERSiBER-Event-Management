import React from "react";
import { motion } from "framer-motion";

export default function UserErrorState() {
  return (
    <motion.div
      className="text-red-500 text-center p-8 rounded-xl bg-red-900/20 max-w-md mx-auto my-12 border border-red-900/40"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <svg
        className="w-12 h-12 text-red-500 mx-auto mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h2 className="text-xl font-bold mb-2">Error Loading Users</h2>
      <p className="text-red-400">
        We couldn&apos;t retrieve the user data. Please try again later.
      </p>
    </motion.div>
  );
}
