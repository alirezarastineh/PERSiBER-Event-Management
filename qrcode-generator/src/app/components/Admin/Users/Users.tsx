"use client";

import React, { useState } from "react";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} from "@/redux/features/users/usersApiSlice";
import { UpdateUserRoleDto } from "@/types/types";
import Spinner from "../../Common/Spinner";

export default function Users() {
  const { data: users, isLoading, isError, refetch } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  const handleDeleteUser = async () => {
    if (userIdToDelete) {
      try {
        await deleteUser(userIdToDelete).unwrap();
        refetch();
        setShowDeleteModal(false); // Close modal on successful delete
        setUserIdToDelete(null); // Clear userIdToDelete state
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const openDeleteModal = (id: string) => {
    setUserIdToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserIdToDelete(null);
  };

  const handleUpdateRole = async () => {
    if (!selectedUserId || !selectedRole) {
      return;
    }

    const updateData: UpdateUserRoleDto = {
      id: selectedUserId,
      role: selectedRole,
    };

    try {
      await updateUserRole(updateData).unwrap();
      refetch();
      setSelectedUserId(null);
      setSelectedRole("");
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  if (isLoading) {
    return <Spinner lg />;
  }

  if (isError) {
    return <div>Error loading users.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">User Management</h1>
      {users?.length === 0 ? (
        <p className="text-center">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {users?.map((user) => (
            <div
              key={user._id}
              className="p-6 rounded-lg shadow-lg space-y-4 flex flex-col justify-between border-slate-400 border-2"
            >
              <div>
                <h2 className="text-xl font-semibold text-center">
                  {user.username}
                </h2>
                <p className="text-gray-600 text-center">Role: {user.role}</p>
              </div>

              {/* Conditionally render action buttons based on user role */}
              <div className="mt-4">
                {user.role === "user" && (
                  <>
                    {selectedUserId === user._id ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="border p-2 rounded w-full mb-4 bg-black text-white"
                      >
                        <option value="">Select role</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : null}
                    <div className="flex justify-between">
                      {selectedUserId === user._id ? (
                        <button
                          onClick={handleUpdateRole}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full sm:w-auto mt-4 sm:mt-0"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUserId(user._id);
                            setSelectedRole(user.role);
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto mt-4 sm:mt-0"
                        >
                          Edit Role
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(user._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto mt-4 sm:mt-0"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}

                {user.role === "admin" && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => openDeleteModal(user._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* Master users have no actions available */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h3 className="text-lg text-black font-semibold mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this user?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
