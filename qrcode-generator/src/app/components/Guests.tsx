"use client";

import React, { useState, useEffect } from "react";
import {
  useGetAllGuestsQuery,
  useDeleteGuestMutation,
  useUpdateGuestMutation,
  useToggleStudentDiscountMutation,
  useToggleLadyDiscountMutation,
  useUpdateAttendedStatusMutation,
} from "@/redux/features/guests/guestsApiSlice";
import { Guest, UpdateGuestDto } from "@/types/types";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "./Common/Spinner";
import Modal from "./Common/Modal";

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

  const userRole = useAppSelector((state) => state.auth.user?.role);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center my-8">
        <Spinner xl />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center">Error loading guests.</div>
    );
  }

  return (
    <div className="p-6 transition-colors ease-in-out duration-300">
      <h1 className="text-3xl font-bold mb-6 text-center">Guest Management</h1>

      {(userRole === "admin" || userRole === "master") && (
        <div className="flex justify-between gap-6 mb-8">
          {/* Student Discount Toggle */}
          <div className="flex items-center">
            <span className="text-lg font-semibold mr-2">Student:</span>
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
            <span className="text-lg font-semibold mr-2">Lady:</span>
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

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-black w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-800 transition-shadow shadow-sm hover:shadow-md bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {filteredGuests?.length === 0 ? (
        <p className="text-center text-gray-700 dark:text-gray-300">
          No guests found.
        </p>
      ) : (
        <div className="space-y-4 md:space-y-0 md:overflow-x-auto border-2 border-gray-500 dark:border-gray-700 rounded-3xl transition-all ease-in-out duration-300">
          <table className="hidden md:table min-w-full bg-[#575756]/20 dark:bg-gray-800 text-left">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Name
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Attended
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Inviter
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Student
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Lady
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Free Entry
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests?.map((guest) => (
                <tr key={guest._id}>
                  <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                    {guest.name}
                  </td>
                  <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                    {/* Switch Toggle for Attended */}
                    <button
                      onClick={() => handleToggleAttendedStatus(guest._id)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                        attendedStatuses[guest._id]
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          attendedStatuses[guest._id]
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Conditionally render additional fields based on userRole */}
                  {(userRole === "admin" || userRole === "master") && (
                    <>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        {guest.invitedFrom || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        {guest.isStudent ? "Yes" : "No"}
                      </td>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        {guest.isLady ? "Yes" : "No"}
                      </td>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        {guest.freeEntry ? "Yes" : "No"}
                      </td>
                    </>
                  )}

                  {/* Show only 'Is Student' and 'Free Entry' for user role */}
                  {userRole === "user" && (
                    <>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        {guest.isStudent ? "Yes" : "No"}
                      </td>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        {guest.freeEntry ? "Yes" : "No"}
                      </td>
                    </>
                  )}

                  <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                    {(userRole === "admin" || userRole === "master") && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditGuest(guest)}
                          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(guest._id)}
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300"
                          disabled={guest.name === "Master"}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile View */}
          <div className="md:hidden">
            {filteredGuests?.map((guest) => (
              <div
                key={guest._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {guest.name}
                  </h2>
                  <button
                    onClick={() => handleToggleAttendedStatus(guest._id)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                      attendedStatuses[guest._id]
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        attendedStatuses[guest._id]
                          ? "translate-x-5"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Conditionally render additional fields based on userRole */}
                {(userRole === "admin" || userRole === "master") && (
                  <>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Inviter:</span>{" "}
                      {guest.invitedFrom || "N/A"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Student:</span>{" "}
                      {guest.isStudent ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Lady:</span>{" "}
                      {guest.isLady ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Free Entry:</span>{" "}
                      {guest.freeEntry ? "Yes" : "No"}
                    </p>
                  </>
                )}

                {/* Show only 'Is Student' and 'Free Entry' for user role */}
                {userRole === "user" && (
                  <>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Student:</span>{" "}
                      {guest.isStudent ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Free Entry:</span>{" "}
                      {guest.freeEntry ? "Yes" : "No"}
                    </p>
                  </>
                )}

                <div className="flex space-x-2 mt-4">
                  {(userRole === "admin" || userRole === "master") && (
                    <>
                      <button
                        onClick={() => handleEditGuest(guest)}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition duration-300 w-full"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(guest._id)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300 w-full"
                        disabled={guest.name === "Master"}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          title="Confirm Deletion"
        >
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
        </Modal>
      )}

      {/* Edit Modal */}
      {editingGuest && (
        <Modal
          isOpen={!!editingGuest}
          onClose={() => setEditingGuest(null)}
          title="Edit Guest"
        >
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={editData.name ?? ""}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="text-black w-full p-2 border rounded"
            />
            <div className="relative text-black">
              <input
                type="text"
                placeholder="Search Inviter"
                value={invitedFromSearchTerm || ""}
                onChange={(e) => {
                  setInvitedFromSearchTerm(e.target.value);
                  setShowDropdown(e.target.value !== "");
                }}
                className="text-black w-full p-2 border rounded"
              />
              {showDropdown && (
                <div className="absolute z-10 bg-white w-full border rounded mt-1 max-h-40 overflow-y-auto">
                  {filteredGuests
                    ?.filter((g) =>
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

            {/* Switch Toggle for Is Student */}
            <div className="flex items-center gap-2 justify-between">
              <label htmlFor="isStudent" className="">
                Student:
              </label>
              <button
                onClick={() =>
                  setEditData({ ...editData, isStudent: !editData.isStudent })
                }
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
                    ? new Date(editData.untilWhen).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const parsedDate = new Date(e.target.value);
                  setEditData({
                    ...editData,
                    untilWhen: isNaN(parsedDate.getTime()) ? null : parsedDate,
                  });
                }}
                className="text-black border p-2 rounded w-full"
              />
            )}

            {/* Switch Toggle for Is Lady */}
            <div className="flex items-center gap-2 justify-between">
              <label htmlFor="isLady" className="">
                Lady:
              </label>
              <button
                onClick={() =>
                  setEditData({ ...editData, isLady: !editData.isLady })
                }
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

            {/* Switch Toggle for Free Entry */}
            <div className="flex items-center gap-2 justify-between">
              <label htmlFor="freeEntry" className="">
                Free Entry:
              </label>
              <button
                onClick={() =>
                  setEditData({ ...editData, freeEntry: !editData.freeEntry })
                }
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
        </Modal>
      )}

      {guestsData?.statistics && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
            <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
              Total Guests
            </p>
            <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
              {guestsData.statistics.totalCount}
            </p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
            <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
              Attended Guests
            </p>
            <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
              {guestsData.statistics.attendedCount}
            </p>
          </div>
          {(userRole === "admin" || userRole === "master") && (
            <>
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
                <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
                  Students Count
                </p>
                <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
                  {guestsData.statistics.studentsCount || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
                <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
                  Ladies Count
                </p>
                <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
                  {guestsData.statistics.ladiesCount || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
                <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
                  Drinks Coupons Count
                </p>
                <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
                  {guestsData.statistics.drinksCouponsCount || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
                <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
                  Free Entry Count
                </p>
                <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
                  {guestsData.statistics.freeEntryCount || 0}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
