"use client";

import React, { useState } from "react";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} from "@/redux/features/users/usersApiSlice";
import { UpdateUserRoleDto } from "@/types/types";
import Spinner from "../../Common/Spinner";
import Modal from "../../Common/Modal";
import { useAppSelector } from "@/redux/hooks";
import { motion, AnimatePresence } from "framer-motion";

export default function Users() {
  const { data: users, isLoading, isError, refetch } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  const currentUserRole = useAppSelector((state) => state.auth.user?.role);

  const handleDeleteUser = async () => {
    if (userIdToDelete) {
      try {
        await deleteUser(userIdToDelete).unwrap();
        refetch();
        setShowDeleteModal(false);
        setUserIdToDelete(null);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const openDeleteModal = (id: string) => {
    setUserIdToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserIdToDelete(null);
  };

  const handleUpdateRole = async () => {
    if (!selectedUserId || !selectedRole) {
      return;
    }

    const updateData: UpdateUserRoleDto = {
      id: selectedUserId,
      role: selectedRole,
    };

    try {
      await updateUserRole(updateData).unwrap();
      refetch();
      setSelectedUserId(null);
      setSelectedRole("");
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner xl />
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        className="text-red-500 text-center p-8 rounded-xl bg-red-50 dark:bg-red-900/20 max-w-md mx-auto my-12 border border-red-200 dark:border-red-900/40"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          className="w-12 h-12 text-red-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-xl font-bold mb-2">Error Loading Users</h2>
        <p className="text-red-600 dark:text-red-400">
          We couldn&apos;t retrieve the user data. Please try again later.
        </p>
      </motion.div>
    );
  }

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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "master":
        return "bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <motion.section
      className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-soft-cream dark:bg-deep-navy transition-colors duration-500"
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
          {/* Subtle decorative elements */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-rich-gold/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-amber/5 rounded-full blur-2xl"></div>

          {users?.length === 0 ? (
            <motion.div
              className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl border border-gray-100 dark:border-gray-700/50"
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
                No Users Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                There are currently no users in the system. Users will appear
                here once they are added.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Desktop View */}
              <motion.div
                className="hidden md:block overflow-hidden bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700/70">
                      <th className="px-6 py-5 text-left text-sm font-semibold text-warm-charcoal dark:text-white">
                        Username
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-semibold text-warm-charcoal dark:text-white">
                        Role
                      </th>
                      <th className="px-6 py-5 text-right text-sm font-semibold text-warm-charcoal dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {users?.map((user, index) => (
                        <motion.tr
                          key={user._id}
                          variants={itemVariants}
                          className="border-b border-gray-100 dark:border-gray-700/30 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors duration-200"
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                  {user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-3">
                              {currentUserRole === "admin" &&
                                user.role === "user" && (
                                  <motion.button
                                    onClick={() => openDeleteModal(user._id)}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-sm"
                                    whileHover={{
                                      scale: 1.05,
                                      boxShadow:
                                        "0 5px 15px rgba(212, 175, 55, 0.2)",
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    Delete
                                  </motion.button>
                                )}

                              {currentUserRole === "master" &&
                                user.role === "user" && (
                                  <>
                                    <motion.button
                                      onClick={() => {
                                        setSelectedUserId(user._id);
                                        setSelectedRole(user.role);
                                      }}
                                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium shadow-sm"
                                      whileHover={{
                                        scale: 1.05,
                                        boxShadow:
                                          "0 5px 15px rgba(212, 175, 55, 0.3)",
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Edit Role
                                    </motion.button>
                                    <motion.button
                                      onClick={() => openDeleteModal(user._id)}
                                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-sm"
                                      whileHover={{
                                        scale: 1.05,
                                        boxShadow:
                                          "0 5px 15px rgba(212, 175, 55, 0.2)",
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Delete
                                    </motion.button>
                                  </>
                                )}

                              {currentUserRole === "master" &&
                                user.role === "admin" && (
                                  <>
                                    <motion.button
                                      onClick={() => {
                                        setSelectedUserId(user._id);
                                        setSelectedRole(user.role);
                                      }}
                                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium shadow-sm"
                                      whileHover={{
                                        scale: 1.05,
                                        boxShadow:
                                          "0 5px 15px rgba(212, 175, 55, 0.3)",
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Edit Role
                                    </motion.button>
                                    <motion.button
                                      onClick={() => openDeleteModal(user._id)}
                                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-sm"
                                      whileHover={{
                                        scale: 1.05,
                                        boxShadow:
                                          "0 5px 15px rgba(212, 175, 55, 0.2)",
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      Delete
                                    </motion.button>
                                  </>
                                )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </motion.div>

              {/* Mobile View */}
              <motion.div
                className="md:hidden space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {users?.map((user, index) => (
                  <motion.div
                    key={user._id}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700/50"
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-lg font-bold text-warm-charcoal dark:text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-warm-charcoal dark:text-white">
                            {user.username}
                          </h3>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700/30 flex gap-2">
                      {currentUserRole === "admin" && user.role === "user" && (
                        <motion.button
                          onClick={() => openDeleteModal(user._id)}
                          className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-sm flex items-center justify-center"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </motion.button>
                      )}

                      {currentUserRole === "master" && user.role === "user" && (
                        <>
                          <motion.button
                            onClick={() => {
                              setSelectedUserId(user._id);
                              setSelectedRole(user.role);
                            }}
                            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium shadow-sm flex items-center justify-center"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit Role
                          </motion.button>
                          <motion.button
                            onClick={() => openDeleteModal(user._id)}
                            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-sm flex items-center justify-center"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </motion.button>
                        </>
                      )}

                      {currentUserRole === "master" &&
                        user.role === "admin" && (
                          <>
                            <motion.button
                              onClick={() => {
                                setSelectedUserId(user._id);
                                setSelectedRole(user.role);
                              }}
                              className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium shadow-sm flex items-center justify-center"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit Role
                            </motion.button>
                            <motion.button
                              onClick={() => openDeleteModal(user._id)}
                              className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-sm flex items-center justify-center"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </motion.button>
                          </>
                        )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {selectedUserId && (
        <Modal
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          title="Edit User Role"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="roleSelect"
                className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
              >
                Select Role
              </label>
              <select
                id="roleSelect"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-warm-charcoal dark:text-white focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300"
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 pt-3">
              <motion.button
                onClick={handleUpdateRole}
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
                onClick={() => setSelectedUserId(null)}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-warm-charcoal dark:text-white font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          title="Confirm Deletion"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-500"
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
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-warm-charcoal dark:text-white mb-2">
                Delete User
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <motion.button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-warm-charcoal dark:text-white font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-md"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Yes, Delete
              </motion.button>
            </div>
          </div>
        </Modal>
      )}
    </motion.section>
  );
}
