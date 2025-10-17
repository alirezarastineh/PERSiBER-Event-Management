import React from "react";
import { GuestDetailsCardProps } from "@/types/guests";

export default function GuestDetailsCard({ guest }: Readonly<GuestDetailsCardProps>) {
  const getAttendedStatusBadgeColor = (status: string) => {
    return status === "Yes"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
      <h4 className="font-medium text-center mb-3 text-warm-charcoal dark:text-white">
        Guest Details
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Name:</span>
          <span className="font-medium text-warm-charcoal dark:text-white">{guest.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAttendedStatusBadgeColor(
              guest.attended,
            )}`}
          >
            {guest.attended}
          </span>
        </div>
        {guest.invitedFrom && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Invited By:</span>
            <span className="font-medium text-warm-charcoal dark:text-white">
              {guest.invitedFrom}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Drinks Coupon:</span>
          <span className="font-medium text-warm-charcoal dark:text-white">
            {guest.drinksCoupon || 0}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Free Entry:</span>
          <span className="font-medium text-warm-charcoal dark:text-white">
            {guest.freeEntry ? "Yes" : "No"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Student:</span>
          <span className="font-medium text-warm-charcoal dark:text-white">
            {guest.isStudent ? "Yes" : "No"}
          </span>
        </div>
      </div>
    </div>
  );
}
