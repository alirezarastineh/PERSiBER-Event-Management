"use client";

import React, { useState } from "react";
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
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // State to control dropdown visibility

  // State for global search
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>("");

  const userRole = useAppSelector((state) => state.auth.user?.role);

  const handleDeleteMember = async (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      try {
        await deleteMember(id).unwrap();
        alert("Member deleted successfully!");
        refetch();
      } catch (error) {
        console.error("Failed to delete member:", error);
        alert("Failed to delete member.");
      }
    }
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
    setSearchTerm(member.invitedFrom || ""); // Initialize search term with current invitedFrom value
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      await updateMember({ id: editingMember._id, data: editData }).unwrap();
      alert("Member updated successfully!");
      refetch();
      setEditingMember(null);
    } catch (error) {
      console.error("Failed to update member:", error);
      alert("Failed to update member.");
    }
  };

  const handleCreateMember = async () => {
    try {
      await createMember(newMemberData).unwrap();
      alert("Member created successfully!");
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
      alert("Failed to create member.");
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

  const handleUpdateHasLeftStatus = async (id: string, hasLeft: boolean) => {
    try {
      await updateHasLeftStatus({ id, hasLeft }).unwrap();
      alert("Has Left status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update has left status:", error);
      alert("Failed to update has left status.");
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
          value={globalSearchTerm}
          onChange={(e) => setGlobalSearchTerm(e.target.value)}
          className="text-black w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Display Statistics */}
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold">
          Total Members: {membersData?.statistics.totalCount}
        </p>
        <p className="text-lg font-semibold">
          Attended: {membersData?.statistics.attendedCount}
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
              value={newMemberData.name}
              onChange={(e) =>
                setNewMemberData({ ...newMemberData, name: e.target.value })
              }
              className="text-black w-full p-2 border rounded"
            />
            <select
              value={newMemberData.organizer}
              onChange={(e) =>
                setNewMemberData({
                  ...newMemberData,
                  organizer: e.target.value,
                })
              }
              className="text-black w-full p-2 border rounded"
            >
              <option value="">Select Organizer</option>
              <option value="Kourosh">Kourosh</option>
              <option value="Sobhan">Sobhan</option>
              <option value="Mutual">Mutual</option>
            </select>
            <button
              onClick={handleCreateMember}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
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
              className="bg-white p-6 rounded-lg shadow-lg space-y-4"
            >
              <div>
                <h2 className="text-black text-xl font-semibold text-center">
                  {member.name}
                </h2>
                <p className="text-black text-center">
                  Attended: {member.attended}
                </p>
                <p className="text-black text-center">
                  Organizer: {member.organizer || "N/A"}
                </p>
                <p className="text-black text-center">
                  Invited From: {member.invitedFrom || "N/A"}
                </p>
                <p className="text-black text-center">
                  Members Invited: {member.membersInvited}
                </p>
                <p className="text-black text-center">
                  Has Left: {member.hasLeft ? "Yes" : "No"}
                </p>
                <p className="text-black text-center">
                  Is Student: {member.isStudent ? "Yes" : "No"}
                </p>
                {member.isStudent && member.untilWhen && (
                  <p className="text-black text-center">
                    Until When:{" "}
                    {new Date(member.untilWhen).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-between">
                {(userRole === "admin" || userRole === "master") && (
                  <>
                    <button
                      onClick={() => handleEditMember(member)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateAttendedStatus(
                          member._id,
                          member.attended === "No" ? "Yes" : "No"
                        )
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                    >
                      Toggle Attended
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateHasLeftStatus(member._id, !member.hasLeft)
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                    >
                      Toggle Has Left
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStudentStatus(
                          member._id,
                          !member.isStudent,
                          member.untilWhen
                        )
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                    >
                      Toggle Student Status
                    </button>
                  </>
                )}

                {userRole === "user" && (
                  <button
                    onClick={() =>
                      handleUpdateAttendedStatus(
                        member._id,
                        member.attended === "No" ? "Yes" : "No"
                      )
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                  >
                    Toggle Attended
                  </button>
                )}
              </div>

              {/* Editing Form */}
              {editingMember?._id === member._id && (
                <div className="mt-4 space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="text-black w-full p-2 border rounded"
                  />
                  <select
                    value={editData.organizer}
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

                  {/* Searchable Dropdown for Invited From */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Invited From"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(e.target.value !== ""); // Show dropdown only if there is text in the input
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
                              setSearchTerm(m.name); // Update search term to the selected member
                              setShowDropdown(false); // Hide dropdown after selection
                            }}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handleUpdateMember}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full sm:w-auto"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMember(null)}
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
