"use client";

import React, { useState, useEffect } from "react";
import {
  useGetAllGuestsQuery,
  useDeleteGuestMutation,
  useUpdateGuestMutation,
  useToggleStudentDiscountMutation,
  useToggleLadyDiscountMutation,
  useUpdateAttendedStatusMutation,
  useCreateGuestMutation,
} from "@/redux/features/guests/guestsApiSlice";
import { AlertType, Guest, UpdateGuestDto } from "@/types/types";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "./Common/Spinner";
import Modal from "./Common/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function Guests() {
  const {
    data: guestsData,
    isLoading,
    isError,
    refetch,
  } = useGetAllGuestsQuery();
  const [deleteGuest] = useDeleteGuestMutation();
  const [updateGuest] = useUpdateGuestMutation();
  const [toggleStudentDiscount] = useToggleStudentDiscountMutation();
  const [toggleLadyDiscount] = useToggleLadyDiscountMutation();
  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();

  const [createGuest] = useCreateGuestMutation();
  const [newGuestName, setNewGuestName] = useState<string>("");

  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editData, setEditData] = useState<UpdateGuestDto>({
    name: "",
    invitedFrom: "",
    isStudent: false,
    untilWhen: null,
    isLady: false,
    freeEntry: false,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [invitedFromSearchTerm, setInvitedFromSearchTerm] =
    useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const [discountStatuses, setDiscountStatuses] = useState({
    studentDiscountActive: false,
    ladyDiscountActive: false,
  });

  const [attendedStatuses, setAttendedStatuses] = useState<{
    [key: string]: boolean;
  }>({});

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [guestIdToDelete, setGuestIdToDelete] = useState<string | null>(null);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showCustomAlert = (
    title: string,
    message: string,
    type: AlertType = "info"
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertModal(true);
  };

  const getAlertBackgroundColor = (type: AlertType) => {
    switch (type) {
      case "success":
        return "rgba(16, 185, 129, 0.2)";
      case "error":
        return "rgba(239, 68, 68, 0.2)";
      case "warning":
        return "rgba(245, 158, 11, 0.2)";
      case "info":
      default:
        return "rgba(59, 130, 246, 0.2)";
    }
  };

  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Existing useEffect hooks and handler functions remain unchanged
  useEffect(() => {
    if (guestsData?.statistics) {
      setDiscountStatuses({
        studentDiscountActive: guestsData.statistics.studentDiscountActive,
        ladyDiscountActive: guestsData.statistics.ladyDiscountActive,
      });
    }
  }, [guestsData]);

  useEffect(() => {
    if (guestsData?.guests) {
      const initialAttendedStatuses: { [key: string]: boolean } = {};
      guestsData.guests.forEach((guest) => {
        initialAttendedStatuses[guest._id] = guest.attended === "Yes";
      });
      setAttendedStatuses(initialAttendedStatuses);
    }
  }, [guestsData]);

  const handleAddGuest = async () => {
    if (!newGuestName.trim()) {
      showCustomAlert(
        "Input Required",
        "Please enter a guest's name.",
        "warning"
      );
      return;
    }

    try {
      await createGuest({ name: newGuestName }).unwrap();
      refetch();
      setNewGuestName("");
      showCustomAlert("Success", "Guest added successfully!", "success");
    } catch (error) {
      console.error("Failed to add guest:", error);
      showCustomAlert("Error", "Error adding guest.", "error");
    }
  };

  const handleDeleteGuest = async () => {
    if (guestIdToDelete) {
      try {
        await deleteGuest(guestIdToDelete).unwrap();
        refetch();
        setShowDeleteModal(false);
        setGuestIdToDelete(null);
      } catch (error) {
        console.error("Failed to delete guest:", error);
      }
    }
  };

  const openDeleteModal = (id: string) => {
    setGuestIdToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setGuestIdToDelete(null);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setEditData({
      name: guest.name || "",
      invitedFrom: guest.invitedFrom || "",
      isStudent: guest.isStudent,
      untilWhen: guest.untilWhen || null,
      isLady: guest.isLady,
      freeEntry: guest.freeEntry,
    });
    setInvitedFromSearchTerm(guest.invitedFrom || "");
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest) return;
    const updatedFields: Partial<UpdateGuestDto> = {};

    if (editData.name !== editingGuest.name) {
      updatedFields.name = editData.name;
    }
    if (editData.invitedFrom !== editingGuest.invitedFrom) {
      updatedFields.invitedFrom = editData.invitedFrom ?? "";
    }
    if (editData.isStudent !== editingGuest.isStudent) {
      updatedFields.isStudent = editData.isStudent;
    }
    if (editData.untilWhen !== editingGuest.untilWhen) {
      updatedFields.untilWhen = editData.untilWhen;
    }
    if (editData.isLady !== editingGuest.isLady) {
      updatedFields.isLady = editData.isLady;
    }
    if (editData.freeEntry !== editingGuest.freeEntry) {
      updatedFields.freeEntry = editData.freeEntry;
    }

    if (Object.keys(updatedFields).length === 0) {
      showCustomAlert("No Changes", "No changes to update.", "info");
      return;
    }

    try {
      await updateGuest({ id: editingGuest._id, data: updatedFields }).unwrap();
      refetch();
      setEditingGuest(null);
    } catch (error) {
      console.error("Failed to update guest:", error);
      showCustomAlert(
        "Update Failed",
        "Could not update guest information.",
        "error"
      );
    }
  };

  const handleToggleStudentDiscount = async () => {
    try {
      const newStudentStatus = !discountStatuses.studentDiscountActive;
      setDiscountStatuses((prevState) => ({
        ...prevState,
        studentDiscountActive: newStudentStatus,
      }));

      await toggleStudentDiscount(newStudentStatus).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to toggle student discount:", error);
      setDiscountStatuses((prevState) => ({
        ...prevState,
        studentDiscountActive: !prevState.studentDiscountActive,
      }));
    }
  };

  const handleToggleLadyDiscount = async () => {
    try {
      const newLadyStatus = !discountStatuses.ladyDiscountActive;
      setDiscountStatuses((prevState) => ({
        ...prevState,
        ladyDiscountActive: newLadyStatus,
      }));

      await toggleLadyDiscount(newLadyStatus).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to toggle lady discount:", error);
      setDiscountStatuses((prevState) => ({
        ...prevState,
        ladyDiscountActive: !prevState.ladyDiscountActive,
      }));
    }
  };

  const handleToggleAttendedStatus = async (guestId: string) => {
    try {
      const newStatus = !attendedStatuses[guestId];
      await updateAttendedStatus({
        id: guestId,
        attended: newStatus ? "Yes" : "Still Not",
      }).unwrap();
      setAttendedStatuses((prevState) => ({
        ...prevState,
        [guestId]: newStatus,
      }));
      refetch();
    } catch (error) {
      console.error("Failed to update attended status:", error);
    }
  };

  const filteredGuests = guestsData?.guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Stats Summary Cards - Top of Page */}
        {guestsData?.statistics && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Guests
                </span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <svg
                    className="w-4 h-4 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold text-rich-gold">
                {guestsData.statistics.totalCount}
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Attended
                </span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-400"
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
                {guestsData.statistics.attendedCount}
              </p>
            </motion.div>

            {(userRole === "admin" || userRole === "master") && (
              <>
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Students
                    </span>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                    {guestsData.statistics.studentsCount || 0}
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ladies
                    </span>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30">
                      <svg
                        className="w-4 h-4 text-pink-600 dark:text-pink-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-rich-gold">
                    {guestsData.statistics.ladiesCount || 0}
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* Control Panel Section */}
        <motion.section
          className="mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
            <div className="grid md:grid-cols-[1fr,auto] gap-6">
              {/* Search Input */}
              <div>
                <label
                  htmlFor="search-guests"
                  className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
                >
                  Search Guests
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
                    id="search-guests"
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
              </div>

              {/* Discount Toggles */}
              {(userRole === "admin" || userRole === "master") && (
                <div className="flex items-center space-x-6">
                  {/* Student Discount Toggle */}
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Student Discount
                    </span>
                    <motion.button
                      onClick={handleToggleStudentDiscount}
                      className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        discountStatuses.studentDiscountActive
                          ? "bg-gradient-to-r from-rich-gold to-accent-amber"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                        animate={{
                          translateX: discountStatuses.studentDiscountActive
                            ? 26
                            : 0,
                        }}
                      />
                    </motion.button>
                  </div>

                  {/* Lady Discount Toggle */}
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Lady Discount
                    </span>
                    <motion.button
                      onClick={handleToggleLadyDiscount}
                      className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        discountStatuses.ladyDiscountActive
                          ? "bg-gradient-to-r from-rich-gold to-accent-amber"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                        animate={{
                          translateX: discountStatuses.ladyDiscountActive
                            ? 26
                            : 0,
                        }}
                      />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Guest Section */}
            {(userRole === "admin" ||
              userRole === "master" ||
              userRole === "user") && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/30">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow">
                    <label
                      htmlFor="new-guest"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
                    >
                      Add New Guest
                    </label>
                    <motion.input
                      id="new-guest"
                      type="text"
                      placeholder="Enter guest's name"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
                      whileFocus={{ scale: 1.01 }}
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
              <div className="hidden md:block overflow-hidden bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50">
                <motion.table
                  className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
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
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Drinks Coupon
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Added By
                      </th>
                      {/* Only show the following fields for admin or master */}
                      {(userRole === "admin" || userRole === "master") && (
                        <>
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
                            Student
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Lady
                          </th>
                        </>
                      )}
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Free Entry
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {filteredGuests?.map((guest) => (
                        <motion.tr
                          key={guest._id}
                          variants={itemVariants}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {guest.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <motion.button
                              onClick={() =>
                                handleToggleAttendedStatus(guest._id)
                              }
                              className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                                attendedStatuses[guest._id]
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                              whileTap={{ scale: 0.95 }}
                            >
                              <motion.span
                                className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                                animate={{
                                  translateX: attendedStatuses[guest._id]
                                    ? 24
                                    : 0,
                                }}
                              />
                            </motion.button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {guest.drinksCoupon || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {guest.addedBy ?? "N/A"}
                          </td>

                          {/* Conditionally render additional fields based on userRole */}
                          {(userRole === "admin" || userRole === "master") && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {guest.invitedFrom || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    guest.isStudent
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {guest.isStudent ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    guest.isLady
                                      ? "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {guest.isLady ? "Yes" : "No"}
                                </span>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                guest.freeEntry
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {guest.freeEntry ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {(userRole === "admin" ||
                              userRole === "master") && (
                              <div className="flex justify-end space-x-2">
                                <motion.button
                                  onClick={() => handleEditGuest(guest)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium text-xs shadow-sm"
                                  whileHover={{
                                    scale: 1.05,
                                    boxShadow:
                                      "0 3px 10px rgba(212, 175, 55, 0.2)",
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  disabled={guest.name === "Master"}
                                >
                                  Edit
                                </motion.button>
                                <motion.button
                                  onClick={() => openDeleteModal(guest._id)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium text-xs shadow-sm"
                                  whileHover={{
                                    scale: 1.05,
                                    boxShadow:
                                      "0 3px 10px rgba(212, 175, 55, 0.1)",
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  disabled={guest.name === "Master"}
                                >
                                  Delete
                                </motion.button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </motion.table>
              </div>

              {/* Mobile Guest Cards */}
              <motion.div
                className="md:hidden space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredGuests?.map((guest) => (
                  <motion.div
                    key={guest._id}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700/50"
                    exit={{ opacity: 0, height: 0 }}
                    layout
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {guest.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Added by: {guest.addedBy ?? "N/A"}
                        </p>
                      </div>
                      <div>
                        <motion.button
                          onClick={() => handleToggleAttendedStatus(guest._id)}
                          className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            attendedStatuses[guest._id]
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                          whileTap={{ scale: 0.95 }}
                          aria-label={
                            attendedStatuses[guest._id]
                              ? "Mark as not attended"
                              : "Mark as attended"
                          }
                        >
                          <motion.span
                            className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                            animate={{
                              translateX: attendedStatuses[guest._id] ? 24 : 0,
                            }}
                          />
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Drinks Coupon
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {guest.drinksCoupon || 0}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Free Entry
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            guest.freeEntry
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {guest.freeEntry ? "Yes" : "No"}
                        </span>
                      </div>

                      {/* Conditionally render additional fields based on userRole */}
                      {(userRole === "admin" || userRole === "master") && (
                        <>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Inviter
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {guest.invitedFrom || "N/A"}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Student
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                guest.isStudent
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {guest.isStudent ? "Yes" : "No"}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Lady
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                guest.isLady
                                  ? "text-pink-600 dark:text-pink-400"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {guest.isLady ? "Yes" : "No"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {(userRole === "admin" || userRole === "master") && (
                      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/30">
                        <motion.button
                          onClick={() => handleEditGuest(guest)}
                          className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium text-sm shadow-sm flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={guest.name === "Master"}
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
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => openDeleteModal(guest._id)}
                          className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium text-sm shadow-sm flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={guest.name === "Master"}
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
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
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
                        {guestsData.statistics.studentsCount || 0}
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
                        {guestsData.statistics.ladiesCount || 0}
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
                        {guestsData.statistics.drinksCouponsCount || 0}
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
                        {guestsData.statistics.freeEntryCount || 0}
                      </p>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </div>
      <AnimatePresence>
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
                  Delete Guest
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this guest? This action cannot
                  be undone.
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
                  onClick={handleDeleteGuest}
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
            </div>
          </Modal>
        )}
      </AnimatePresence>
      {/* Edit Guest Modal */}
      <AnimatePresence>
        {editingGuest && (
          <Modal
            isOpen={!!editingGuest}
            onClose={() => setEditingGuest(null)}
            title="Edit Guest"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="guestName"
                  className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                >
                  Guest Name
                </label>
                <motion.input
                  id="guestName"
                  type="text"
                  placeholder="Name"
                  value={editData.name ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-warm-charcoal dark:text-white"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>

              <div className="space-y-2 relative">
                <label
                  htmlFor="inviterSearch"
                  className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                >
                  Inviter
                </label>
                <motion.input
                  id="inviterSearch"
                  type="text"
                  placeholder="Search Inviter"
                  value={invitedFromSearchTerm || ""}
                  onChange={(e) => {
                    setInvitedFromSearchTerm(e.target.value);
                    setShowDropdown(e.target.value !== "");
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-warm-charcoal dark:text-white"
                  whileFocus={{ scale: 1.01 }}
                />
                {showDropdown && (
                  <div className="absolute z-10 bg-white dark:bg-gray-800 w-full border border-gray-200 dark:border-gray-700 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {filteredGuests
                      ?.filter((g) =>
                        g.name
                          .toLowerCase()
                          .includes(invitedFromSearchTerm.toLowerCase())
                      )
                      .map((g) => (
                        <button
                          key={g._id}
                          className="cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left w-full text-warm-charcoal dark:text-white text-sm transition-colors duration-150"
                          onClick={() => {
                            setEditData({ ...editData, invitedFrom: g.name });
                            setInvitedFromSearchTerm(g.name);
                            setShowDropdown(false);
                          }}
                        >
                          {g.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Switch Toggle for Is Student */}
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
                          ? "bg-gradient-to-r from-rich-gold to-accent-amber"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                        animate={{
                          translateX: editData.isStudent ? 26 : 0,
                        }}
                      />
                    </motion.button>
                  </div>

                  {editData.isStudent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label
                        htmlFor="validUntil"
                        className="block text-sm font-medium text-warm-charcoal dark:text-gray-300 mb-1"
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
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-warm-charcoal dark:text-white"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Switch Toggle for Is Lady */}
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="isLady"
                    className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                  >
                    Lady
                  </label>
                  <motion.button
                    onClick={() =>
                      setEditData({ ...editData, isLady: !editData.isLady })
                    }
                    className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                      editData.isLady
                        ? "bg-gradient-to-r from-rich-gold to-accent-amber"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                      animate={{
                        translateX: editData.isLady ? 26 : 0,
                      }}
                    />
                  </motion.button>
                </div>

                {/* Switch Toggle for Free Entry */}
                <div className="flex items-center justify-between col-span-1 md:col-span-2">
                  <label
                    htmlFor="freeEntry"
                    className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                  >
                    Free Entry
                  </label>
                  <motion.button
                    onClick={() =>
                      setEditData({
                        ...editData,
                        freeEntry: !editData.freeEntry,
                      })
                    }
                    className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                      editData.freeEntry
                        ? "bg-gradient-to-r from-rich-gold to-accent-amber"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                      animate={{
                        translateX: editData.freeEntry ? 26 : 0,
                      }}
                    />
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <motion.button
                  onClick={handleUpdateGuest}
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
                  onClick={() => setEditingGuest(null)}
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
      </AnimatePresence>

      <AnimatePresence>
        {showAlertModal && (
          <Modal
            isOpen={showAlertModal}
            onClose={() => setShowAlertModal(false)}
            title={alertTitle}
          >
            <div className="space-y-6">
              <div
                className="flex items-center justify-center w-16 h-16 mx-auto rounded-full"
                style={{
                  backgroundColor: getAlertBackgroundColor(alertType),
                }}
              >
                {alertType === "success" && (
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {alertType === "error" && (
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                {alertType === "warning" && (
                  <svg
                    className="w-8 h-8 text-amber-600 dark:text-amber-400"
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
                )}
                {alertType === "info" && (
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
                )}
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-warm-charcoal dark:text-white mb-2">
                  {alertTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {alertMessage}
                </p>
              </div>

              <div className="flex gap-3 pt-3 justify-center">
                <motion.button
                  onClick={() => setShowAlertModal(false)}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md min-w-[120px]"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Okay
                </motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
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
