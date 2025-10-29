import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../Common/Modal";
import ToggleSwitch from "../Common/ToggleSwitch";
import { EditBpplistModalProps } from "@/types/bpplist";

export default function EditBpplistModal({
  isOpen,
  onClose,
  item,
  editData,
  onEditDataChange,
  onSave,
  invitedFromSearchTerm,
  onInvitedFromSearchChange,
  showDropdown,
  onShowDropdownChange,
  filteredItems,
}: Readonly<EditBpplistModalProps>) {
  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit BPP Attendee">
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="attendeeName"
                className="block text-sm font-medium text-gray-300"
              >
                Attendee Name
              </label>
              <motion.input
                id="attendeeName"
                type="text"
                placeholder="Name"
                value={editData.name ?? ""}
                onChange={(e) => onEditDataChange({ ...editData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-accent-amber transition-all duration-300 text-white"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="organizer"
                className="block text-sm font-medium text-gray-300"
              >
                Organizer
              </label>
              <motion.select
                id="organizer"
                value={editData.organizer ?? ""}
                onChange={(e) => onEditDataChange({ ...editData, organizer: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-accent-amber transition-all duration-300 text-white"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="">Select Organizer</option>
                <option value="Kourosh">Kourosh</option>
                <option value="Sobhan">Sobhan</option>
                <option value="Mutual">Mutual</option>
              </motion.select>
            </div>

            <div className="space-y-2 relative">
              <label
                htmlFor="invitedFromSearch"
                className="block text-sm font-medium text-gray-300"
              >
                Invited From
              </label>
              <motion.input
                id="invitedFromSearch"
                type="text"
                placeholder="Search for attendee..."
                value={invitedFromSearchTerm}
                onChange={(e) => {
                  onInvitedFromSearchChange(e.target.value);
                  onShowDropdownChange(e.target.value !== "");
                }}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-accent-amber transition-all duration-300 text-white"
                whileFocus={{ scale: 1.01 }}
              />

              {/* Dropdown suggestions using filteredItems */}
              {showDropdown && filteredItems && filteredItems.length > 0 && (
                <motion.div
                  className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {filteredItems.map((attendeeItem) => (
                    <button
                      key={attendeeItem._id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 text-gray-200 text-sm transition-colors duration-150"
                      onClick={() => {
                        onEditDataChange({
                          ...editData,
                          invitedFrom: attendeeItem.name,
                        });
                        onInvitedFromSearchChange(attendeeItem.name);
                        onShowDropdownChange(false);
                      }}
                    >
                      {attendeeItem.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Attended Status */}
              <div className="space-y-2">
                <label
                  htmlFor="attendedStatus"
                  className="block text-sm font-medium text-gray-300"
                >
                  Attended Status
                </label>
                <select
                  id="attendedStatus"
                  value={editData.attended ?? "No"}
                  onChange={(e) => onEditDataChange({ ...editData, attended: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Left Status Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="hasLeft"
                    className="text-sm font-medium text-gray-300"
                  >
                    Has Left
                  </label>
                  <ToggleSwitch
                    isActive={editData.hasLeft ?? false}
                    onToggle={() =>
                      onEditDataChange({
                        ...editData,
                        hasLeft: !editData.hasLeft,
                      })
                    }
                    size="md"
                    ariaLabel={editData.hasLeft ? "Set as not left" : "Set as left"}
                  />
                </div>
              </div>
            </div>

            {/* Student Status and Date Field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="isStudent"
                    className="text-sm font-medium text-gray-300"
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
                    ariaLabel={editData.isStudent ? "Set as not student" : "Set as student"}
                  />
                </div>
              </div>

              {editData.isStudent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <label
                    htmlFor="validUntil"
                    className="block text-sm font-medium text-gray-300"
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
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-white"
                  />
                </motion.div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <motion.button
                onClick={onSave}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md"
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
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white font-medium"
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
