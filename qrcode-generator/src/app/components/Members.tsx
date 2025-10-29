"use client";

import { motion } from "framer-motion";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "./Common/Spinner";
import AlertModal from "./Common/AlertModal";
import DeleteConfirmationModal from "./Common/DeleteConfirmationModal";
import MemberStatistics from "./Members/MemberStatistics";
import MemberControlPanel from "./Members/MemberControlPanel";
import MemberTable from "./Members/MemberTable";
import MemberCards from "./Members/MemberCards";
import EditMemberModal from "./Members/EditMemberModal";
import { useMemberManagement } from "@/app/hooks/members/useMemberManagement";
import { useAlert } from "@/app/hooks/useAlert";
import { useMemberModals } from "@/app/hooks/members/useMemberModals";
import { CreateMemberDto } from "@/types/members";

export default function Members() {
  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Custom hooks
  const {
    membersData,
    filteredMembers,
    isLoading,
    isError,
    searchTerm,
    toggleStatuses,
    setSearchTerm,
    handleCreateMember,
    handleDeleteMember,
    handleUpdateMember,
    handleToggleAttendedStatus,
    handleToggleHasLeftStatus,
    handleToggleStudentStatus,
  } = useMemberManagement();

  const {
    showAlertModal,
    alertType,
    alertTitle,
    alertMessage,
    showCustomAlert,
    hideAlert,
    getAlertBackgroundColor,
  } = useAlert();

  const {
    editingMember,
    editData,
    setEditData,
    invitedFromSearchTerm,
    setInvitedFromSearchTerm,
    showDropdown,
    setShowDropdown,
    showDeleteModal,
    memberIdToDelete,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  } = useMemberModals();

  // Event handlers
  const handleAddMember = async (memberData: CreateMemberDto) => {
    try {
      await handleCreateMember(memberData);
      showCustomAlert("Success", "Member added successfully!", "success");
    } catch (error: any) {
      showCustomAlert(
        "Input Required",
        error?.data?.message ?? error?.message ?? "Error adding member.",
        "warning",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (memberIdToDelete) {
      try {
        await handleDeleteMember(memberIdToDelete);
        closeDeleteModal();
        showCustomAlert("Success", "Member deleted successfully!", "success");
      } catch (error: any) {
        showCustomAlert(
          "Error",
          error?.data?.message ?? error?.message ?? "Failed to delete member.",
          "error",
        );
      }
    }
  };

  const handleSaveMemberEdit = async () => {
    if (!editingMember) return;
    try {
      await handleUpdateMember(editingMember._id, editData);
      closeEditModal();
      showCustomAlert("Success", "Member updated successfully!", "success");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ?? error?.message ?? "Could not update member information";
      showCustomAlert("Update Failed", errorMessage, "error");
    }
  };

  const handleToggleAttended = async (memberId: string) => {
    try {
      await handleToggleAttendedStatus(memberId);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ?? error?.message ?? "Failed to update attendance status";
      showCustomAlert("Attendance Error", errorMessage, "error");
    }
  };

  const handleToggleLeft = async (memberId: string) => {
    try {
      await handleToggleHasLeftStatus(memberId);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ?? error?.message ?? "Failed to update has left status";
      showCustomAlert("Error", errorMessage, "error");
    }
  };

  const handleToggleStudent = async (memberId: string) => {
    try {
      await handleToggleStudentStatus(memberId);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ?? error?.message ?? "Failed to update student status";
      showCustomAlert("Error", errorMessage, "error");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  if (isLoading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-[70vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Spinner xl />
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        className="text-center p-8 rounded-xl bg-deep-navy border border-red-800/30 shadow-lg max-w-2xl mx-auto my-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          className="w-12 h-12 text-red-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Members</h2>
        <p className="text-red-300">
          We couldn&apos;t retrieve the member data. Please try again later.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-deep-navy to-gray-900 transition-colors duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.header
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-3 gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Members Management
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-rich-gold to-accent-amber rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.header>

        {/* Statistics Summary Cards */}
        {membersData?.statistics && (
          <MemberStatistics
            statistics={membersData.statistics}
            userRole={userRole}
            variants={itemVariants}
          />
        )}

        {/* Control Panel Section */}
        <motion.section className="mb-12" variants={fadeIn} initial="hidden" animate="visible">
          <MemberControlPanel
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddMember={handleAddMember}
            userRole={userRole}
          />
        </motion.section>

        {/* Members List Section */}
        <motion.section
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          {filteredMembers?.length === 0 ? (
            <motion.div
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-gray-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-700/50">
                <svg
                  className="w-10 h-10 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Members Found</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchTerm
                  ? "No members match your search criteria."
                  : "There are currently no members in the system. Add your first member above."}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Desktop Member Table */}
              <MemberTable
                members={filteredMembers || []}
                toggleStatuses={toggleStatuses}
                onToggleAttendedStatus={handleToggleAttended}
                onToggleHasLeftStatus={handleToggleLeft}
                onToggleStudentStatus={handleToggleStudent}
                onEditMember={openEditModal}
                onDeleteMember={openDeleteModal}
                userRole={userRole}
                variants={containerVariants}
                itemVariants={itemVariants}
              />

              {/* Mobile Member Cards */}
              <MemberCards
                members={filteredMembers || []}
                toggleStatuses={toggleStatuses}
                onToggleAttendedStatus={handleToggleAttended}
                onToggleHasLeftStatus={handleToggleLeft}
                onToggleStudentStatus={handleToggleStudent}
                onEditMember={openEditModal}
                onDeleteMember={openDeleteModal}
                userRole={userRole}
                variants={containerVariants}
                itemVariants={itemVariants}
              />
            </>
          )}
        </motion.section>
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
      />

      <EditMemberModal
        isOpen={!!editingMember}
        onClose={closeEditModal}
        member={editingMember}
        editData={editData}
        onEditDataChange={setEditData}
        onSave={handleSaveMemberEdit}
        invitedFromSearchTerm={invitedFromSearchTerm}
        onInvitedFromSearchChange={setInvitedFromSearchTerm}
        showDropdown={showDropdown}
        onShowDropdownChange={setShowDropdown}
        filteredMembers={
          membersData?.members.filter(
            (member) =>
              invitedFromSearchTerm.trim() === "" ||
              member.name.toLowerCase().includes(invitedFromSearchTerm.toLowerCase()),
          ) || []
        }
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={hideAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        getBackgroundColor={getAlertBackgroundColor}
      />

      {/* Enhanced Visual Footer */}
      <motion.footer
        className="mt-20 mb-8 text-center opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-rich-gold/20 to-transparent mb-6"></div>
          <p className="text-sm text-gray-400">
            The member management system tracks attendance, status, and membership details to ensure
            a premium experience for all members.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <span className="inline-flex items-center text-xs text-gray-500">
              <svg
                className="w-4 h-4 mr-1 text-rich-gold/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Member creation
            </span>
            <span className="inline-flex items-center text-xs text-gray-500">
              <svg
                className="w-4 h-4 mr-1 text-rich-gold/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Attendance tracking
            </span>
            <span className="inline-flex items-center text-xs text-gray-500">
              <svg
                className="w-4 h-4 mr-1 text-rich-gold/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure data
            </span>
            <span className="inline-flex items-center text-xs text-gray-500">
              <svg
                className="w-4 h-4 mr-1 text-rich-gold/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Student status tracking
            </span>
          </div>
        </div>
      </motion.footer>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-[10%] w-64 h-64 bg-rich-gold/5 rounded-full blur-3xl transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-[10%] w-96 h-96 bg-accent-amber/5 rounded-full blur-3xl transform translate-y-1/2"></div>
        <div className="absolute top-1/3 right-[15%] w-48 h-48 bg-rich-gold/5 rounded-full blur-2xl"></div>
      </div>
    </motion.div>
  );
}
