"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetGuestByIdQuery,
  useGetAllGuestsQuery,
  useDeleteGuestMutation,
  useUpdateGuestMutation,
  useUpdateStudentStatusMutation,
  useUpdateLadyStatusMutation,
  useUpdateAttendedStatusMutation,
  useAdjustDrinksCouponMutation,
} from "@/redux/features/guests/guestsApiSlice";
import { AlertType, Guest, UpdateGuestDto } from "@/types/types";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "@/app/components/Common/Spinner";
import Modal from "@/app/components/Common/Modal";
import { motion, AnimatePresence } from "framer-motion";

export default function GuestDetail() {
  const router = useRouter();
  const { id } = useParams(); // Get the guest ID from the route
  const {
    data: guest,
    isLoading: isGuestLoading,
    isError: isGuestError,
    refetch,
  } = useGetGuestByIdQuery(id as string, {
    skip: !id, // Ensures the query is only executed if `id` exists
  });

  const {
    data: guestsData,
    isLoading: isGuestsLoading,
    isError: isGuestsError,
  } = useGetAllGuestsQuery();

  const [deleteGuest] = useDeleteGuestMutation();
  const [updateGuest] = useUpdateGuestMutation();
  const [updateStudentStatus] = useUpdateStudentStatusMutation();
  const [updateLadyStatus] = useUpdateLadyStatusMutation();
  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();
  const [adjustDrinksCoupon] = useAdjustDrinksCouponMutation();
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [editData, setEditData] = useState<UpdateGuestDto>({
    name: "",
    invitedFrom: "",
    isStudent: false,
    untilWhen: null,
    isLady: false,
    freeEntry: false,
  });

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [guestIdToDelete, setGuestIdToDelete] = useState<string | null>(null);
  const [attendedStatus, setAttendedStatus] = useState<boolean>(
    guest?.attended === "Yes"
  );

  const [invitedFromSearchTerm, setInvitedFromSearchTerm] =
    useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const userRole = useAppSelector((state) => state.auth.user?.role);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // Add this function to show custom alerts
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

  // Initialize the edit data with the current guest details when data is loaded
  useEffect(() => {
    if (guest) {
      setEditingGuest(guest); // Set editingGuest to the current guest
      setEditData({
        name: guest.name,
        invitedFrom: guest.invitedFrom || "",
        isStudent: guest.isStudent ?? false, // Ensure this is boolean
        untilWhen: guest.untilWhen ?? null, // Ensure this is Date or null
        isLady: guest.isLady ?? false, // Ensure this is boolean
        freeEntry: guest.freeEntry ?? false, // Ensure this is boolean
      });
    }
  }, [guest]);

  useEffect(() => {
    if (guest) {
      setAttendedStatus(guest.attended === "Yes");
    }
  }, [guest]);

  const openDeleteModal = () => {
    if (guest) {
      setGuestIdToDelete(guest._id);
      setShowDeleteModal(true);
    } else {
      console.error("Guest is undefined");
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setGuestIdToDelete(null);
  };

  if (isGuestLoading || isGuestsLoading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-[70vh] bg-gradient-to-b from-soft-cream to-gray-100 dark:from-deep-navy dark:to-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Spinner xl />
      </motion.div>
    );
  }

  if (isGuestError || isGuestsError || !guest) {
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
          Error Loading Guest
        </h2>
        <p className="text-red-600 dark:text-red-300">
          We couldn&apos;t retrieve the guest data. Please try again later.
        </p>
      </motion.div>
    );
  }

  const handleDeleteGuest = async () => {
    if (guestIdToDelete) {
      try {
        await deleteGuest(guestIdToDelete).unwrap();
        router.push("/guests");
        refetch();
        closeDeleteModal();
      } catch (error) {
        console.error("Failed to delete guest:", error);
      }
    }
  };

  // Function to handle toggle attended status
  const handleToggleAttendedStatus = async () => {
    if (!editingGuest) return;
    const newStatus = attendedStatus ? "Still Not" : "Yes";
    try {
      await updateAttendedStatus({
        id: editingGuest._id,
        attended: newStatus,
      }).unwrap();
      setAttendedStatus(!attendedStatus);
      refetch();
    } catch (error) {
      console.error("Failed to update attended status:", error);
    }
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest) return;

    try {
      // Always send the current state of editData
      await updateGuest({ id: editingGuest._id, data: editData }).unwrap();
      refetch(); // Refetch to update the data after mutation
      setEditingGuest(null);
      showCustomAlert("Success", "Guest updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update guest:", error);
      showCustomAlert(
        "Update Failed",
        "Could not update guest information.",
        "error"
      );
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-soft-cream to-gray-100 dark:from-deep-navy dark:to-gray-900 transition-colors duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.header
          className="mb-12 text-center"
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
            {guest.name}
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-rich-gold to-accent-amber rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.header>

        {/* Guest Details Card */}
        <motion.section
          className="mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700/50">
            <div className="space-y-6">
              {/* Guest Status Section */}
              <div className="flex items-center justify-between">
                <motion.h2
                  className="text-xl font-bold text-warm-charcoal dark:text-white"
                  variants={slideUp}
                >
                  Attendance Status
                </motion.h2>
                <motion.button
                  onClick={handleToggleAttendedStatus}
                  className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                    attendedStatus
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  whileTap={{ scale: 0.95 }}
                  variants={slideUp}
                >
                  <motion.span
                    className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                    animate={{
                      translateX: attendedStatus ? 26 : 0,
                    }}
                  />
                </motion.button>
              </div>

              {/* Guest Information Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700/30"
                variants={slideUp}
              >
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drinks Coupon
                  </p>
                  {userRole === "admin" || userRole === "master" ? (
                    <div className="flex items-center mt-1 space-x-2">
                      <motion.input
                        type="number"
                        min="0"
                        value={guest.drinksCoupon || 0}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value, 10) || 0;
                          document.getElementById(
                            "drinksCouponValue"
                          )!.innerText = newValue.toString();
                        }}
                        className="w-full max-w-[120px] px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300 text-center"
                        whileFocus={{ scale: 1.01 }}
                      />
                      <motion.button
                        onClick={async () => {
                          try {
                            // Get the current input value
                            const inputEl = document.querySelector(
                              'input[type="number"]'
                            ) as HTMLInputElement;
                            const newValue = parseInt(inputEl.value, 10) || 0;
                            const originalValue = guest.drinksCoupon || 0;
                            const adjustment = newValue - originalValue;

                            if (adjustment !== 0) {
                              await adjustDrinksCoupon({
                                id: guest._id,
                                adjustment: adjustment,
                              }).unwrap();
                              refetch();
                              showCustomAlert(
                                "Success",
                                "Drink coupons updated successfully!",
                                "success"
                              );
                            }
                          } catch (error) {
                            console.error(
                              "Failed to update drinks coupon:",
                              error
                            );
                            showCustomAlert(
                              "Error",
                              "Failed to update drink coupons",
                              "error"
                            );
                          }
                        }}
                        className="whitespace-nowrap px-3 py-2 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Update
                      </motion.button>
                    </div>
                  ) : (
                    <p className="text-lg font-medium text-warm-charcoal dark:text-white">
                      <span id="drinksCouponValue">
                        {guest.drinksCoupon || 0}
                      </span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Already Paid
                  </p>
                  <p className="text-lg font-medium text-warm-charcoal dark:text-white">
                    {guest.alreadyPaid ? "Yes" : "No"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Free Entry
                  </p>
                  <p className="text-lg font-medium text-warm-charcoal dark:text-white">
                    {guest.freeEntry ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        Yes
                      </span>
                    ) : (
                      "No"
                    )}
                  </p>
                </div>

                {/* Only display the following fields for admin or master */}
                {(userRole === "admin" || userRole === "master") && (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Inviter
                      </p>
                      <p className="text-lg font-medium text-warm-charcoal dark:text-white">
                        {guest.invitedFrom || "N/A"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Student
                      </p>
                      <p className="text-lg font-medium text-warm-charcoal dark:text-white">
                        {guest.isStudent ? (
                          <span className="text-blue-600 dark:text-blue-400">
                            Yes
                          </span>
                        ) : (
                          "No"
                        )}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Lady
                      </p>
                      <p className="text-lg font-medium text-warm-charcoal dark:text-white">
                        {guest.isLady ? (
                          <span className="text-pink-600 dark:text-pink-400">
                            Yes
                          </span>
                        ) : (
                          "No"
                        )}
                      </p>
                    </div>

                    {guest.isStudent && guest.untilWhen && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Student Until
                        </p>
                        <p className="text-lg font-medium text-warm-charcoal dark:text-white">
                          {new Date(guest.untilWhen).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>

              {/* Admin or Master Actions */}
              {(userRole === "admin" || userRole === "master") && (
                <motion.div
                  className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700/30"
                  variants={slideUp}
                >
                  <h3 className="text-lg font-semibold mb-4 text-warm-charcoal dark:text-white">
                    Edit Guest Information
                  </h3>
                  <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >
                        Name
                      </label>
                      <motion.input
                        id="name"
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>

                    {/* Invited From Searchable Input */}
                    <div className="relative">
                      <label
                        htmlFor="invitedFrom"
                        className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                      >
                        Inviter
                      </label>
                      <motion.input
                        id="invitedFrom"
                        type="text"
                        placeholder="Search for inviter"
                        value={invitedFromSearchTerm}
                        onChange={(e) => {
                          setInvitedFromSearchTerm(e.target.value);
                          setShowDropdown(e.target.value !== "");
                        }}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
                        whileFocus={{ scale: 1.01 }}
                      />
                      {showDropdown && (
                        <div className="absolute z-10 bg-white dark:bg-gray-800 w-full border border-gray-200 dark:border-gray-700 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                          {guestsData?.guests
                            .filter((g) =>
                              g.name
                                .toLowerCase()
                                .includes(invitedFromSearchTerm.toLowerCase())
                            )
                            .map((g) => (
                              <button
                                key={g._id}
                                className="cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left w-full text-warm-charcoal dark:text-white text-sm transition-colors duration-150"
                                onClick={() => {
                                  setEditData({
                                    ...editData,
                                    invitedFrom: g.name,
                                  });
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

                    {/* Toggle Switches Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      {/* Is Student Toggle */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="isStudent"
                            className="text-sm font-medium text-gray-500 dark:text-gray-400"
                          >
                            Student
                          </label>
                          <motion.button
                            onClick={async () => {
                              if (!editingGuest?._id) return;
                              const newStudentStatus = !editData.isStudent;
                              setEditData({
                                ...editData,
                                isStudent: newStudentStatus,
                              });
                              try {
                                await updateStudentStatus({
                                  id: editingGuest._id,
                                  isStudent: newStudentStatus,
                                  untilWhen: newStudentStatus
                                    ? editData.untilWhen ?? null
                                    : null,
                                }).unwrap();
                                refetch();
                              } catch (error) {
                                console.error(
                                  "Failed to update student status:",
                                  error
                                );
                              }
                            }}
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
                              className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
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
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
                            />
                          </motion.div>
                        )}
                      </div>

                      {/* Is Lady Toggle */}
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="isLady"
                          className="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                          Lady
                        </label>
                        <motion.button
                          onClick={async () => {
                            if (!editingGuest?._id) return;
                            const newLadyStatus = !editData.isLady;
                            setEditData({ ...editData, isLady: newLadyStatus });
                            try {
                              await updateLadyStatus({
                                id: editingGuest._id,
                                isLady: newLadyStatus,
                              }).unwrap();
                              refetch();
                            } catch (error) {
                              console.error(
                                "Failed to update lady status:",
                                error
                              );
                            }
                          }}
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

                      {/* Free Entry Toggle */}
                      <div className="flex items-center justify-between col-span-1 md:col-span-2">
                        <label
                          htmlFor="freeEntry"
                          className="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                          Free Entry
                        </label>
                        <motion.button
                          onClick={async () => {
                            if (!editingGuest?._id) return;
                            const newFreeEntryStatus = !editData.freeEntry;
                            setEditData({
                              ...editData,
                              freeEntry: newFreeEntryStatus,
                            });
                            try {
                              await updateGuest({
                                id: editingGuest._id,
                                data: { freeEntry: newFreeEntryStatus },
                              }).unwrap();
                              refetch();
                            } catch (error) {
                              console.error(
                                "Failed to update free entry status:",
                                error
                              );
                            }
                          }}
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

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                      <motion.button
                        onClick={handleUpdateGuest}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Save Changes
                      </motion.button>

                      <motion.button
                        onClick={openDeleteModal}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-md"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 5px 15px rgba(212, 175, 55, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!guest || guest.name === "Master"}
                      >
                        Delete Guest
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Back Button */}
              <div className="flex justify-center mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/30">
                <motion.button
                  onClick={() => router.push("/guests")}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-medium shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to Guest List
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Delete Confirmation Modal */}
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

      {/* Alert Modal */}
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

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-[10%] w-64 h-64 bg-rich-gold/5 rounded-full blur-3xl transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-[10%] w-96 h-96 bg-accent-amber/5 rounded-full blur-3xl transform translate-y-1/2"></div>
        <div className="absolute top-1/3 right-[15%] w-48 h-48 bg-rich-gold/5 rounded-full blur-2xl"></div>
      </div>
    </motion.div>
  );
}
