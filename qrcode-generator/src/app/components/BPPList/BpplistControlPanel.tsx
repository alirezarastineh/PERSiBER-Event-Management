import { useState } from "react";
import { motion } from "framer-motion";
import SearchInput from "../Common/SearchInput";
import { CreateBpplistDto, BpplistControlPanelProps } from "@/types/bpplist";

export default function BpplistControlPanel({
  searchTerm,
  onSearchChange,
  onAddBpplistItem,
  userRole,
}: Readonly<BpplistControlPanelProps>) {
  const [newItemData, setNewItemData] = useState<CreateBpplistDto>({
    name: "",
    attended: "No",
    organizer: "",
    invitedFrom: "",
    hasLeft: false,
    isStudent: false,
    untilWhen: null,
  });

  const handleAddItem = () => {
    onAddBpplistItem(newItemData);
    setNewItemData({
      name: "",
      attended: "No",
      organizer: "",
      invitedFrom: "",
      hasLeft: false,
      isStudent: false,
      untilWhen: null,
    });
  };

  const isAdminOrMaster = userRole === "admin" || userRole === "master";

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700/50">
      {/* Search Input */}
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search by name..."
        label="Search BPP Attendees"
        id="search-bpp"
      />

      {/* Add BPP Attendee Form - Admin/Master only */}
      {isAdminOrMaster && (
        <motion.div
          className="mt-8 pt-6 border-t border-gray-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-4 text-white">Add New BPP Attendee</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label htmlFor="bpp-name" className="block text-sm font-medium text-gray-400">
                Full Name
              </label>
              <motion.input
                id="bpp-name"
                type="text"
                placeholder="Enter name"
                value={newItemData.name || ""}
                onChange={(e) =>
                  setNewItemData({
                    ...newItemData,
                    name: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-accent-amber text-white transition-all duration-300"
                whileFocus={{ scale: 1.01 }}
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="bpp-organizer" className="block text-sm font-medium text-gray-400">
                Organizer
              </label>
              <motion.select
                id="bpp-organizer"
                value={newItemData.organizer ?? ""}
                onChange={(e) =>
                  setNewItemData({
                    ...newItemData,
                    organizer: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-accent-amber text-white transition-all duration-300"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="">Select Organizer</option>
                <option value="Kourosh">Kourosh</option>
                <option value="Sobhan">Sobhan</option>
                <option value="Mutual">Mutual</option>
              </motion.select>
            </div>
          </div>

          <div className="mt-5">
            <motion.button
              onClick={handleAddItem}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md flex items-center justify-center"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 5px 15px rgba(212, 175, 55, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              disabled={!newItemData.name}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add BPP Attendee
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
