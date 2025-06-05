"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "./Common/Spinner";
import AlertModal from "./Common/AlertModal";
import DeleteConfirmationModal from "./Common/DeleteConfirmationModal";
import BpplistStatistics from "./BPPList/BpplistStatistics";
import BpplistControlPanel from "./BPPList/BpplistControlPanel";
import BpplistTable from "./BPPList/BpplistTable";
import BpplistCards from "./BPPList/BpplistCards";
import EditBpplistModal from "./BPPList/EditBpplistModal";
import { useBpplistManagement } from "@/app/hooks/bpplist/useBpplistManagement";
import { useAlert } from "@/app/hooks/useAlert";
import { useBpplistModals } from "@/app/hooks/bpplist/useBpplistModals";
import { CreateBpplistDto } from "@/types/bpplist";

export default function BPPList() {
  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Custom hooks
  const {
    bpplistData,
    filteredItems,
    isLoading,
    isError,
    searchTerm,
    toggleStatuses,
    setSearchTerm,
    handleCreateBpplistItem,
    handleDeleteBpplistItem,
    handleUpdateBpplistItem,
    handleToggleAttendedStatus,
    handleToggleHasLeftStatus,
    handleToggleStudentStatus,
  } = useBpplistManagement();

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
    editingItem,
    editData,
    setEditData,
    invitedFromSearchTerm,
    setInvitedFromSearchTerm,
    showDropdown,
    setShowDropdown,
    showDeleteModal,
    itemIdToDelete,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  } = useBpplistModals();

  // Event handlers
  const handleAddBpplistItemWrapper = async (itemData: CreateBpplistDto) => {
    try {
      await handleCreateBpplistItem(itemData);
      showCustomAlert("Success", "BPP attendee added successfully!", "success");
    } catch (error: any) {
      showCustomAlert(
        "Input Required",
        error.message ?? "Error adding BPP attendee.",
        "warning"
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (itemIdToDelete) {
      try {
        await handleDeleteBpplistItem(itemIdToDelete);
        closeDeleteModal();
        showCustomAlert(
          "Success",
          "BPP attendee deleted successfully!",
          "success"
        );
      } catch (error) {
        console.error("Failed to delete BPP attendee:", error);
        showCustomAlert("Error", "Failed to delete BPP attendee.", "error");
      }
    }
  };

  const handleSaveItemEdit = async () => {
    if (!editingItem) return;
    try {
      await handleUpdateBpplistItem(editingItem._id, editData);
      closeEditModal();
      showCustomAlert(
        "Success",
        "BPP attendee updated successfully!",
        "success"
      );
    } catch (error: any) {
      console.error("Failed to update BPP attendee:", error);
      showCustomAlert(
        "Update Failed",
        "Could not update BPP attendee information.",
        "error"
      );
    }
  };

  const handleToggleAttended = async (itemId: string) => {
    try {
      await handleToggleAttendedStatus(itemId);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ??
        error?.message ??
        "Failed to update attendance status";
      showCustomAlert("Attendance Error", errorMessage, "error");
    }
  };

  const handleToggleLeft = async (itemId: string) => {
    try {
      await handleToggleHasLeftStatus(itemId);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ??
        error?.message ??
        "Failed to update has left status";
      showCustomAlert("Error", errorMessage, "error");
    }
  };

  const handleToggleStudent = async (itemId: string) => {
    try {
      await handleToggleStudentStatus(itemId);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ??
        error?.message ??
        "Failed to update student status";
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
        className="flex flex-col items-center justify-center min-h-[60vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Spinner xl />
        <motion.p
          className="mt-6 text-gray-600 dark:text-gray-400 text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Loading BPP attendee data...
        </motion.p>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <svg
            className="w-10 h-10 text-red-600 dark:text-red-400"
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
        </motion.div>
        <motion.h2
          className="text-2xl font-bold text-warm-charcoal dark:text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Unable to Load Data
        </motion.h2>
        <motion.p
          className="text-gray-600 dark:text-gray-400 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          There was an error loading the BPP list. Please try refreshing the
          page or contact support.
        </motion.p>
        <motion.button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium"
          whileHover={{
            scale: 1.03,
            boxShadow: "0 5px 15px rgba(212, 175, 55, 0.2)",
          }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Refresh Page
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-soft-cream to-gray-100 dark:from-deep-navy dark:to-gray-900 transition-colors duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
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
            BPP List Management
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-rich-gold to-accent-amber rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Track and manage all BPP attendees, status, and invitations in one
            place
          </motion.p>
        </motion.header>

        {/* Statistics Summary Cards */}
        {bpplistData?.statistics && (
          <BpplistStatistics
            statistics={bpplistData.statistics}
            userRole={userRole}
            variants={itemVariants}
          />
        )}

        {/* Search & Control Panel Section */}
        <motion.section
          className="mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <BpplistControlPanel
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddBpplistItem={handleAddBpplistItemWrapper}
            userRole={userRole}
          />
        </motion.section>

        {/* Content Section - Table/List View */}
        {(filteredItems?.length ?? 0) === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 dark:border-gray-700/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-warm-charcoal dark:text-white mb-2">
              No BPP Attendees Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              {searchTerm
                ? `No results matching "${searchTerm}". Try a different search term.`
                : "There are no BPP attendees in the system yet. Add your first attendee to get started."}
            </p>
          </motion.div>
        ) : (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Desktop BPP Table */}
            <BpplistTable
              items={filteredItems || []}
              toggleStatuses={toggleStatuses}
              onToggleAttendedStatus={handleToggleAttended}
              onToggleHasLeftStatus={handleToggleLeft}
              onToggleStudentStatus={handleToggleStudent}
              onEditItem={openEditModal}
              onDeleteItem={openDeleteModal}
              userRole={userRole}
              variants={containerVariants}
              itemVariants={itemVariants}
            />

            {/* Mobile BPP Cards */}
            <BpplistCards
              items={filteredItems || []}
              toggleStatuses={toggleStatuses}
              onToggleAttendedStatus={handleToggleAttended}
              onToggleHasLeftStatus={handleToggleLeft}
              onToggleStudentStatus={handleToggleStudent}
              onEditItem={openEditModal}
              onDeleteItem={openDeleteModal}
              userRole={userRole}
              variants={containerVariants}
              itemVariants={itemVariants}
            />
          </motion.section>
        )}

        {/* Enhanced Visual Footer */}
        <motion.footer
          className="mt-20 mb-8 text-center opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-rich-gold/20 to-transparent mb-6"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The BPP list management system tracks attendance, status, and
              membership details for Black Persian Party events.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500">
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
                BPP member creation
              </span>
              <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500">
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
              <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500">
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
              <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500">
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
                Event management
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
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete BPP Attendee"
        message="Are you sure you want to delete this attendee? This action cannot be undone."
      />

      <EditBpplistModal
        isOpen={!!editingItem}
        onClose={closeEditModal}
        item={editingItem}
        editData={editData}
        onEditDataChange={setEditData}
        onSave={handleSaveItemEdit}
        invitedFromSearchTerm={invitedFromSearchTerm}
        onInvitedFromSearchChange={setInvitedFromSearchTerm}
        showDropdown={showDropdown}
        onShowDropdownChange={setShowDropdown}
        filteredItems={filteredItems || []}
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={hideAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        getBackgroundColor={getAlertBackgroundColor}
      />
    </motion.div>
  );
}
