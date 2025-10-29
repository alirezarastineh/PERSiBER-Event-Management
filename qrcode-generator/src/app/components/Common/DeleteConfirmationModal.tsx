import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "./Modal";
import { DeleteConfirmationModalProps } from "@/types/common";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
}: Readonly<DeleteConfirmationModalProps>) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
          <div className="space-y-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-red-900/30">
              <svg
                className="w-8 h-8 text-red-500"
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
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">
                {title}
              </h3>
              <p className="text-gray-400">{message}</p>
            </div>

            <div className="flex gap-3 pt-3">
              <motion.button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-md"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 5px 15px rgba(212, 175, 55, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Yes, Delete
              </motion.button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
