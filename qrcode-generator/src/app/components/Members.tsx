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

  // New state for adding a new member
  const [newMemberData, setNewMemberData] = useState<CreateMemberDto>({
    name: "",
    attended: "No",
    organizer: "",
    invitedFrom: "",
    hasLeft: false,
    isStudent: false,
    untilWhen: null,
  });

  // State for searchable dropdown
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // State for global search
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

  // Filter members based on the search term
  const filteredMembers = membersData?.members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter members based on the global search term
  const globallyFilteredMembers = membersData?.members.filter((member) =>
    member.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  if (isLoading) {
    return <Spinner lg />;
  }

  if (isError) {
    return <div>Error loading members.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Member Management</h1>

      {/* Global Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for a member..."
          value={globalSearchTerm || ""} // Provide default value
          onChange={(e) => setGlobalSearchTerm(e.target.value)}
          className="text-black w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Display Statistics */}
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold">
          Total Members: {membersData?.statistics?.totalCount ?? 0}{" "}
          {/* Ensure controlled value */}
        </p>
        <p className="text-lg font-semibold">
          Attended: {membersData?.statistics?.attendedCount ?? 0}{" "}
          {/* Ensure controlled value */}
        </p>
      </div>

      {/* Add New Member Section */}
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

      {/* Members List */}
      {globallyFilteredMembers?.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {globallyFilteredMembers?.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center"
            >
              {/* Member Name as the Main Focus */}
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {member.name}
              </h2>
              <p className="text-sm text-gray-500">
                {member.organizer || "N/A"}
              </p>

              {/* Additional Member Details */}
              <div className="mt-4 text-center space-y-1">
                <p className="text-gray-700">
                  Invited From: {member.invitedFrom || "N/A"}
                </p>
                <p className="text-gray-700">
                  Members Invited: {member.membersInvited || 0}
                </p>
                <p className="text-gray-700">
                  Attended: {member.attended || "No"}
                </p>
                <p className="text-gray-700">
                  Has Left: {member.hasLeft ? "Yes" : "No"}
                </p>
                <p className="text-gray-700">
                  Is Student: {member.isStudent ? "Yes" : "No"}
                </p>
                {member.isStudent && member.untilWhen && (
                  <p className="text-gray-700">
                    Until: {new Date(member.untilWhen).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex w-full mt-4">
                {(userRole === "admin" || userRole === "master") && (
                  <>
                    <button
                      onClick={() => handleEditMember(member)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-l-lg hover:bg-blue-600 transition duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(member._id)} // Open modal instead of confirm
                      className="flex-1 bg-red-500 text-white py-2 rounded-r-lg hover:bg-red-600 transition duration-300"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              {/* Toggle Switches */}
              <div className="flex justify-around w-full mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Attended
                  </span>
                  <label
                    htmlFor={`attended-toggle-${member._id}`}
                    className="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      id={`attended-toggle-${member._id}`}
                      type="checkbox"
                      checked={toggleStatuses[member._id]?.attended || false} // Ensure controlled input
                      onChange={() => handleToggleAttendedStatus(member._id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>
                    <span
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        toggleStatuses[member._id]?.attended
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    ></span>
                  </label>
                </div>

                {/* Uncomment and ensure controlled values for other toggles */}
                {/* 
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Has Left</span>
                  <label
                    htmlFor={`hasLeft-toggle-${member._id}`}
                    className="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      id={`hasLeft-toggle-${member._id}`}
                      type="checkbox"
                      checked={toggleStatuses[member._id]?.hasLeft || false} // Ensure controlled input
                      onChange={() => handleToggleHasLeftStatus(member._id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>
                    <span
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        toggleStatuses[member._id]?.hasLeft
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    ></span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Student</span>
                  <label
                    htmlFor={`student-toggle-${member._id}`}
                    className="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      id={`student-toggle-${member._id}`}
                      type="checkbox"
                      checked={toggleStatuses[member._id]?.isStudent || false} // Ensure controlled input
                      onChange={() => handleToggleStudentStatus(member._id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>
                    <span
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        toggleStatuses[member._id]?.isStudent
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    ></span>
                  </label>
                </div> 
                */}
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
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edit Member</h3>
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
                  placeholder="Search Invited From"
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
              <div className="flex items-center gap-2">
                <label htmlFor="hasLeft" className="text-black">
                  Has Left:
                </label>
                <input
                  type="checkbox"
                  id="hasLeft"
                  checked={editData.hasLeft || false}
                  onChange={(e) =>
                    setEditData({ ...editData, hasLeft: e.target.checked })
                  }
                  className="border p-2 rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="isStudent" className="text-black">
                  Is Student:
                </label>
                <input
                  type="checkbox"
                  id="isStudent"
                  checked={editData.isStudent || false}
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
          </div>
        </div>
      )}
    </div>
  );
}