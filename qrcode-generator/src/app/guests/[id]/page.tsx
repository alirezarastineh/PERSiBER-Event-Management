"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Heading from "@/app/utils/Heading";
import { useGuestDetail } from "@/app/hooks/guests/useGuestDetail";
import { useAlert } from "@/app/hooks/useAlert";
import Spinner from "@/app/components/Common/Spinner";
import ErrorState from "@/app/components/Common/ErrorState";
import AlertModal from "@/app/components/Common/AlertModal";
import DeleteConfirmationModal from "@/app/components/Common/DeleteConfirmationModal";
import BackgroundElements from "@/app/components/Common/BackgroundElements";
import GuestDetailHeader from "@/app/components/GuestDetail/GuestDetailHeader";
import GuestDetailContent from "@/app/components/GuestDetail/GuestDetailContent";

export default function GuestDetail() {
  // Custom hooks
  const {
    guest,
    guestsData,
    editData,
    attendedStatus,
    invitedFromSearchTerm,
    showDropdown,
    userRole,
    isLoading,
    isError,
    setEditData,
    setInvitedFromSearchTerm,
    setShowDropdown,
    handleDeleteGuest,
    handleToggleAttendedStatus,
    handleUpdateGuest,
    handleUpdateStudentStatus,
    handleUpdateLadyStatus,
    handleAdjustDrinksCoupon,
    handleUpdateFreeEntry,
    goBack,
  } = useGuestDetail();

  const {
    showAlertModal,
    alertType,
    alertTitle,
    alertMessage,
    showCustomAlert,
    hideAlert,
    getAlertBackgroundColor,
  } = useAlert();

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Event handlers
  const handleSave = async () => {
    try {
      await handleUpdateGuest();
      showCustomAlert("Success", "Guest updated successfully!", "success");
    } catch (error: any) {
      const errorMessage = error?.data?.message ?? error?.message ?? "Update Failed";
      showCustomAlert(errorMessage, "Could not update guest information.", "error");
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (guest) {
      try {
        await handleDeleteGuest(guest._id);
        setShowDeleteModal(false);
      } catch (error: any) {
        const errorMessage = error?.data?.message ?? error?.message ?? "Failed to delete guest";
        showCustomAlert("Error", errorMessage, "error");
      }
    }
  };

  // Loading and error states
  if (isLoading) return <Spinner xl fullscreen />;
  if (isError || !guest) return <ErrorState title="Error Loading Guest" />;

  const filteredGuests = guestsData?.guests || [];

  return (
    <>
      <Heading title={guest.name} />
      <motion.div
        className="min-h-screen bg-gradient-to-b from-deep-navy to-gray-900 transition-colors duration-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <GuestDetailHeader guestName={guest.name} />

          {/* Main Content */}
          <GuestDetailContent
            guest={guest}
            userRole={userRole}
            attendedStatus={attendedStatus}
            editData={editData}
            invitedFromSearchTerm={invitedFromSearchTerm}
            showDropdown={showDropdown}
            filteredGuests={filteredGuests}
            onToggleAttendedStatus={handleToggleAttendedStatus}
            onEditDataChange={setEditData}
            onInvitedFromSearchChange={setInvitedFromSearchTerm}
            onShowDropdownChange={setShowDropdown}
            onSave={handleSave}
            onDelete={handleDelete}
            onUpdateStudentStatus={handleUpdateStudentStatus}
            onUpdateLadyStatus={handleUpdateLadyStatus}
            onUpdateFreeEntry={handleUpdateFreeEntry}
            onAdjustDrinksCoupon={handleAdjustDrinksCoupon}
            onShowAlert={showCustomAlert}
            goBack={goBack}
          />
        </div>

        {/* Background Elements */}
        <BackgroundElements />

        {/* Modals */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Guest"
          message="Are you sure you want to delete this guest? This action cannot be undone."
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
    </>
  );
}
