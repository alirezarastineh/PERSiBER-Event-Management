"use client";

import React, { useEffect, useState } from "react";
import {
  useGetAllMembersQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useUpdateAttendedStatusMutation,
  useUpdateHasLeftStatusMutation,
  useUpdateStudentStatusMutation,
  useDeleteMemberMutation,
} from "@/redux/features/members/membersApiSlice";
import { Member, CreateMemberDto, UpdateMemberDto } from "@/types/types";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "./Common/Spinner";
import Modal from "./Common/Modal";

export default function Members() {
  const {
    data: membersData,
    isLoading,
    isError,
    refetch,
  } = useGetAllMembersQuery();

  const [createMember] = useCreateMemberMutation();
  const [updateMember] = useUpdateMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();
  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();
  const [updateHasLeftStatus] = useUpdateHasLeftStatusMutation();
  const [updateStudentStatus] = useUpdateStudentStatusMutation();

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editData, setEditData] = useState<UpdateMemberDto>({
    name: "",
    attended: "No",
    organizer: "",
    invitedFrom: "",
    hasLeft: false,
    isStudent: false,
    untilWhen: null,
  });

  const [newMemberData, setNewMemberData] = useState<CreateMemberDto>({
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
  const [memberIdToDelete, setMemberIdToDelete] = useState<string | null>(null);

  const userRole = useAppSelector((state) => state.auth.user?.role);

  useEffect(() => {
    if (membersData?.members) {
      const initialToggleStatuses: {
        [key: string]: {
          attended: boolean;
          hasLeft: boolean;
          isStudent: boolean;
        };
      } = {};
      membersData.members.forEach((member) => {
        initialToggleStatuses[member._id] = {
          attended: member.attended === "Yes",
          hasLeft: member.hasLeft,
          isStudent: member.isStudent,
        };
      });
      setToggleStatuses(initialToggleStatuses);
    }
  }, [membersData]);

  const handleDeleteMember = async () => {
    if (memberIdToDelete) {
      try {
        await deleteMember(memberIdToDelete).unwrap();
        refetch();
        setShowDeleteModal(false);
        setMemberIdToDelete(null);
      } catch (error) {
        console.error("Failed to delete member:", error);
      }
    }
  };

  const openDeleteModal = (id: string) => {
    setMemberIdToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMemberIdToDelete(null);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setEditData({
      name: member.name || "",
      attended: member.attended || "No",
      organizer: member.organizer || "",
      invitedFrom: member.invitedFrom || "",
      hasLeft: member.hasLeft,
      isStudent: member.isStudent,
      untilWhen: member.untilWhen || null,
    });
    setSearchTerm(member.invitedFrom || "");
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      await updateMember({ id: editingMember._id, data: editData }).unwrap();
      refetch();
      setEditingMember(null);
    } catch (error) {
      console.error("Failed to update member:", error);
    }
  };

  const handleCreateMember = async () => {
    try {
      await createMember(newMemberData).unwrap();
      refetch();
      setNewMemberData({
        name: "",
        attended: "No",
        organizer: "",
        invitedFrom: "",
        hasLeft: false,
        isStudent: false,
        untilWhen: null,
      });
    } catch (error) {
      console.error("Failed to create member:", error);
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

  const filteredMembers = membersData?.members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const globallyFilteredMembers = membersData?.members.filter((member) =>
    member.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
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
      <div className="text-red-500 text-center">Error loading members.</div>
    );
  }

  return (
    <div className="p-6 transition-colors ease-in-out duration-300">
      <h1 className="text-3xl font-bold mb-6 text-center">Member Management</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for a member..."
          value={globalSearchTerm || ""}
          onChange={(e) => setGlobalSearchTerm(e.target.value)}
          className="text-black w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-800 transition-shadow shadow-sm hover:shadow-md bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {(userRole === "admin" || userRole === "master") && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Add New Member</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={newMemberData.name || ""}
              onChange={(e) =>
                setNewMemberData({ ...newMemberData, name: e.target.value })
              }
              className="text-black w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={newMemberData.organizer ?? ""}
              onChange={(e) =>
                setNewMemberData({
                  ...newMemberData,
                  organizer: e.target.value,
                })
              }
              className="text-black w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Organizer</option>
              <option value="Kourosh">Kourosh</option>
              <option value="Sobhan">Sobhan</option>
              <option value="Mutual">Mutual</option>
            </select>
            <button
              onClick={handleCreateMember}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Add Member
            </button>
          </div>
        </div>
      )}

      {globallyFilteredMembers?.length === 0 ? (
        <p className="text-center text-gray-700 dark:text-gray-300">
          No members found.
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
                  Organizer
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Inviter
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Left
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Student
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {globallyFilteredMembers?.map((member) => (
                <tr key={member._id}>
                  <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                    {member.name}
                  </td>
                  <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                    <button
                      onClick={() => handleToggleAttendedStatus(member._id)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                        toggleStatuses[member._id]?.attended
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          toggleStatuses[member._id]?.attended
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Conditionally render the following columns based on userRole */}
                  {(userRole === "admin" || userRole === "master") && (
                    <>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        {member.organizer || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        {member.invitedFrom || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        <button
                          onClick={() => handleToggleHasLeftStatus(member._id)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                            toggleStatuses[member._id]?.hasLeft
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              toggleStatuses[member._id]?.hasLeft
                                ? "translate-x-5"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                        <button
                          onClick={() => handleToggleStudentStatus(member._id)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                            toggleStatuses[member._id]?.isStudent
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              toggleStatuses[member._id]?.isStudent
                                ? "translate-x-5"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                    </>
                  )}

                  <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                    {(userRole === "admin" || userRole === "master") && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(member._id)}
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300"
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
            {globallyFilteredMembers?.map((member) => (
              <div
                key={member._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {member.name}
                  </h2>
                  <button
                    onClick={() => handleToggleAttendedStatus(member._id)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                      toggleStatuses[member._id]?.attended
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        toggleStatuses[member._id]?.attended
                          ? "translate-x-5"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Conditionally render the following paragraphs based on userRole */}
                {(userRole === "admin" || userRole === "master") && (
                  <>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Organizer:</span>{" "}
                      {member.organizer || "N/A"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Inviter:</span>{" "}
                      {member.invitedFrom || "N/A"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Left:</span>{" "}
                      {member.hasLeft ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Student:</span>{" "}
                      {member.isStudent ? "Yes" : "No"}
                    </p>
                    {member.isStudent && member.untilWhen && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Until:</span>{" "}
                        {new Date(member.untilWhen).toLocaleDateString()}
                      </p>
                    )}
                  </>
                )}

                {/* Conditionally render edit and delete buttons based on userRole */}
                {(userRole === "admin" || userRole === "master") && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleEditMember(member)}
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition duration-300 w-full"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(member._id)}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300 w-full"
                    >
                      Delete
                    </button>
                  </div>
                )}
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
            Are you sure you want to delete this member?
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={closeDeleteModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMember}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {/* Edit Modal */}
      {editingMember && (
        <Modal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          title="Edit Member"
        >
          <div className="space-y-4">
            {/* Name Input */}
            <input
              type="text"
              placeholder="Name"
              value={editData.name ?? ""}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="text-black w-full p-2 border rounded"
            />

            {/* Organizer Dropdown */}
            <select
              value={editData.organizer ?? ""}
              onChange={(e) =>
                setEditData({ ...editData, organizer: e.target.value })
              }
              className="text-black w-full p-2 border rounded"
            >
              <option value="">Select Organizer</option>
              <option value="Kourosh">Kourosh</option>
              <option value="Sobhan">Sobhan</option>
              <option value="Mutual">Mutual</option>
            </select>

            {/* Search Inviter */}
            <div className="relative text-black">
              <input
                type="text"
                placeholder="Search Inviter"
                value={searchTerm || ""}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(e.target.value !== "");
                }}
                className="text-black w-full p-2 border rounded"
              />
              {showDropdown && (
                <div className="absolute z-10 bg-white w-full border rounded mt-1 max-h-40 overflow-y-auto">
                  {filteredMembers?.map((m) => (
                    <button
                      key={m._id}
                      className="cursor-pointer p-2 hover:bg-gray-200 text-left w-full"
                      onClick={() => {
                        setEditData({
                          ...editData,
                          invitedFrom: m.name,
                        });
                        setSearchTerm(m.name);
                        setShowDropdown(false);
                      }}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Switch Toggle for Has Left */}
            <div className="flex items-center gap-2 justify-between">
              <label htmlFor="hasLeft" className="">
                Left:
              </label>
              <button
                onClick={() =>
                  setEditData({ ...editData, hasLeft: !editData.hasLeft })
                }
                className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                  editData.hasLeft ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    editData.hasLeft ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
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

            {/* Save and Cancel Buttons */}
            <div className="flex justify-between gap-2">
              <button
                onClick={handleUpdateMember}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full"
              >
                Save
              </button>
              <button
                onClick={() => setEditingMember(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300 w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {membersData?.statistics && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
            <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
              Total Members
            </p>
            <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
              {membersData.statistics.totalCount}
            </p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
            <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
              Attended Members
            </p>
            <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
              {membersData.statistics.attendedCount}
            </p>
          </div>
          {(userRole === "admin" || userRole === "master") && (
            <>
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
                <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
                  Students Count
                </p>
                <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
                  {membersData.statistics.studentsCount || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
                <p className="text-lg font-semibold text-center text-gray-800 dark:text-white">
                  Members Left
                </p>
                <p className="text-3xl font-bold text-center text-lime-600 dark:text-lime-400">
                  {membersData.statistics.hasLeftCount || 0}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
