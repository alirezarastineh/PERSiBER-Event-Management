import React from "react";
import { motion } from "framer-motion";
import { GuestInfoGridProps } from "@/types/guests";
import GuestDrinksCoupon from "./GuestDrinksCoupon";

export default function GuestInfoGrid({
  guest,
  userRole,
  onAdjustDrinksCoupon,
  onShowAlert,
}: Readonly<GuestInfoGridProps>) {
  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700/30"
      variants={slideUp}
    >
      <GuestDrinksCoupon
        guest={guest}
        userRole={userRole}
        onAdjustDrinksCoupon={onAdjustDrinksCoupon}
        onShowAlert={onShowAlert}
      />

      <div className="space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">Already Paid</p>
        <p className="text-lg font-medium text-warm-charcoal dark:text-white">
          {guest.alreadyPaid ? "Yes" : "No"}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">Free Entry</p>
        <p className="text-lg font-medium text-warm-charcoal dark:text-white">
          {guest.freeEntry ? (
            <span className="text-amber-600 dark:text-amber-400">Yes</span>
          ) : (
            "No"
          )}
        </p>
      </div>

      {/* Admin/Master only fields */}
      {(userRole === "admin" || userRole === "master") && (
        <>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Inviter</p>
            <p className="text-lg font-medium text-warm-charcoal dark:text-white">
              {guest.invitedFrom || "N/A"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
            <p className="text-lg font-medium text-warm-charcoal dark:text-white">
              {guest.isStudent ? (
                <span className="text-blue-600 dark:text-blue-400">Yes</span>
              ) : (
                "No"
              )}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Lady</p>
            <p className="text-lg font-medium text-warm-charcoal dark:text-white">
              {guest.isLady ? (
                <span className="text-pink-600 dark:text-pink-400">Yes</span>
              ) : (
                "No"
              )}
            </p>
          </div>

          {guest.isStudent && guest.untilWhen && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Student Until
              </p>
              <p className="text-lg font-medium text-warm-charcoal dark:text-white">
                {new Date(guest.untilWhen).toLocaleDateString()}
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
