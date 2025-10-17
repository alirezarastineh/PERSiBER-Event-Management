import React from "react";
import { motion } from "framer-motion";
import ToggleSwitch from "../Common/ToggleSwitch";
import { GuestEditFormProps } from "@/types/guests";

export default function GuestEditForm({
  guest,
  editData,
  onEditDataChange,
  invitedFromSearchTerm,
  onInvitedFromSearchChange,
  showDropdown,
  onShowDropdownChange,
  filteredGuests,
  onSave,
  onDelete,
  onUpdateStudentStatus,
  onUpdateLadyStatus,
  onUpdateFreeEntry,
}: Readonly<GuestEditFormProps>) {
  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700/30"
      variants={slideUp}
    >
      <h3 className="text-lg font-semibold mb-4 text-warm-charcoal dark:text-white">
        Edit Guest Information
      </h3>
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            Name
          </label>
          <motion.input
            id="name"
            type="text"
            value={editData.name}
            onChange={(e) => onEditDataChange({ ...editData, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
            whileFocus={{ scale: 1.01 }}
          />
        </div>

        {/* Invited From Searchable Input */}
        <div className="relative">
          <label
            htmlFor="invitedFrom"
            className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            Inviter
          </label>
          <motion.input
            id="invitedFrom"
            type="text"
            placeholder="Search for inviter"
            value={invitedFromSearchTerm}
            onChange={(e) => {
              onInvitedFromSearchChange(e.target.value);
              onShowDropdownChange(e.target.value !== "");
            }}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
            whileFocus={{ scale: 1.01 }}
          />
          {showDropdown && (
            <div className="absolute z-10 bg-white dark:bg-gray-800 w-full border border-gray-200 dark:border-gray-700 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
              {filteredGuests
                .filter((g) => g.name.toLowerCase().includes(invitedFromSearchTerm.toLowerCase()))
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

        {/* Toggle Switches Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Is Student Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="isStudent"
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Student
              </label>
              <ToggleSwitch
                isActive={editData.isStudent ?? false}
                onToggle={async () => {
                  const newStudentStatus = !editData.isStudent;
                  onEditDataChange({
                    ...editData,
                    isStudent: newStudentStatus,
                  });
                  try {
                    await onUpdateStudentStatus(newStudentStatus);
                  } catch (error) {
                    console.error("Failed to update student status:", error);
                  }
                }}
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
                  className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
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
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
                />
              </motion.div>
            )}
          </div>

          {/* Is Lady Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="isLady"
              className="text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              Lady
            </label>
            <ToggleSwitch
              isActive={editData.isLady ?? false}
              onToggle={async () => {
                const newLadyStatus = !editData.isLady;
                onEditDataChange({ ...editData, isLady: newLadyStatus });
                try {
                  await onUpdateLadyStatus(newLadyStatus);
                } catch (error) {
                  console.error("Failed to update lady status:", error);
                }
              }}
              size="md"
            />
          </div>

          {/* Free Entry Toggle */}
          <div className="flex items-center justify-between col-span-1 md:col-span-2">
            <label
              htmlFor="freeEntry"
              className="text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              Free Entry
            </label>
            <ToggleSwitch
              isActive={editData.freeEntry ?? false}
              onToggle={async () => {
                const newFreeEntryStatus = !editData.freeEntry;
                onEditDataChange({
                  ...editData,
                  freeEntry: newFreeEntryStatus,
                });
                try {
                  await onUpdateFreeEntry(newFreeEntryStatus);
                } catch (error) {
                  console.error("Failed to update free entry status:", error);
                }
              }}
              size="md"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <motion.button
            onClick={onSave}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            Save Changes
          </motion.button>

          <motion.button
            onClick={onDelete}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-md"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 5px 15px rgba(212, 175, 55, 0.1)",
            }}
            whileTap={{ scale: 0.98 }}
            disabled={!guest || guest.name === "Master"}
          >
            Delete Guest
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
