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
import { Guest, UpdateGuestDto } from "@/types/types";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "@/app/components/Common/Spinner";

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

  const userRole = useAppSelector((state) => state.auth.user?.role);

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

  if (isGuestLoading || isGuestsLoading) return <Spinner lg />;
  if (isGuestError || isGuestsError || !guest)
    return <div>Error loading guest details or guest not found.</div>;

  const handleDeleteGuest = async (id: string) => {
    if (confirm("Are you sure you want to delete this guest?")) {
      try {
        await deleteGuest(id).unwrap();
        alert("Guest deleted successfully!");
        router.push("/guests");
        refetch();
      } catch (error) {
        console.error("Failed to delete guest:", error);
        alert("Failed to delete guest.");
      }
    }
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest) return;
    const updatedFields: Partial<UpdateGuestDto> = {};

    if (editData.name !== editingGuest.name) {
      updatedFields.name = editData.name;
    }
    if (editData.invitedFrom !== editingGuest.invitedFrom) {
      updatedFields.invitedFrom = editData.invitedFrom;
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

    // Only proceed if there are changes to update
    if (Object.keys(updatedFields).length === 0) {
      alert("No changes to update.");
      return;
    }

    try {
      await updateGuest({ id: editingGuest._id, data: updatedFields }).unwrap();
      alert("Guest updated successfully!");
      refetch(); // Refetch to update the data after mutation
      setEditingGuest(null);
    } catch (error) {
      console.error("Failed to update guest:", error);
      alert("Failed to update guest.");
    }
  };

  const handleUpdateStudentStatus = async () => {
    if (!editingGuest) return;
    try {
      await updateStudentStatus({
        id: editingGuest._id,
        isStudent: editData.isStudent ?? false, // Ensure this is boolean
        untilWhen: editData.isStudent ? editData.untilWhen ?? null : null, // Ensure this is Date or null
      }).unwrap();
      alert("Student status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update student status:", error);
      alert("Failed to update student status.");
    }
  };

  const handleUpdateLadyStatus = async () => {
    if (!editingGuest) return;
    try {
      await updateLadyStatus({
        id: editingGuest._id,
        isLady: editData.isLady ?? false, // Ensure this is boolean
      }).unwrap();
      alert("Lady status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update lady status:", error);
      alert("Failed to update lady status.");
    }
  };

  const handleUpdateAttendedStatus = async () => {
    if (!editingGuest) return;
    const newStatus =
      editingGuest.attended === "Still Not" ? "Yes" : "Still Not";
    try {
      await updateAttendedStatus({
        id: editingGuest._id,
        attended: newStatus,
      }).unwrap();
      alert("Attended status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update attended status:", error);
      alert("Failed to update attended status.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">{guest.name}&apos;s Details</h1>
      <div className="bg-white text-black p-6 rounded-lg shadow-lg space-y-4">
        <p>
          <strong>Attended:</strong> {guest.attended}
        </p>
        <p>
          <strong>Invited From:</strong> {guest.invitedFrom || "N/A"}
        </p>
        <p>
          <strong>Drinks Coupon:</strong> {guest.drinksCoupon}
        </p>
        <p>
          <strong>Already Paid:</strong> {guest.alreadyPaid ? "Yes" : "No"}
        </p>
        <p>
          <strong>Free Entry:</strong> {guest.freeEntry ? "Yes" : "No"}
        </p>
        <p>
          <strong>Is Student:</strong> {guest.isStudent ? "Yes" : "No"}
        </p>
        <p>
          <strong>Is Lady:</strong> {guest.isLady ? "Yes" : "No"}
        </p>
        {guest.isStudent && guest.untilWhen && (
          <p>
            <strong>Until When:</strong>{" "}
            {new Date(guest.untilWhen).toLocaleDateString()}
          </p>
        )}

        {/* Admin or Master Actions */}
        {(userRole === "admin" || userRole === "master") && (
          <>
            {/* Discount Toggles (Admin or Master) */}

            {/* Editing Form */}
            <div className="mt-4 space-y-4">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              {/* Invited From Dropdown */}
              <div>
                <label
                  htmlFor="invitedFrom"
                  className="block text-sm font-medium text-gray-700"
                >
                  Invited From
                </label>
                <select
                  id="invitedFrom"
                  value={editData.invitedFrom}
                  onChange={(e) =>
                    setEditData({ ...editData, invitedFrom: e.target.value })
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-black"
                >
                  <option value="">Select Invited From</option>
                  {guestsData?.guests.map((g) => (
                    <option key={g._id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Is Student Toggle and Until When */}
              <div className="flex items-center">
                <label htmlFor="isStudent" className="mr-2">
                  Is Student
                </label>
                <input
                  type="checkbox"
                  id="isStudent"
                  checked={editData.isStudent ?? false}
                  onChange={(e) =>
                    setEditData({ ...editData, isStudent: e.target.checked })
                  }
                  className="border p-2 rounded"
                />
              </div>

              {editData.isStudent && (
                <div>
                  <label
                    htmlFor="untilWhen"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Until When
                  </label>
                  <input
                    type="date"
                    id="untilWhen"
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
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-black"
                  />
                </div>
              )}

              {/* Is Lady Toggle */}
              <div className="flex items-center">
                <label htmlFor="isLady" className="mr-2">
                  Is Lady
                </label>
                <input
                  type="checkbox"
                  id="isLady"
                  checked={editData.isLady ?? false}
                  onChange={(e) =>
                    setEditData({ ...editData, isLady: e.target.checked })
                  }
                  className="border p-2 rounded"
                />
              </div>

              {/* Free Entry Toggle */}
              <div className="flex items-center">
                <label htmlFor="freeEntry" className="mr-2">
                  Free Entry
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

              {/* Update Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={handleUpdateGuest}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full sm:w-auto"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => handleDeleteGuest(guest._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
                >
                  Delete Guest
                </button>
                <button
                  onClick={handleUpdateStudentStatus}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                >
                  Update Student Status
                </button>
                <button
                  onClick={handleUpdateLadyStatus}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                >
                  Update Lady Status
                </button>
              </div>
            </div>
          </>
        )}

        {/* User-specific Controls */}
        {(userRole === "user" ||
          userRole === "admin" ||
          userRole === "master") && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleUpdateAttendedStatus}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
            >
              Toggle Attended Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
