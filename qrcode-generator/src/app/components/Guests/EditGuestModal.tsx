import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../Common/Modal";
import ToggleSwitch from "../Common/ToggleSwitch";
import { EditGuestModalProps } from "@/types/guests";

export default function EditGuestModal({
  isOpen,
  onClose,
  guest,
  editData,
  onEditDataChange,
  onSave,
  invitedFromSearchTerm,
  onInvitedFromSearchChange,
  showDropdown,
  onShowDropdownChange,
  filteredGuests,
  onAdjustDrinksCoupon,
  onShowAlert,
}: Readonly<EditGuestModalProps>) {
  if (!guest) return null;

  const handleSave = () => {
    try {
      onSave();
    } catch (error) {
      console.error("Failed to save guest data:", error);
      onShowAlert("Update Failed", "Could not update guest information.", "error");
    }
  };

  const handleUpdateDrinksCoupon = async () => {
    if (!guest) return;
    try {
      const originalCoupons = guest.drinksCoupon ?? 0;
      const newCoupons = guest.drinksCoupon || 0;
      const adjustment = newCoupons - originalCoupons;

      if (adjustment !== 0) {
        onAdjustDrinksCoupon(adjustment);
        onShowAlert("Success", "Drink coupons updated successfully!", "success");
      }
    } catch (error) {
      console.error("Failed to update drink coupons:", error);
      onShowAlert("Error", "Failed to update drink coupons", "error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Guest">
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="guestName"
                className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
              >
                Guest Name
              </label>
              <motion.input
                id="guestName"
                type="text"
                placeholder="Name"
                value={editData.name ?? ""}
                onChange={(e) => onEditDataChange({ ...editData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-warm-charcoal dark:text-white"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            {/* Drinks Coupon Control */}
            <div className="space-y-3">
              <label
                htmlFor="drinksCoupon"
                className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
              >
                Drinks Coupon
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
                <motion.input
                  id="drinksCoupon"
                  type="number"
                  min="0"
                  value={guest.drinksCoupon || 0}
                  onChange={(e) => {
                    const newValue = Number.parseInt(e.target.value, 10) || 0;
                    // Update guest object for immediate visual feedback
                    guest.drinksCoupon = newValue;
                  }}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white"
                  whileFocus={{ scale: 1.01 }}
                />
                <motion.button
                  onClick={handleUpdateDrinksCoupon}
                  className="w-full sm:w-auto px-4 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Update
                </motion.button>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label
                htmlFor="inviterSearch"
                className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
              >
                Inviter
              </label>
              <motion.input
                id="inviterSearch"
                type="text"
                placeholder="Search Inviter"
                value={invitedFromSearchTerm || ""}
                onChange={(e) => {
                  onInvitedFromSearchChange(e.target.value);
                  onShowDropdownChange(e.target.value !== "");
                }}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-warm-charcoal dark:text-white"
                whileFocus={{ scale: 1.01 }}
              />
              {showDropdown && (
                <div className="absolute z-10 bg-white dark:bg-gray-800 w-full border border-gray-200 dark:border-gray-700 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                  {filteredGuests
                    ?.filter((g) =>
                      g.name.toLowerCase().includes(invitedFromSearchTerm.toLowerCase()),
                    )
                    .map((g) => (
                      <button
                        key={g._id}
                        className="cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left w-full text-warm-charcoal dark:text-white text-sm transition-colors duration-150"
                        onClick={() => {
                          onEditDataChange({
                            ...editData,
                            invitedFrom: g.name,
                          });
                          onInvitedFromSearchChange(g.name);
                          onShowDropdownChange(false);
                        }}
                      >
                        {g.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
              {/* Student Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="isStudent"
                    className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                  >
                    Student
                  </label>
                  <ToggleSwitch
                    isActive={editData.isStudent ?? false}
                    onToggle={() =>
                      onEditDataChange({
                        ...editData,
                        isStudent: !editData.isStudent,
                      })
                    }
                    size="md"
                  />
                </div>

                {editData.isStudent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label
                      htmlFor="validUntil"
                      className="block text-sm font-medium text-warm-charcoal dark:text-gray-300 mb-2"
                    >
                      Valid Until
                    </label>
                    <input
                      id="validUntil"
                      type="date"
                      value={
                        editData.untilWhen
                          ? new Date(editData.untilWhen).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const parsedDate = new Date(e.target.value);
                        onEditDataChange({
                          ...editData,
                          untilWhen: Number.isNaN(parsedDate.getTime()) ? null : parsedDate,
                        });
                      }}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-warm-charcoal dark:text-white"
                    />
                  </motion.div>
                )}
              </div>

              {/* Lady Toggle */}
              <div className="flex items-center justify-between">
                <label
                  htmlFor="isLady"
                  className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                >
                  Lady
                </label>
                <ToggleSwitch
                  isActive={editData.isLady ?? false}
                  onToggle={() => onEditDataChange({ ...editData, isLady: !editData.isLady })}
                  size="md"
                />
              </div>

              {/* Free Entry Toggle */}
              <div className="flex items-center justify-between sm:col-span-2">
                <label
                  htmlFor="freeEntry"
                  className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                >
                  Free Entry
                </label>
                <ToggleSwitch
                  isActive={editData.freeEntry ?? false}
                  onToggle={() =>
                    onEditDataChange({
                      ...editData,
                      freeEntry: !editData.freeEntry,
                    })
                  }
                  size="md"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
              <motion.button
                onClick={handleSave}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md order-2 sm:order-1"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Save Changes
              </motion.button>
              <motion.button
                onClick={onClose}
                className="w-full px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-warm-charcoal dark:text-white font-medium order-1 sm:order-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
