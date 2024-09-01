"use client";

import React, { useState, useEffect } from "react";
import {
  useGetAllGuestsQuery,
  useDeleteGuestMutation,
  useUpdateGuestMutation,
  useUpdateStudentStatusMutation,
  useUpdateLadyStatusMutation,
  useToggleStudentDiscountMutation,
  useToggleLadyDiscountMutation,
  useUpdateAttendedStatusMutation,
} from "@/redux/features/guests/guestsApiSlice";
import { Guest, UpdateGuestDto } from "@/types/types";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "./Common/Spinner";

export default function Guests() {
  const {
    data: guestsData,
    isLoading,
    isError,
    refetch,
  } = useGetAllGuestsQuery();
  const [deleteGuest] = useDeleteGuestMutation();
  const [updateGuest] = useUpdateGuestMutation();
  const [updateStudentStatus] = useUpdateStudentStatusMutation();
  const [updateLadyStatus] = useUpdateLadyStatusMutation();
  const [toggleStudentDiscount] = useToggleStudentDiscountMutation();
  const [toggleLadyDiscount] = useToggleLadyDiscountMutation();
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

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [invitedFromSearchTerm, setInvitedFromSearchTerm] =
    useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // State for discount toggles
  const [isStudentDiscountActive, setIsStudentDiscountActive] =
    useState<boolean>(false);
  const [isLadyDiscountActive, setIsLadyDiscountActive] =
    useState<boolean>(false);

  const [discountStatuses, setDiscountStatuses] = useState<{
    studentDiscountActive: boolean;
    ladyDiscountActive: boolean;
  }>({
    studentDiscountActive: false,
    ladyDiscountActive: false,
  });

  const [attendedStatuses, setAttendedStatuses] = useState<{
    [key: string]: boolean;
  }>({});

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [guestIdToDelete, setGuestIdToDelete] = useState<string | null>(null);

  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Effect to update discount states from backend data
  useEffect(() => {
    if (guestsData?.statistics) {
      setIsStudentDiscountActive(guestsData.statistics.studentDiscountActive);
      setIsLadyDiscountActive(guestsData.statistics.ladyDiscountActive);
    }
  }, [guestsData]);

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

  const handleDeleteGuest = async () => {
    if (guestIdToDelete) {
      try {
        await deleteGuest(guestIdToDelete).unwrap();
        refetch();
        setShowDeleteModal(false); // Close modal on successful delete
        setGuestIdToDelete(null); // Clear guestIdToDelete state
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
      alert("No changes to update.");
      return;
    }

    try {
      await updateGuest({ id: editingGuest._id, data: updatedFields }).unwrap();
      refetch();
      setEditingGuest(null);
    } catch (error) {
      console.error("Failed to update guest:", error);
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

  const filteredInvitedFromGuests = guestsData?.guests.filter((guest) =>
    guest.name.toLowerCase().includes(invitedFromSearchTerm.toLowerCase())
  );

  if (isLoading) {
    return <Spinner lg />;
  }

  if (isError) {
    return <div>Error loading guests.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Guest Management</h1>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-black w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Display Statistics */}
      {guestsData?.statistics && (
        <div className="mb-6 text-center space-y-2">
          <p className="text-lg font-semibold">
            Total Guests: {guestsData.statistics.totalCount}
          </p>
          <p className="text-lg font-semibold">
            Attended Guests: {guestsData.statistics.attendedCount}
          </p>
          {(userRole === "admin" || userRole === "master") && (
            <>
              <p className="text-lg font-semibold">
                Students Count: {guestsData.statistics.studentsCount || 0}
              </p>
              <p className="text-lg font-semibold">
                Ladies Count: {guestsData.statistics.ladiesCount || 0}
              </p>
              <p className="text-lg font-semibold">
                Drinks Coupons Count:{" "}
                {guestsData.statistics.drinksCouponsCount || 0}
              </p>
              <p className="text-lg font-semibold">
                Free Entry Count: {guestsData.statistics.freeEntryCount || 0}
              </p>
            </>
          )}
        </div>
      )}

      {/* Discount Toggles */}
      {(userRole === "admin" || userRole === "master") && (
        <div className="flex justify-center gap-6 mb-6">
          {/* Student Discount Toggle */}
          <div className="flex items-center">
            <span className="text-lg font-semibold mr-2">
              Student Discount:
            </span>
            <button
              onClick={handleToggleStudentDiscount}
              className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                discountStatuses.studentDiscountActive
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  discountStatuses.studentDiscountActive
                    ? "translate-x-5"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Lady Discount Toggle */}
          <div className="flex items-center">
            <span className="text-lg font-semibold mr-2">Lady Discount:</span>
            <button
              onClick={handleToggleLadyDiscount}
              className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                discountStatuses.ladyDiscountActive
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  discountStatuses.ladyDiscountActive
                    ? "translate-x-5"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {filteredGuests?.length === 0 ? (
        <p>No guests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuests?.map((guest) => (
            <div
              key={guest._id}
              className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between"
            >
              <div className="text-center space-y-2">
                <h2 className="text-black text-xl font-semibold">
                  {guest.name}
                </h2>
                <p className="text-gray-600">Attended: {guest.attended}</p>
                <p className="text-gray-600">
                  Invited From: {guest.invitedFrom || "N/A"}
                </p>
                <p className="text-gray-600">
                  Drinks Coupon: {guest.drinksCoupon}
                </p>
                <p className="text-gray-600">
                  Already Paid: {guest.alreadyPaid ? "Yes" : "No"}
                </p>
                <p className="text-gray-600">
                  Free Entry: {guest.freeEntry ? "Yes" : "No"}
                </p>
                <p className="text-gray-600">
                  Is Student: {guest.isStudent ? "Yes" : "No"}
                </p>
                <p className="text-gray-600">
                  Is Lady: {guest.isLady ? "Yes" : "No"}
                </p>
                {guest.isStudent && guest.untilWhen && (
                  <p className="text-gray-600">
                    Until When: {new Date(guest.untilWhen).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Action Buttons and Toggles */}
              <div className="mt-4 space-y-3">
                {(userRole === "admin" || userRole === "master") && (
                  <>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditGuest(guest)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 flex-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(guest._id)} // Open modal instead of confirm
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 flex-1"
                        disabled={guest.name === "Master"}
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {/* Attended Toggle */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">
                          Attended
                        </span>
                        <label
                          htmlFor={`attended-toggle-${guest._id}`}
                          className="relative inline-flex items-center cursor-pointer"
                        >
                          <input
                            id={`attended-toggle-${guest._id}`}
                            type="checkbox"
                            checked={!!attendedStatuses[guest._id]} // Ensure boolean
                            onChange={() =>
                              handleToggleAttendedStatus(guest._id)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>
                          <span
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                              attendedStatuses[guest._id]
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {userRole === "user" && (
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`attended-toggle-${guest._id}`}
                      className="relative inline-flex items-center cursor-pointer"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Attended
                      </span>
                      <input
                        id={`attended-toggle-${guest._id}`}
                        type="checkbox"
                        checked={!!attendedStatuses[guest._id]} // Ensure boolean
                        onChange={() => handleToggleAttendedStatus(guest._id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>
                      <span
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          attendedStatuses[guest._id]
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      ></span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg text-black font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this guest?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGuest}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edit Guest</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={editData.name ?? ""} // Ensure controlled input
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                className="text-black w-full p-2 border rounded"
              />
              <div className="relative text-black">
                <input
                  type="text"
                  placeholder="Search Invited From"
                  value={invitedFromSearchTerm || ""} // Ensure controlled input
                  onChange={(e) => {
                    setInvitedFromSearchTerm(e.target.value);
                    setShowDropdown(e.target.value !== "");
                  }}
                  className="text-black w-full p-2 border rounded"
                />
                {showDropdown && (
                  <div className="absolute z-10 bg-white w-full border rounded mt-1 max-h-40 overflow-y-auto">
                    {filteredInvitedFromGuests?.map((g) => (
                      <button
                        key={g._id}
                        className="cursor-pointer p-2 hover:bg-gray-200 text-left w-full"
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
              <div className="flex items-center gap-2">
                <label htmlFor="isStudent" className="text-black">
                  Is Student:
                </label>
                <input
                  type="checkbox"
                  id="isStudent"
                  checked={editData.isStudent || false} // Ensure controlled input
                  onChange={(e) =>
                    setEditData({ ...editData, isStudent: e.target.checked })
                  }
                  className="border p-2 rounded"
                />
              </div>
              {editData.isStudent && (
                <input
                  type="date"
                  value={
                    editData.untilWhen
                      ? new Date(editData.untilWhen).toISOString().split("T")[0]
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
                  className="text-black border p-2 rounded w-full"
                />
              )}
              <div className="flex items-center gap-2">
                <label htmlFor="isLady" className="text-black">
                  Is Lady:
                </label>
                <input
                  type="checkbox"
                  id="isLady"
                  checked={editData.isLady || false} // Ensure controlled input
                  onChange={(e) =>
                    setEditData({ ...editData, isLady: e.target.checked })
                  }
                  className="border p-2 rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="freeEntry" className="text-black">
                  Free Entry:
                </label>
                <input
                  type="checkbox"
                  id="freeEntry"
                  checked={editData.freeEntry || false} // Ensure controlled input
                  onChange={(e) =>
                    setEditData({ ...editData, freeEntry: e.target.checked })
                  }
                  className="border p-2 rounded"
                />
              </div>
              <div className="flex justify-between gap-2">
                <button
                  onClick={handleUpdateGuest}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingGuest(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300 w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
