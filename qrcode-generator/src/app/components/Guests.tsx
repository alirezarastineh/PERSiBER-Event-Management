"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "./Common/Spinner";
import AlertModal from "./Common/AlertModal";
import DeleteConfirmationModal from "./Common/DeleteConfirmationModal";
import GuestStatistics from "./Guests/GuestStatistics";
import GuestControlPanel from "./Guests/GuestControlPanel";
import GuestTable from "./Guests/GuestTable";
import GuestCards from "./Guests/GuestCards";
import EditGuestModal from "./Guests/EditGuestModal";
import { useGuestManagement } from "@/app/hooks/guests/useGuestManagement";
import { useAlert } from "@/app/hooks/useAlert";
import { useGuestModals } from "@/app/hooks/guests/useGuestModals";

export default function Guests() {
  const router = useRouter();
  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Custom hooks
  const {
    guestsData,
    filteredGuests,
    isLoading,
    isError,
    searchTerm,
    attendedStatuses,
    discountStatuses,
    setSearchTerm,
    handleCreateGuest,
    handleDeleteGuest,
    handleUpdateGuest,
    handleToggleStudentDiscount,
    handleToggleLadyDiscount,
    handleToggleAttendedStatus,
    handleAdjustDrinksCoupon,
  } = useGuestManagement();

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
    editingGuest,
    editData,
    setEditData,
    invitedFromSearchTerm,
    setInvitedFromSearchTerm,
    showDropdown,
    setShowDropdown,
    showDeleteModal,
    guestIdToDelete,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  } = useGuestModals();

  // Event handlers
  const handleAddGuest = async (name: string) => {
    try {
      await handleCreateGuest(name);
      showCustomAlert("Success", "Guest added successfully!", "success");
    } catch (error: any) {
      showCustomAlert(
        "Input Required",
        error?.data?.message ?? error?.message ?? "Error adding guest",
        "warning"
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (guestIdToDelete) {
      try {
        await handleDeleteGuest(guestIdToDelete);
        closeDeleteModal();
        showCustomAlert("Success", "Guest deleted successfully!", "success");
      } catch (error: any) {
        const errorMessage =
          error?.data?.message ?? error?.message ?? "Failed to delete guest";
        showCustomAlert("Error", errorMessage, "error");
      }
    }
  };

  const handleSaveGuestEdit = async () => {
    if (!editingGuest) return;
    try {
      await handleUpdateGuest(editingGuest._id, editData, editingGuest);
      closeEditModal();
      showCustomAlert("Success", "Guest updated successfully!", "success");
    } catch (error: any) {
      if (error.message === "No changes to update.") {
        showCustomAlert("No Changes", "No changes to update.", "info");
      } else {
        showCustomAlert(
          "Update Failed",
          "Could not update guest information.",
          "error"
        );
      }
    }
  };

  const handleToggleAttended = async (guestId: string) => {
    try {
      await handleToggleAttendedStatus(guestId);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ??
        error?.message ??
        "Failed to update attendance status";
      showCustomAlert("Attendance Error", errorMessage, "error");
    }
  };

  const handleToggleStudentDiscountWrapper = async () => {
    try {
      await handleToggleStudentDiscount();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ??
        error?.message ??
        "Failed to toggle student discount";
      showCustomAlert("Error", errorMessage, "error");
    }
  };

  const handleToggleLadyDiscountWrapper = async () => {
    try {
      await handleToggleLadyDiscount();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ??
        error?.message ??
        "Failed to toggle lady discount";
      showCustomAlert("Error", errorMessage, "error");
    }
  };

  const handleDrinksCouponAdjustment = async (adjustment: number) => {
    if (!editingGuest) return;
    try {
      await handleAdjustDrinksCoupon(editingGuest._id, adjustment);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ??
        error?.message ??
        "Failed to adjust drinks coupon";
      showCustomAlert("Error", errorMessage, "error");
    }
  };

  const navigateToGuestDetail = (guestId: string) => {
    router.push(`/guests/${guestId}`);
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
        className="text-center p-8 rounded-xl bg-red-50 dark:bg-deep-navy border border-red-200 dark:border-red-800/30 shadow-lg max-w-2xl mx-auto my-12"
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
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
          Error Loading Guests
        </h2>
        <p className="text-red-600 dark:text-red-300">
          We couldn&apos;t retrieve the guest data. Please try again later.
        </p>
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
            Guest Management
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-rich-gold to-accent-amber rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.header>

        {/* Stats Summary Cards */}
        {guestsData?.statistics && (
          <GuestStatistics
            statistics={guestsData.statistics}
            userRole={userRole}
            variants={itemVariants}
          />
        )}

        {/* Control Panel Section */}
        <motion.section
          className="mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <GuestControlPanel
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            discountStatuses={discountStatuses}
            onToggleStudentDiscount={handleToggleStudentDiscountWrapper}
            onToggleLadyDiscount={handleToggleLadyDiscountWrapper}
            onAddGuest={handleAddGuest}
            userRole={userRole}
          />
        </motion.section>

        {/* Guests List Section */}
        <motion.section
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          {filteredGuests?.length === 0 ? (
            <motion.div
              className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/50">
                <svg
                  className="w-10 h-10 text-gray-400 dark:text-gray-500"
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
              <h2 className="text-2xl font-bold text-warm-charcoal dark:text-white mb-2">
                No Guests Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {searchTerm
                  ? "No guests match your search criteria."
                  : "There are currently no guests in the system. Add your first guest above."}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Desktop Guest Table */}
              <GuestTable
                guests={filteredGuests || []}
                attendedStatuses={attendedStatuses}
                onToggleAttendedStatus={handleToggleAttended}
                onEditGuest={openEditModal}
                onDeleteGuest={openDeleteModal}
                onNavigateToDetail={navigateToGuestDetail}
                userRole={userRole}
                variants={containerVariants}
                itemVariants={itemVariants}
              />

              {/* Mobile Guest Cards */}
              <GuestCards
                guests={filteredGuests || []}
                attendedStatuses={attendedStatuses}
                onToggleAttendedStatus={handleToggleAttended}
                onEditGuest={openEditModal}
                onDeleteGuest={openDeleteModal}
                onNavigateToDetail={navigateToGuestDetail}
                userRole={userRole}
                variants={containerVariants}
                itemVariants={itemVariants}
              />
            </>
          )}
        </motion.section>

        {/* Detailed Statistics Section */}
        {guestsData?.statistics && (
          <motion.section
            className="mt-12"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-warm-charcoal dark:text-white">
              Detailed Statistics
            </h2>
            <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <motion.div
                  variants={itemVariants}
                  className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 shadow-sm border border-gray-100 dark:border-gray-700/30"
                >
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Guests
                  </h3>
                  <p className="text-3xl font-bold text-rich-gold">
                    {guestsData.statistics.totalCount}
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 shadow-sm border border-gray-100 dark:border-gray-700/30"
                >
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Attended
                  </h3>
                  <p className="text-3xl font-bold text-rich-gold">
                    {guestsData.statistics.attendedCount}
                  </p>
                </motion.div>

                {(userRole === "admin" || userRole === "master") && (
                  <>
                    <motion.div
                      variants={itemVariants}
                      className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 shadow-sm border border-gray-100 dark:border-gray-700/30"
                    >
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Students
                      </h3>
                      <p className="text-3xl font-bold text-rich-gold">
                        {guestsData.statistics.studentsCount ?? 0}
                      </p>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 shadow-sm border border-gray-100 dark:border-gray-700/30"
                    >
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Ladies
                      </h3>
                      <p className="text-3xl font-bold text-rich-gold">
                        {guestsData.statistics.ladiesCount ?? 0}
                      </p>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 shadow-sm border border-gray-100 dark:border-gray-700/30"
                    >
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Drinks Coupons
                      </h3>
                      <p className="text-3xl font-bold text-rich-gold">
                        {guestsData.statistics.drinksCouponsCount ?? 0}
                      </p>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 shadow-sm border border-gray-100 dark:border-gray-700/30"
                    >
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Free Entry
                      </h3>
                      <p className="text-3xl font-bold text-rich-gold">
                        {guestsData.statistics.freeEntryCount ?? 0}
                      </p>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </div>

      {/* Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Guest"
        message="Are you sure you want to delete this guest? This action cannot be undone."
      />

      <EditGuestModal
        isOpen={!!editingGuest}
        onClose={closeEditModal}
        guest={editingGuest}
        editData={editData}
        onEditDataChange={setEditData}
        onSave={handleSaveGuestEdit}
        invitedFromSearchTerm={invitedFromSearchTerm}
        onInvitedFromSearchChange={setInvitedFromSearchTerm}
        showDropdown={showDropdown}
        onShowDropdownChange={setShowDropdown}
        filteredGuests={filteredGuests || []}
        onAdjustDrinksCoupon={handleDrinksCouponAdjustment}
        onShowAlert={showCustomAlert}
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
        className="mt-20 mb-6 text-center opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-rich-gold/20 to-transparent mb-6"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The guest management system allows you to track attendees, manage
            discounts, and maintain comprehensive event statistics.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Updated in real-time
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
              Secure access controls
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Export capabilities
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
