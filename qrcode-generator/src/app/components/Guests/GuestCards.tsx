import React from "react";
import { motion } from "framer-motion";
import { GuestCardsProps } from "@/types/guests";
import ToggleSwitch from "../Common/ToggleSwitch";

export default function GuestCards({
  guests,
  attendedStatuses,
  onToggleAttendedStatus,
  onEditGuest,
  onDeleteGuest,
  onNavigateToDetail,
  userRole,
  variants,
  itemVariants,
}: Readonly<GuestCardsProps>) {
  const isAdminOrMaster = userRole === "admin" || userRole === "master";

  return (
    <motion.div
      className="md:hidden space-y-4"
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {guests.map((guest) => (
        <motion.div
          key={guest._id}
          variants={itemVariants}
          className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700/50"
          exit={{ opacity: 0, height: 0 }}
          layout
        >
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <motion.h3
                className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-rich-gold dark:hover:text-accent-amber transition-colors duration-200"
                onClick={() => onNavigateToDetail(guest._id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {guest.name}
              </motion.h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Added by: {guest.addedBy ?? "N/A"}
              </p>
            </div>
            <div>
              <ToggleSwitch
                isActive={attendedStatuses[guest._id]}
                onToggle={() => onToggleAttendedStatus(guest._id)}
                size="sm"
                ariaLabel={
                  attendedStatuses[guest._id] ? "Mark as not attended" : "Mark as attended"
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">Drinks Coupon</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {guest.drinksCoupon || 0}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">Free Entry</span>
              <span
                className={`text-sm font-medium ${
                  guest.freeEntry
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {guest.freeEntry ? "Yes" : "No"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">Attended At</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {guest.attendedAt && guest.attended === "Yes"
                  ? new Date(guest.attendedAt).toLocaleString()
                  : "Not attended"}
              </span>
            </div>

            {isAdminOrMaster && (
              <>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Inviter</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {guest.invitedFrom || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Student</span>
                  <span
                    className={`text-sm font-medium ${
                      guest.isStudent
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {guest.isStudent ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Lady</span>
                  <span
                    className={`text-sm font-medium ${
                      guest.isLady
                        ? "text-pink-600 dark:text-pink-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {guest.isLady ? "Yes" : "No"}
                  </span>
                </div>
              </>
            )}
          </div>

          {isAdminOrMaster && (
            <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/30">
              <motion.button
                onClick={() => onEditGuest(guest)}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium text-sm shadow-sm flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={guest.name === "Master"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </motion.button>
              <motion.button
                onClick={() => onDeleteGuest(guest._id)}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium text-sm shadow-sm flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={guest.name === "Master"}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </motion.button>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
