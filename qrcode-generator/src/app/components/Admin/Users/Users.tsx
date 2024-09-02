"use client";

import React, { useState } from "react";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} from "@/redux/features/users/usersApiSlice";
import { UpdateUserRoleDto } from "@/types/types";
import Spinner from "../../Common/Spinner";
import Modal from "../../Common/Modal"; // Ensure this path is correct
import { useAppSelector } from "@/redux/hooks";

export default function Users() {
  const { data: users, isLoading, isError, refetch } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  const currentUserRole = useAppSelector((state) => state.auth.user?.role);

  const handleDeleteUser = async () => {
    if (userIdToDelete) {
      try {
        await deleteUser(userIdToDelete).unwrap();
        refetch();
        setShowDeleteModal(false);
        setUserIdToDelete(null);
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
    return (
      <div className="flex justify-center items-center my-8">
        <Spinner xl />
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500 text-center">Error loading users.</div>;
  }

  return (
    <div className="p-6 transition-colors ease-in-out duration-300">
      <h1 className="text-3xl font-bold mb-6 text-center">User Management</h1>

      {users?.length === 0 ? (
        <p className="text-center text-gray-700 dark:text-gray-300">
          No users found.
        </p>
      ) : (
        <div className="space-y-4 md:space-y-0 md:overflow-x-auto border-2 border-gray-500 dark:border-gray-700 rounded-3xl transition-all ease-in-out duration-300">
          <table className="hidden md:table min-w-full bg-[#575756]/20 dark:bg-gray-800 text-left">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Username
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Role
                </th>
                <th className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user._id}>
                  <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                    {user.username}
                  </td>
                  <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                    {user.role}
                  </td>
                  <td className="py-2 px-4 border-b border-[#575756] dark:border-gray-700">
                    <div className="flex space-x-2">
                      {currentUserRole === "admin" && user.role === "user" && (
                        <>
                          {/* Admin can delete users with the role of "user" */}
                          <button
                            onClick={() => openDeleteModal(user._id)}
                            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {currentUserRole === "master" && user.role === "user" && (
                        <>
                          {/* Master can edit role of "user" users */}
                          <button
                            onClick={() => {
                              setSelectedUserId(user._id);
                              setSelectedRole(user.role);
                            }}
                            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition duration-300"
                          >
                            Edit Role
                          </button>
                          {/* Master can delete all except "master" */}
                          <button
                            onClick={() => openDeleteModal(user._id)}
                            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {currentUserRole === "master" &&
                        user.role === "admin" && (
                          <>
                            {/* Master can edit role of "admin" users */}
                            <button
                              onClick={() => {
                                setSelectedUserId(user._id);
                                setSelectedRole(user.role);
                              }}
                              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition duration-300"
                            >
                              Edit Role
                            </button>
                            {/* Master can delete admin users */}
                            <button
                              onClick={() => openDeleteModal(user._id)}
                              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300"
                            >
                              Delete
                            </button>
                          </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile View */}
          <div className="md:hidden">
            {users?.map((user) => (
              <div
                key={user._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {user.username}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {user.role}
                  </p>
                </div>
                <div className="flex space-x-2 mt-4">
                  {currentUserRole === "admin" && user.role === "user" && (
                    <button
                      onClick={() => openDeleteModal(user._id)}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300 w-full"
                    >
                      Delete
                    </button>
                  )}

                  {currentUserRole === "master" && user.role === "user" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedUserId(user._id);
                          setSelectedRole(user.role);
                        }}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition duration-300 w-full"
                      >
                        Edit Role
                      </button>
                      <button
                        onClick={() => openDeleteModal(user._id)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300 w-full"
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {currentUserRole === "master" && user.role === "admin" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedUserId(user._id);
                          setSelectedRole(user.role);
                        }}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition duration-300 w-full"
                      >
                        Edit Role
                      </button>
                      <button
                        onClick={() => openDeleteModal(user._id)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition duration-300 w-full"
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
      {selectedUserId && (
        <Modal
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          title="Edit User Role"
        >
          <div className="space-y-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-black w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-between gap-2">
              <button
                onClick={handleUpdateRole}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full"
              >
                Save
              </button>
              <button
                onClick={() => setSelectedUserId(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300 w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          title="Confirm Deletion"
        >
          <p className="mb-6">Are you sure you want to delete this user?</p>
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
        </Modal>
      )}
    </div>
  );
}
