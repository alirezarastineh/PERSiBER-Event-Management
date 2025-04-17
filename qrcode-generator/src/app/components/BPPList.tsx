"use client";

import React, { useEffect, useState } from "react";
import {
  useGetAllBpplistQuery,
  useCreateBpplistItemMutation,
  useUpdateBpplistItemMutation,
  useUpdateAttendedStatusMutation,
  useUpdateHasLeftStatusMutation,
  useUpdateStudentStatusMutation,
  useDeleteBpplistItemMutation,
} from "@/redux/features/bpplist/bpplistApiSlice";
import { Bpplist, CreateBpplistDto, UpdateBpplistDto } from "@/types/types";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "./Common/Spinner";
import Modal from "./Common/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function BPPList() {
  const {
    data: bpplistData,
    isLoading,
    isError,
    refetch,
  } = useGetAllBpplistQuery();

  const [createBpplistItem] = useCreateBpplistItemMutation();
  const [updateBpplistItem] = useUpdateBpplistItemMutation();
  const [deleteBpplistItem] = useDeleteBpplistItemMutation();
  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();
  const [updateHasLeftStatus] = useUpdateHasLeftStatusMutation();
  const [updateStudentStatus] = useUpdateStudentStatusMutation();

  const [editingItem, setEditingItem] = useState<Bpplist | null>(null);
  const [editData, setEditData] = useState<UpdateBpplistDto>({
    name: "",
    attended: "No",
    organizer: "",
    invitedFrom: "",
    hasLeft: false,
    isStudent: false,
    untilWhen: null,
  });

  const [newItemData, setNewItemData] = useState<CreateBpplistDto>({
    name: "",
    attended: "No",
    organizer: "",
    invitedFrom: "",
    hasLeft: false,
    isStudent: false,
    untilWhen: null,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>("");

  const [toggleStatuses, setToggleStatuses] = useState<{
    [key: string]: { attended: boolean; hasLeft: boolean; isStudent: boolean };
  }>({});

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemIdToDelete, setItemIdToDelete] = useState<string | null>(null);

  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

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

  useEffect(() => {
    if (bpplistData?.bpplist) {
      const initialToggleStatuses: {
        [key: string]: {
          attended: boolean;
          hasLeft: boolean;
          isStudent: boolean;
        };
      } = {};
      bpplistData.bpplist.forEach((item) => {
        initialToggleStatuses[item._id] = {
          attended: item.attended === "Yes",
          hasLeft: item.hasLeft,
          isStudent: item.isStudent,
        };
      });
      setToggleStatuses(initialToggleStatuses);
    }
  }, [bpplistData]);

  const handleDeleteItem = async () => {
    if (itemIdToDelete) {
      try {
        await deleteBpplistItem(itemIdToDelete).unwrap();
        refetch();
        setShowDeleteModal(false);
        setItemIdToDelete(null);
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  const openDeleteModal = (id: string) => {
    setItemIdToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemIdToDelete(null);
  };

  const handleEditItem = (item: Bpplist) => {
    setEditingItem(item);
    setEditData({
      name: item.name || "",
      attended: item.attended || "No",
      organizer: item.organizer || "",
      invitedFrom: item.invitedFrom || "",
      hasLeft: item.hasLeft,
      isStudent: item.isStudent,
      untilWhen: item.untilWhen || null,
    });
    setSearchTerm(item.invitedFrom || "");
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      await updateBpplistItem({ id: editingItem._id, data: editData }).unwrap();
      refetch();
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleCreateItem = async () => {
    try {
      await createBpplistItem(newItemData).unwrap();
      refetch();
      setNewItemData({
        name: "",
        attended: "No",
        organizer: "",
        invitedFrom: "",
        hasLeft: false,
        isStudent: false,
        untilWhen: null,
      });
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const handleToggleAttendedStatus = async (id: string) => {
    try {
      const newAttendedStatus = !toggleStatuses[id].attended;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], attended: newAttendedStatus },
      }));

      await updateAttendedStatus({
        id,
        attended: newAttendedStatus ? "Yes" : "No",
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update attended status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], attended: !prevState[id].attended },
      }));
    }
  };

  const handleToggleHasLeftStatus = async (id: string) => {
    try {
      const newHasLeftStatus = !toggleStatuses[id].hasLeft;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], hasLeft: newHasLeftStatus },
      }));

      await updateHasLeftStatus({ id, hasLeft: newHasLeftStatus }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update has left status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], hasLeft: !prevState[id].hasLeft },
      }));
    }
  };

  const handleToggleStudentStatus = async (id: string) => {
    try {
      const newStudentStatus = !toggleStatuses[id].isStudent;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], isStudent: newStudentStatus },
      }));

      await updateStudentStatus({
        id,
        isStudent: newStudentStatus,
        untilWhen: newStudentStatus ? new Date() : null,
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update student status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], isStudent: !prevState[id].isStudent },
      }));
    }
  };

  const filteredItems = bpplistData?.bpplist.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const globallyFilteredItems = bpplistData?.bpplist.filter((item) =>
    item.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

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
          <motion.section
            className="mb-12"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className={`grid ${
                userRole === "admin" || userRole === "master"
                  ? "grid-cols-2 md:grid-cols-4"
                  : "grid-cols-1"
              } gap-4 mb-8`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Total Attendees card - Only visible to admin and master */}
              {(userRole === "admin" || userRole === "master") && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total BPP Attendees
                    </span>
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <svg
                        className="w-5 h-5 text-amber-600 dark:text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-rich-gold">
                    {bpplistData.statistics.totalCount}
                  </p>
                </motion.div>
              )}

              {/* Attended Members card - Visible to all users */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Attended BPP Members
                  </span>
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
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
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-rich-gold">
                  {bpplistData.statistics.attendedCount}
                </p>
              </motion.div>

              {/* Additional statistics cards - Only for admin/master */}
              {(userRole === "admin" || userRole === "master") && (
                <>
                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Students Count
                      </span>
                      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <svg
                          className="w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-rich-gold">
                      {bpplistData.statistics.studentsCount || 0}
                    </p>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Left BPP Count
                      </span>
                      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <svg
                          className="w-5 h-5 text-orange-600 dark:text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-rich-gold">
                      {bpplistData.statistics.hasLeftCount || 0}
                    </p>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.section>
        )}

        {/* Search & Control Panel Section */}
        <motion.section
          className="mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
            {/* Search Input */}
            <div className="mb-6">
              <label
                htmlFor="search-bpp"
                className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
              >
                Search BPP Attendees
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <motion.input
                  id="search-bpp"
                  type="text"
                  placeholder="Search by name..."
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </div>

            {/* Add New BPP Attendee Form - Only shown to admins/masters */}
            {(userRole === "admin" || userRole === "master") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50">
                  <h2 className="text-xl font-medium text-warm-charcoal dark:text-white mb-4">
                    Add New BPP Attendee
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="new-name"
                        className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                      >
                        Name
                      </label>
                      <motion.input
                        id="new-name"
                        type="text"
                        placeholder="Full name"
                        value={newItemData.name}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="new-organizer"
                        className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                      >
                        Organizer
                      </label>
                      <motion.select
                        id="new-organizer"
                        value={newItemData.organizer ?? ""}
                        onChange={(e) =>
                          setNewItemData({
                            ...newItemData,
                            organizer: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                        whileFocus={{ scale: 1.01 }}
                      >
                        <option value="">Select Organizer</option>
                        <option value="Kourosh">Kourosh</option>
                        <option value="Sobhan">Sobhan</option>
                        <option value="Mutual">Mutual</option>
                      </motion.select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <motion.button
                      onClick={handleCreateItem}
                      className="w-full px-6 py-3 bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium rounded-lg shadow-md flex items-center justify-center"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!newItemData.name}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
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
                      Add BPP Attendee
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Content Section - Table/List View */}
        {(globallyFilteredItems?.length ?? 0) === 0 ? (
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
              {globalSearchTerm
                ? `No results matching "${globalSearchTerm}". Try a different search term.`
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
            {/* Desktop View - Table */}
            <div className="hidden md:block">
              <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/50">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/80">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Attended
                        </th>
                        {(userRole === "admin" || userRole === "master") && (
                          <>
                            <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Organizer
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Inviter
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Left
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Student
                            </th>
                          </>
                        )}
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                      {(globallyFilteredItems || []).map((item, index) => (
                        <motion.tr
                          key={item._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden text-gray-700 dark:text-gray-300 font-medium">
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                  {item.name}
                                </div>
                                {item.isStudent && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                    Student
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.button
                              onClick={() =>
                                handleToggleAttendedStatus(item._id)
                              }
                              className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                                toggleStatuses[item._id]?.attended
                                  ? "bg-gradient-to-r from-green-500 to-green-600"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                              whileTap={{ scale: 0.95 }}
                            >
                              <motion.span
                                className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                                animate={{
                                  translateX: toggleStatuses[item._id]?.attended
                                    ? 24
                                    : 0,
                                }}
                              />
                            </motion.button>
                          </td>

                          {(userRole === "admin" || userRole === "master") && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {item.organizer || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {item.invitedFrom || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <motion.button
                                  onClick={() =>
                                    handleToggleHasLeftStatus(item._id)
                                  }
                                  className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                                    toggleStatuses[item._id]?.hasLeft
                                      ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  }`}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <motion.span
                                    className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                                    animate={{
                                      translateX: toggleStatuses[item._id]
                                        ?.hasLeft
                                        ? 24
                                        : 0,
                                    }}
                                  />
                                </motion.button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <motion.button
                                  onClick={() =>
                                    handleToggleStudentStatus(item._id)
                                  }
                                  className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                                    toggleStatuses[item._id]?.isStudent
                                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  }`}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <motion.span
                                    className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                                    animate={{
                                      translateX: toggleStatuses[item._id]
                                        ?.isStudent
                                        ? 24
                                        : 0,
                                    }}
                                  />
                                </motion.button>
                              </td>
                            </>
                          )}

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {(userRole === "admin" ||
                              userRole === "master") && (
                              <div className="flex justify-end space-x-2">
                                <motion.button
                                  onClick={() => handleEditItem(item)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium text-xs shadow-sm"
                                  whileHover={{
                                    scale: 1.05,
                                    boxShadow:
                                      "0 3px 10px rgba(212, 175, 55, 0.2)",
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  Edit
                                </motion.button>
                                <motion.button
                                  onClick={() => openDeleteModal(item._id)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium text-xs shadow-sm"
                                  whileHover={{
                                    scale: 1.05,
                                    boxShadow:
                                      "0 3px 10px rgba(212, 175, 55, 0.1)",
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  Delete
                                </motion.button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
              {(globallyFilteredItems || []).map((item, index) => (
                <motion.div
                  key={item._id}
                  className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  layout
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden text-gray-700 dark:text-gray-300 font-medium text-lg">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-medium text-gray-800 dark:text-gray-200 flex items-center">
                          {item.name}
                          {item.isStudent && (
                            <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                              Student
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                        Attended
                      </span>
                      <motion.button
                        onClick={() => handleToggleAttendedStatus(item._id)}
                        className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                          toggleStatuses[item._id]?.attended
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.span
                          className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                          animate={{
                            translateX: toggleStatuses[item._id]?.attended
                              ? 24
                              : 0,
                          }}
                        />
                      </motion.button>
                    </div>
                  </div>

                  {/* Additional Details - Only for admin/master */}
                  {(userRole === "admin" || userRole === "master") && (
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">
                          Organizer
                        </p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {item.organizer || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">
                          Inviter
                        </p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {item.invitedFrom || "N/A"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Left
                        </span>
                        <motion.button
                          onClick={() => handleToggleHasLeftStatus(item._id)}
                          className={`relative w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            toggleStatuses[item._id]?.hasLeft
                              ? "bg-gradient-to-r from-amber-500 to-amber-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.span
                            className="absolute bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300"
                            animate={{
                              translateX: toggleStatuses[item._id]?.hasLeft
                                ? 20
                                : 0,
                            }}
                          />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Student
                        </span>
                        <motion.button
                          onClick={() => handleToggleStudentStatus(item._id)}
                          className={`relative w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            toggleStatuses[item._id]?.isStudent
                              ? "bg-gradient-to-r from-blue-500 to-blue-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.span
                            className="absolute bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300"
                            animate={{
                              translateX: toggleStatuses[item._id]?.isStudent
                                ? 20
                                : 0,
                            }}
                          />
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Only for admin/master */}
                  {(userRole === "admin" || userRole === "master") && (
                    <div className="mt-4 flex space-x-3">
                      <motion.button
                        onClick={() => handleEditItem(item)}
                        className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium text-sm shadow-sm"
                        whileHover={{
                          scale: 1.03,
                          boxShadow: "0 3px 10px rgba(212, 175, 55, 0.2)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
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
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => openDeleteModal(item._id)}
                        className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium text-sm shadow-sm"
                        whileHover={{
                          scale: 1.03,
                          boxShadow: "0 3px 10px rgba(212, 175, 55, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
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
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Edit BPP Attendee Modal */}
        <AnimatePresence>
          {editingItem && (
            <Modal
              isOpen={!!editingItem}
              onClose={() => setEditingItem(null)}
              title="Edit BPP Attendee"
            >
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="attendeeName"
                    className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                  >
                    Attendee Name
                  </label>
                  <motion.input
                    id="attendeeName"
                    type="text"
                    placeholder="Name"
                    value={editData.name ?? ""}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="organizer"
                    className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                  >
                    Organizer
                  </label>
                  <motion.select
                    id="organizer"
                    value={editData.organizer ?? ""}
                    onChange={(e) =>
                      setEditData({ ...editData, organizer: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
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
                    className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                  >
                    Invited From
                  </label>
                  <motion.input
                    id="invitedFromSearch"
                    type="text"
                    placeholder="Search for attendee..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(e.target.value !== "");
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                    whileFocus={{ scale: 1.01 }}
                  />

                  {/* Dropdown suggestions using filteredItems */}
                  {showDropdown &&
                    filteredItems &&
                    filteredItems.length > 0 && (
                      <motion.div
                        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {filteredItems.map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm transition-colors duration-150"
                            onClick={() => {
                              setEditData({
                                ...editData,
                                invitedFrom: item.name,
                              });
                              setSearchTerm(item.name);
                              setShowDropdown(false);
                            }}
                          >
                            {item.name}
                          </button>
                        ))}
                      </motion.div>
                    )}

                  <input
                    type="hidden"
                    value={editData.invitedFrom ?? ""}
                    onChange={(e) =>
                      setEditData({ ...editData, invitedFrom: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Attended Status */}
                  <div className="space-y-2">
                    <label
                      htmlFor="attendedStatus"
                      className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                    >
                      Attended Status
                    </label>
                    <select
                      id="attendedStatus"
                      value={editData.attended ?? "No"}
                      onChange={(e) =>
                        setEditData({ ...editData, attended: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-warm-charcoal dark:text-white"
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
                        className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                      >
                        Has Left
                      </label>
                      <motion.button
                        onClick={() =>
                          setEditData({
                            ...editData,
                            hasLeft: !editData.hasLeft,
                          })
                        }
                        className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                          editData.hasLeft
                            ? "bg-gradient-to-r from-amber-500 to-amber-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        whileTap={{ scale: 0.95 }}
                        aria-label={
                          editData.hasLeft ? "Set as not left" : "Set as left"
                        }
                      >
                        <motion.span
                          className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                          animate={{
                            translateX: editData.hasLeft ? 26 : 0,
                          }}
                        />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Student Status and Date Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="isStudent"
                        className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                      >
                        Student
                      </label>
                      <motion.button
                        onClick={() =>
                          setEditData({
                            ...editData,
                            isStudent: !editData.isStudent,
                          })
                        }
                        className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                          editData.isStudent
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        whileTap={{ scale: 0.95 }}
                        aria-label={
                          editData.isStudent
                            ? "Set as not student"
                            : "Set as student"
                        }
                      >
                        <motion.span
                          className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                          animate={{
                            translateX: editData.isStudent ? 26 : 0,
                          }}
                        />
                      </motion.button>
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
                        className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                      >
                        Valid Until
                      </label>
                      <input
                        id="validUntil"
                        type="date"
                        value={
                          editData.untilWhen
                            ? new Date(editData.untilWhen)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const parsedDate = new Date(e.target.value);
                          setEditData({
                            ...editData,
                            untilWhen: isNaN(parsedDate.getTime())
                              ? null
                              : parsedDate,
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Edit Modal Buttons */}
                <div className="flex gap-4 pt-6">
                  <motion.button
                    onClick={handleUpdateItem}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Edit BPP Attendee Modal */}
        <AnimatePresence>
          {editingItem && (
            <Modal
              isOpen={!!editingItem}
              onClose={() => setEditingItem(null)}
              title="Edit BPP Attendee"
            >
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Form fields here */}

                {/* Student Status and Date Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="isStudent"
                        className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                      >
                        Student
                      </label>
                      <motion.button
                        onClick={() =>
                          setEditData({
                            ...editData,
                            isStudent: !editData.isStudent,
                          })
                        }
                        className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                          editData.isStudent
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        whileTap={{ scale: 0.95 }}
                        aria-label={
                          editData.isStudent
                            ? "Set as not student"
                            : "Set as student"
                        }
                      >
                        <motion.span
                          className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                          animate={{
                            translateX: editData.isStudent ? 26 : 0,
                          }}
                        />
                      </motion.button>
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
                        className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                      >
                        Valid Until
                      </label>
                      <input
                        id="validUntil"
                        type="date"
                        value={
                          editData.untilWhen
                            ? new Date(editData.untilWhen)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const parsedDate = new Date(e.target.value);
                          setEditData({
                            ...editData,
                            untilWhen: isNaN(parsedDate.getTime())
                              ? null
                              : parsedDate,
                          });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Edit Modal Buttons */}
                <div className="flex gap-4 pt-6">
                  <motion.button
                    onClick={() => setEditingItem(null)}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-warm-charcoal dark:text-white font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <Modal
              isOpen={showDeleteModal}
              onClose={closeDeleteModal}
              title="Confirm Deletion"
            >
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
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
                    Delete BPP Attendee
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete this attendee? This action
                    cannot be undone.
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
                    onClick={handleDeleteItem}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-md"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 5px 15px rgba(212, 175, 55, 0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Yes, Delete
                  </motion.button>
                </div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>

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
    </motion.div>
  );
}
