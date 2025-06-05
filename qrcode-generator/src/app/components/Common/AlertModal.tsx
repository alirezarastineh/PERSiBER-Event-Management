import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "./Modal";
import { AlertModalProps } from "@/types/common";

export default function AlertModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  getBackgroundColor,
  customContent,
}: Readonly<AlertModalProps>) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-8 h-8 text-amber-600 dark:text-amber-400"
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
        );
      case "info":
      default:
        return (
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
          <div className="space-y-6">
            <div
              className="flex items-center justify-center w-16 h-16 mx-auto rounded-full"
              style={{
                backgroundColor: getBackgroundColor(type),
              }}
            >
              {getIcon()}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-warm-charcoal dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </div>

            {/* Custom content area */}
            {customContent && <div>{customContent}</div>}

            <div className="flex gap-3 pt-3 justify-center">
              <motion.button
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md min-w-[120px]"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Okay
              </motion.button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
