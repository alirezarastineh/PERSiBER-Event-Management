import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCardsProps } from "@/types/auth";

export default function UserCards({
  users,
  canEditUser,
  canDeleteUser,
  getRoleBadgeClass,
  onEditUser,
  onDeleteUser,
  containerVariants,
  itemVariants,
}: Readonly<UserCardsProps>) {
  return (
    <motion.div
      className="md:hidden space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {users.map((user) => (
          <motion.div
            key={user._id}
            variants={itemVariants}
            className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700/50"
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-lg font-bold text-warm-charcoal dark:text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-warm-charcoal dark:text-white">
                    {user.username}
                  </h3>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(
                  user.role,
                )}`}
              >
                {user.role}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/30 flex gap-2">
              {canEditUser(user.role) && (
                <motion.button
                  onClick={() => onEditUser(user._id, user.role)}
                  className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium shadow-sm flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Role
                </motion.button>
              )}

              {canDeleteUser(user.role) && (
                <motion.button
                  onClick={() => onDeleteUser(user._id)}
                  className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-sm flex items-center justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
