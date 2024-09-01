"use client";

import React, { useState } from "react";
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
import Link from "next/link";

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
    freeEntry: false, // Add freeEntry to the state
  });

  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term

  // New state for searchable dropdown
  const [invitedFromSearchTerm, setInvitedFromSearchTerm] =
    useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // State to control dropdown visibility

  const userRole = useAppSelector((state) => state.auth.user?.role);

  const handleDeleteGuest = async (id: string) => {
    if (confirm("Are you sure you want to delete this guest?")) {
      try {
        await deleteGuest(id).unwrap();
        alert("Guest deleted successfully!");
        refetch();
      } catch (error) {
        console.error("Failed to delete guest:", error);
        alert("Failed to delete guest.");
      }
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setEditData({
      name: guest.name,
      invitedFrom: guest.invitedFrom,
      isStudent: guest.isStudent,
      untilWhen: guest.untilWhen || null,
      isLady: guest.isLady,
      freeEntry: guest.freeEntry, // Initialize freeEntry state
    });
    setInvitedFromSearchTerm(guest.invitedFrom || ""); // Initialize search term with current invitedFrom value
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
      alert("Guest updated successfully!");
      refetch();
      setEditingGuest(null);
    } catch (error) {
      console.error("Failed to update guest:", error);
      alert("Failed to update guest.");
    }
  };


  const handleToggleStudentDiscount = async (active: boolean) => {
    try {
      await toggleStudentDiscount(active).unwrap();
      alert(
        `Student discount has been ${active ? "activated" : "deactivated"}.`
      );
      refetch();
    } catch (error) {
      console.error("Failed to toggle student discount:", error);
      alert("Failed to toggle student discount.");
    }
  };

  const handleToggleLadyDiscount = async (active: boolean) => {
    try {
      await toggleLadyDiscount(active).unwrap();
      alert(`Lady discount has been ${active ? "activated" : "deactivated"}.`);
      refetch();
    } catch (error) {
      console.error("Failed to toggle lady discount:", error);
      alert("Failed to toggle lady discount.");
    }
  };

  const handleUpdateStudentStatus = async (
    id: string,
    isStudent: boolean,
    untilWhen: Date | null
  ) => {
    try {
      await updateStudentStatus({ id, isStudent, untilWhen }).unwrap();
      alert("Student status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update student status:", error);
      alert("Failed to update student status.");
    }
  };

  const handleUpdateLadyStatus = async (id: string, isLady: boolean) => {
    try {
      await updateLadyStatus({ id, isLady }).unwrap();
      alert("Lady status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update lady status:", error);
      alert("Failed to update lady status.");
    }
  };

  const handleUpdateAttendedStatus = async (id: string, attended: string) => {
    try {
      await updateAttendedStatus({ id, attended }).unwrap();
      alert("Attended status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update attended status:", error);
      alert("Failed to update attended status.");
    }
  };

  // Filter guests based on search term (case-insensitive)
  const filteredGuests = guestsData?.guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter guests based on the invitedFrom search term (case-insensitive)
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
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
          className="text-black w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Display Statistics */}
      {guestsData?.statistics && (
        <div className="mb-6 text-center">
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
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => handleToggleStudentDiscount(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
          >
            Activate Student Discount
          </button>
          <button
            onClick={() => handleToggleStudentDiscount(false)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
          >
            Deactivate Student Discount
          </button>
          <button
            onClick={() => handleToggleLadyDiscount(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
          >
            Activate Lady Discount
          </button>
          <button
            onClick={() => handleToggleLadyDiscount(false)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
          >
            Deactivate Lady Discount
          </button>
        </div>
      )}

      {filteredGuests?.length === 0 ? (
        <p>No guests found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuests?.map((guest) => (
            <div
              key={guest._id}
              className="bg-white p-6 rounded-lg shadow-lg space-y-4"
            >
              <div>
                {/* Wrap guest name with Link */}
                <Link href={`/guests/${guest._id}`}>
                  <h2 className="text-black text-xl font-semibold text-center cursor-pointer">
                    {guest.name}
                  </h2>
                </Link>
                <p className="text-black text-center">
                  Attended: {guest.attended}
                </p>
                <p className="text-black text-center">
                  Invited From: {guest.invitedFrom || "N/A"}
                </p>
                <p className="text-black text-center">
                  Drinks Coupon: {guest.drinksCoupon}
                </p>
                <p className="text-black text-center">
                  Already Paid: {guest.alreadyPaid ? "Yes" : "No"}
                </p>
                <p className="text-black text-center">
                  Free Entry: {guest.freeEntry ? "Yes" : "No"}
                </p>
                <p className="text-black text-center">
                  Is Student: {guest.isStudent ? "Yes" : "No"}
                </p>
                <p className="text-black text-center">
                  Is Lady: {guest.isLady ? "Yes" : "No"}
                </p>
                {guest.isStudent && guest.untilWhen && (
                  <p className="text-black text-center">
                    Until When: {new Date(guest.untilWhen).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-between">
                {/* Admin or master can edit and delete, and also update attended status */}
                {(userRole === "admin" || userRole === "master") && (
                  <>
                    <button
                      onClick={() => handleEditGuest(guest)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGuest(guest._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
                      disabled={guest.name === "Master"}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateAttendedStatus(
                          guest._id,
                          guest.attended === "Still Not" ? "Yes" : "Still Not"
                        )
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                    >
                      Toggle Attended
                    </button>
                  </>
                )}

                {/* User role can only update attended status */}
                {userRole === "user" && (
                  <button
                    onClick={() =>
                      handleUpdateAttendedStatus(
                        guest._id,
                        guest.attended === "Still Not" ? "Yes" : "Still Not"
                      )
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                  >
                    Toggle Attended
                  </button>
                )}
              </div>

              {editingGuest?._id === guest._id && (
                <div className="mt-4 space-y-4">
                  {/* Searchable Dropdown for Invited From */}
                  <div className="relative text-black">
                    <input
                      type="text"
                      placeholder="Name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="text-black w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Search Invited From"
                      value={invitedFromSearchTerm}
                      onChange={(e) => {
                        setInvitedFromSearchTerm(e.target.value);
                        setShowDropdown(e.target.value !== ""); // Show dropdown only if there is text in the input
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
                              setInvitedFromSearchTerm(g.name); // Update search term to the selected guest
                              setShowDropdown(false); // Hide dropdown after selection
                            }}
                          >
                            {g.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-black flex justify-between items-center">
                    <label htmlFor="isStudent" className="mr-2">
                      Is Student:
                    </label>
                    <input
                      type="checkbox"
                      id="isStudent"
                      checked={editData.isStudent}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          isStudent: e.target.checked,
                        })
                      }
                      className="border p-2 rounded"
                    />
                    {/* Button to update student status */}
                    <button
                      onClick={() =>
                        handleUpdateStudentStatus(
                          guest._id,
                          !guest.isStudent,
                          guest.untilWhen
                        )
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                    >
                      Update Student Status
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
                      className="text-black border p-2 rounded w-full"
                    />
                  )}

                  <div className="text-black flex justify-between items-center">
                    <label htmlFor="isLady" className="mr-2">
                      Is Lady:
                    </label>
                    <input
                      type="checkbox"
                      id="isLady"
                      checked={editData.isLady}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          isLady: e.target.checked,
                        })
                      }
                      className="border p-2 rounded"
                    />
                    {/* Button to update lady status */}
                    <button
                      onClick={() =>
                        handleUpdateLadyStatus(guest._id, !guest.isLady)
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                    >
                      Update Lady Status
                    </button>
                  </div>

                  {/* Checkbox to toggle Free Entry status */}
                  <div className="text-black flex justify-between items-center">
                    <label htmlFor="freeEntry" className="mr-2">
                      Free Entry:
                    </label>
                    <input
                      type="checkbox"
                      id="freeEntry"
                      checked={editData.freeEntry}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          freeEntry: e.target.checked,
                        })
                      }
                      className="border p-2 rounded"
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handleUpdateGuest}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full sm:w-auto"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingGuest(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300 w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
