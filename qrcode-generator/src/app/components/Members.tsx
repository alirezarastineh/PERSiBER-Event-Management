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
    attended: "No", // Ensure a valid initial value for attended
    organizer: "",
    invitedFrom: "",
    hasLeft: false,
    isStudent: false,
    untilWhen: null,
  });

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
      attended: member.attended || "No", // Ensure a valid value is set
      organizer: member.organizer || "",
      invitedFrom: member.invitedFrom || "",
      hasLeft: member.hasLeft,
      isStudent: member.isStudent,
      untilWhen: member.untilWhen || null,
    });
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
    const newMemberData: CreateMemberDto = {
      name: editData.name ?? "",
      attended: editData.attended ?? "No", // Set a default valid value
      organizer: editData.organizer ?? "",
      invitedFrom: editData.invitedFrom ?? "",
      hasLeft: editData.hasLeft || false,
      isStudent: editData.isStudent || false,
      untilWhen: editData.untilWhen,
    };

    try {
      await createMember(newMemberData).unwrap();
      alert("Member created successfully!");
      refetch();
      setEditingMember(null);
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

  if (isLoading) {
    return <Spinner lg />;
  }

  if (isError) {
    return <div>Error loading members.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Member Management</h1>

      <div className="mb-4 text-center">
        <p className="text-lg font-semibold">
          Total Members: {membersData?.statistics.totalCount}
        </p>
        <p className="text-lg font-semibold">
          Attended: {membersData?.statistics.attendedCount}
        </p>
      </div>

      {(userRole === "admin" || userRole === "master") && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            {editingMember ? "Edit Member" : "Add New Member"}
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <select
              value={editData.organizer}
              onChange={(e) =>
                setEditData({ ...editData, organizer: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select Organizer</option>
              <option value="Kourosh">Kourosh</option>
              <option value="Sobhan">Sobhan</option>
              <option value="Mutual">Mutual</option>
            </select>
            <button
              onClick={editingMember ? handleUpdateMember : handleCreateMember}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              {editingMember ? "Update Member" : "Add Member"}
            </button>
            {editingMember && (
              <button
                onClick={() => setEditingMember(null)}
                className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {membersData?.members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {membersData?.members.map((member) => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
