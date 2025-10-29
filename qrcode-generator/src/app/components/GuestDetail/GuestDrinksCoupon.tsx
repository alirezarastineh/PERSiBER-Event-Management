import React from "react";
import { motion } from "framer-motion";
import { GuestDrinksCouponProps } from "@/types/guests";

export default function GuestDrinksCoupon({
  guest,
  userRole,
  onAdjustDrinksCoupon,
  onShowAlert,
}: Readonly<GuestDrinksCouponProps>) {
  const handleUpdateDrinksCoupon = async () => {
    try {
      const inputEl = document.querySelector('input[type="number"]') as HTMLInputElement;
      const newValue = Number.parseInt(inputEl.value, 10) || 0;
      const originalValue = guest.drinksCoupon || 0;

      if (newValue !== originalValue) {
        await onAdjustDrinksCoupon(newValue);
        onShowAlert("Success", "Drink coupons updated successfully!", "success");
      }
    } catch (error) {
      console.error("Failed to update drinks coupon:", error);
      onShowAlert("Error", "Failed to update drink coupons", "error");
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400">Drinks Coupon</p>
      {userRole === "admin" || userRole === "master" ? (
        <div className="flex items-center mt-1 space-x-2">
          <motion.input
            type="number"
            min="0"
            defaultValue={guest.drinksCoupon || 0}
            className="w-full max-w-[120px] px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-accent-amber text-white transition-all duration-300 text-center"
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            onClick={handleUpdateDrinksCoupon}
            className="whitespace-nowrap px-3 py-2 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Update
          </motion.button>
        </div>
      ) : (
        <p className="text-lg font-medium text-white">
          {guest.drinksCoupon || 0}
        </p>
      )}
    </div>
  );
}
