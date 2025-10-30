import { motion } from "framer-motion";
import { GuestDetailContentProps } from "@/types/guests";
import ToggleSwitch from "../Common/ToggleSwitch";
import GuestInfoGrid from "./GuestInfoGrid";
import GuestEditForm from "./GuestEditForm";

export default function GuestDetailContent({
  guest,
  userRole,
  attendedStatus,
  editData,
  invitedFromSearchTerm,
  showDropdown,
  filteredGuests,
  onToggleAttendedStatus,
  onEditDataChange,
  onInvitedFromSearchChange,
  onShowDropdownChange,
  onSave,
  onDelete,
  onUpdateStudentStatus,
  onUpdateLadyStatus,
  onUpdateFreeEntry,
  onAdjustDrinksCoupon,
  onShowAlert,
  goBack,
}: Readonly<GuestDetailContentProps>) {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.section className="mb-12" variants={fadeIn} initial="hidden" animate="visible">
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-700/50">
        <div className="space-y-6">
          {/* Guest Status Section */}
          <ToggleSwitch
            isActive={attendedStatus}
            onToggle={onToggleAttendedStatus}
            title="Attendance Status"
            layout="between"
            colorScheme="emerald"
            variants={slideUp}
          />

          {/* Guest Information Grid */}
          <GuestInfoGrid
            guest={guest}
            userRole={userRole}
            onAdjustDrinksCoupon={onAdjustDrinksCoupon}
            onShowAlert={onShowAlert}
          />

          {/* Admin or Master Actions */}
          {(userRole === "admin" || userRole === "master") && (
            <GuestEditForm
              guest={guest}
              editData={editData}
              onEditDataChange={onEditDataChange}
              invitedFromSearchTerm={invitedFromSearchTerm}
              onInvitedFromSearchChange={onInvitedFromSearchChange}
              showDropdown={showDropdown}
              onShowDropdownChange={onShowDropdownChange}
              filteredGuests={filteredGuests}
              onSave={onSave}
              onDelete={onDelete}
              onUpdateStudentStatus={onUpdateStudentStatus}
              onUpdateLadyStatus={onUpdateLadyStatus}
              onUpdateFreeEntry={onUpdateFreeEntry}
            />
          )}

          {/* Back Button */}
          <div className="flex justify-center mt-6 pt-6 border-t border-gray-700/30">
            <motion.button
              onClick={goBack}
              className="px-6 py-3 rounded-lg bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-medium shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Guest List
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
