"use client";

import { motion } from "framer-motion";
import { useUserManagement } from "@/app/hooks/useUserManagement";
import { useAlert } from "@/app/hooks/useAlert";
import Spinner from "../../Common/Spinner";
import AlertModal from "../../Common/AlertModal";
import DeleteConfirmationModal from "../../Common/DeleteConfirmationModal";
import UserTable from "../../Users/UserTable";
import UserCards from "../../Users/UserCards";
import UserEmptyState from "../../Users/UserEmptyState";
import UserErrorState from "../../Users/UserErrorState";
import EditUserRoleModal from "../../Users/EditUserRoleModal";
import { useState } from "react";

export default function Users() {
  // Custom hooks
  const {
    users,
    isLoading,
    isError,
    selectedUserId,
    selectedRole,
    setSelectedRole,
    handleDeleteUser,
    handleUpdateRole,
    openEditModal,
    closeEditModal,
    canEditUser,
    canDeleteUser,
    getRoleBadgeClass,
  } = useUserManagement();

  const {
    showAlertModal,
    alertType,
    alertTitle,
    alertMessage,
    showCustomAlert,
    hideAlert,
    getAlertBackgroundColor,
  } = useAlert();

  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  // Delete handlers
  const openDeleteModal = (userId: string) => {
    setUserIdToDelete(userId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserIdToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!userIdToDelete) return;

    try {
      await handleDeleteUser(userIdToDelete);
      showCustomAlert("Success", "User deleted successfully.", "success");
      closeDeleteModal();
    } catch (error: any) {
      showCustomAlert("Error", error.message ?? "Failed to delete user.", "error");
    }
  };

  // Role update handler
  const handleRoleUpdate = async () => {
    try {
      await handleUpdateRole();
      showCustomAlert("Success", "User role updated successfully.", "success");
    } catch (error: any) {
      showCustomAlert("Error", error.message ?? "Failed to update user role.", "error");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner xl />
      </div>
    );
  }

  // Error state
  if (isError) {
    return <UserErrorState />;
  }

  return (
    <motion.section
      className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-deep-navy transition-colors duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-3 gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Users Management
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-rich-gold to-accent-amber rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.header>

        {/* Main Content */}
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-rich-gold/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-amber/5 rounded-full blur-2xl"></div>

          {users.length === 0 ? (
            <UserEmptyState />
          ) : (
            <>
              {/* Desktop Table View */}
              <UserTable
                users={users}
                canEditUser={canEditUser}
                canDeleteUser={canDeleteUser}
                getRoleBadgeClass={getRoleBadgeClass}
                onEditUser={openEditModal}
                onDeleteUser={openDeleteModal}
                containerVariants={containerVariants}
                itemVariants={itemVariants}
              />

              {/* Mobile Cards View */}
              <UserCards
                users={users}
                canEditUser={canEditUser}
                canDeleteUser={canDeleteUser}
                getRoleBadgeClass={getRoleBadgeClass}
                onEditUser={openEditModal}
                onDeleteUser={openDeleteModal}
                containerVariants={containerVariants}
                itemVariants={itemVariants}
              />
            </>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      <EditUserRoleModal
        isOpen={!!selectedUserId}
        onClose={closeEditModal}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onSave={handleRoleUpdate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={hideAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        getBackgroundColor={getAlertBackgroundColor}
      />
    </motion.section>
  );
}
