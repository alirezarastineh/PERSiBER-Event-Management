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

  if (isGuestLoading || isGuestsLoading) return <Spinner lg />;
  if (isGuestError || isGuestsError || !guest) {
    return <div>Error loading guest details or guest not found.</div>;
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
    <div className="p-6 transition-colors ease-in-out duration-300">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {guest.name}&apos;s Details
      </h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4 text-black dark:text-white">
        {/* Toggle switch for Attended status */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {guest.name}
          </h2>
          <button
            onClick={handleToggleAttendedStatus}
            className={`relative inline-flex items-center h-6 rounded-full w-11 ${
              attendedStatus ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                attendedStatus ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Other fields */}
        <p>
          <strong>Drinks Coupon:</strong> {guest.drinksCoupon}
        </p>
        <p>
          <strong>Already Paid:</strong> {guest.alreadyPaid ? "Yes" : "No"}
        </p>
        <p>
          <strong>Free Entry:</strong> {guest.freeEntry ? "Yes" : "No"}
        </p>

        {/* Only display the following fields for admin or master */}
        {(userRole === "admin" || userRole === "master") && (
          <>
            <p>
              <strong>Inviter:</strong> {guest.invitedFrom || "N/A"}
            </p>
            <p>
              <strong>Student:</strong> {guest.isStudent ? "Yes" : "No"}
            </p>
            <p>
              <strong>Lady:</strong> {guest.isLady ? "Yes" : "No"}
            </p>
            {guest.isStudent && guest.untilWhen && (
              <p>
                <strong>Until When:</strong>{" "}
                {new Date(guest.untilWhen).toLocaleDateString()}
              </p>
            )}
          </>
        )}

        {/* Admin or Master Actions */}
        {(userRole === "admin" || userRole === "master") && (
          <>
            {/* Editing Form */}
            <div className="mt-4 space-y-4">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white bg-gray-50 dark:bg-gray-700"
                />
              </div>

              {/* Invited From Searchable Input */}
              <div className="relative text-black">
                <label
                  htmlFor="invitedFrom"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Inviter
                </label>
                <input
                  type="text"
                  id="invitedFrom"
                  placeholder="Search Inviter"
                  value={invitedFromSearchTerm}
                  onChange={(e) => {
                    setInvitedFromSearchTerm(e.target.value);
                    setShowDropdown(e.target.value !== ""); // Show dropdown if search term is not empty
                  }}
                  className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white bg-gray-50 dark:bg-gray-700"
                />
                {showDropdown && (
                  <div className="absolute z-10 bg-white w-full border rounded-sm mt-1 max-h-40 overflow-y-auto">
                    {guestsData?.guests
                      .filter((g) =>
                        g.name
                          .toLowerCase()
                          .includes(invitedFromSearchTerm.toLowerCase())
                      )
                      .map((g) => (
                        <button
                          key={g._id}
                          className="cursor-pointer p-2 hover:bg-gray-200 text-left w-full"
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

              {/* Switch Toggles */}
              <div className="flex flex-wrap gap-4">
                {/* Is Student Toggle */}
                <div className="flex items-center gap-2 justify-between w-full">
                  <label
                    htmlFor="isStudent"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Student:
                  </label>
                  <button
                    onClick={async () => {
                      if (!editingGuest?._id) return; // Ensure _id is defined using optional chaining
                      const newStudentStatus = !editData.isStudent;
                      setEditData({ ...editData, isStudent: newStudentStatus });
                      try {
                        await updateStudentStatus({
                          id: editingGuest._id, // `_id` is guaranteed to be a string here
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
                    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                      editData.isStudent ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        editData.isStudent ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {editData.isStudent && (
                  <input
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
                    className="text-black border p-2 rounded-sm w-full"
                  />
                )}

                {/* Is Lady Toggle */}
                <div className="flex items-center gap-2 justify-between w-full">
                  <label
                    htmlFor="isLady"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Lady:
                  </label>
                  <button
                    onClick={async () => {
                      if (!editingGuest?._id) return; // Ensure editingGuest and _id are defined
                      const newLadyStatus = !editData.isLady;
                      setEditData({ ...editData, isLady: newLadyStatus });
                      try {
                        await updateLadyStatus({
                          id: editingGuest._id, // `_id` is guaranteed to be a string here
                          isLady: newLadyStatus,
                        }).unwrap();
                        refetch();
                      } catch (error) {
                        console.error("Failed to update lady status:", error);
                      }
                    }}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                      editData.isLady ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        editData.isLady ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Free Entry Toggle */}
                <div className="flex items-center gap-2 justify-between w-full">
                  <label
                    htmlFor="freeEntry"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Free Entry:
                  </label>
                  <button
                    onClick={async () => {
                      if (!editingGuest?._id) return; // Ensure editingGuest and _id are defined
                      const newFreeEntryStatus = !editData.freeEntry;
                      setEditData({
                        ...editData,
                        freeEntry: newFreeEntryStatus,
                      });
                      try {
                        await updateGuest({
                          id: editingGuest._id, // `_id` is guaranteed to be a string here
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
                    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                      editData.freeEntry ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        editData.freeEntry ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <button
                  onClick={handleUpdateGuest}
                  className="bg-green-500 text-white px-4 py-2 rounded-sm hover:bg-green-600 transition duration-300 w-full"
                >
                  Save
                </button>
                <button
                  onClick={openDeleteModal}
                  className="bg-red-500 text-white px-4 py-1 rounded-sm hover:bg-red-600 transition duration-300 w-full"
                  disabled={!guest || guest.name === "Master"} // Disable if guest is undefined or name is 'Master'
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <Modal
            isOpen={showDeleteModal}
            onClose={closeDeleteModal}
            title="Confirm Deletion"
          >
            <p className="text-white dark:text-gray-300 mb-6">
              Are you sure you want to delete this guest?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-sm hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGuest}
                className="bg-red-500 text-white px-4 py-2 rounded-sm hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </Modal>
        )}

        {/* Back to Guest List Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push("/guests")}
            className="bg-gray-600 hover:bg-gray-300 text-white px-4 py-2 rounded-sm transition-all duration-300 ease-in-out"
          >
            Back to Guest List
          </button>
        </div>
      </div>

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
    </div>
  );
}
