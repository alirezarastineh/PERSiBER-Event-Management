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

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId).unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
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
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full sm:w-auto"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUserId(user._id);
                            setSelectedRole(user.role);
                          }}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                        >
                          Edit Role
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
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
                      onClick={() => handleDeleteUser(user._id)}
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
    </div>
  );
}
