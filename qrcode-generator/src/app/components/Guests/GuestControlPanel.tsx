import { useState } from "react";
import { motion } from "framer-motion";
import SearchInput from "../Common/SearchInput";
import ToggleSwitch from "../Common/ToggleSwitch";
import { GuestControlPanelProps } from "@/types/guests";

export default function GuestControlPanel({
  searchTerm,
  onSearchChange,
  discountStatuses,
  onToggleStudentDiscount,
  onToggleLadyDiscount,
  onAddGuest,
  userRole,
}: Readonly<GuestControlPanelProps>) {
  const [newGuestName, setNewGuestName] = useState<string>("");

  const handleAddGuest = () => {
    onAddGuest(newGuestName);
    setNewGuestName("");
  };

  const isAdminOrMaster = userRole === "admin" || userRole === "master";
  const canAddGuests = isAdminOrMaster || userRole === "user";

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700/50">
      <div className="grid md:grid-cols-[1fr,auto] gap-6">
        {/* Search Input */}
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search by name..."
          label="Search Guests"
          id="search-guests"
        />

        {/* Discount Toggles */}
        {isAdminOrMaster && (
          <div className="flex items-center space-x-6">
            <ToggleSwitch
              isActive={discountStatuses.studentDiscountActive}
              onToggle={onToggleStudentDiscount}
              label="Student Discount"
              size="md"
            />

            <ToggleSwitch
              isActive={discountStatuses.ladyDiscountActive}
              onToggle={onToggleLadyDiscount}
              label="Lady Discount"
              size="md"
            />
          </div>
        )}
      </div>

      {/* Add Guest Section */}
      {canAddGuests && (
        <div className="mt-6 pt-6 border-t border-gray-700/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <label htmlFor="new-guest" className="block text-sm font-medium text-gray-400 mb-2">
                Add New Guest
              </label>
              <motion.input
                id="new-guest"
                type="text"
                placeholder="Enter guest's name"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-accent-amber text-white transition-all duration-300"
                whileFocus={{ scale: 1.01 }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddGuest();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <motion.button
                onClick={handleAddGuest}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md w-full sm:w-auto whitespace-nowrap"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 5px 15px rgba(212, 175, 55, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Add Guest
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
