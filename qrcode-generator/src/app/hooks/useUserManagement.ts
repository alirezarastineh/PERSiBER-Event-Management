import { useState } from "react";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} from "@/redux/features/users/usersApiSlice";
import { useAppSelector } from "@/redux/hooks";
import { UpdateUserRoleDto } from "@/types/auth";

export const useUserManagement = () => {
  const { data: usersData, isLoading, isError, refetch } = useGetAllUsersQuery();

  const [deleteUser] = useDeleteUserMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();

  // State management
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Get current user role for permissions
  const currentUserRole = useAppSelector((state) => state.auth.user?.role);

  // Business logic functions
  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId).unwrap();
    refetch();
  };

  const handleUpdateRole = async () => {
    if (!selectedUserId || !selectedRole) {
      throw new Error("User ID and role are required");
    }

    const updateData: UpdateUserRoleDto = {
      id: selectedUserId,
      role: selectedRole,
    };

    await updateUserRole(updateData).unwrap();
    refetch();
    closeEditModal();
  };

  // Modal management
  const openEditModal = (userId: string, currentRole: string) => {
    setSelectedUserId(userId);
    setSelectedRole(currentRole);
  };

  const closeEditModal = () => {
    setSelectedUserId(null);
    setSelectedRole("");
  };

  // Permission checks
  const hasPermissionForUser = (userRole: string) => {
    if (currentUserRole === "master") {
      return userRole === "user" || userRole === "admin";
    }
    if (currentUserRole === "admin") {
      return userRole === "user";
    }
    return false;
  };

  const canEditUser = (userRole: string) => {
    return hasPermissionForUser(userRole);
  };

  const canDeleteUser = (userRole: string) => {
    return hasPermissionForUser(userRole);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "master":
        return "bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy";
      case "admin":
        return "bg-blue-900/30 text-blue-300";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  return {
    // Data
    users: usersData || [],
    isLoading,
    isError,
    currentUserRole,

    // Edit modal state
    selectedUserId,
    selectedRole,
    setSelectedRole,

    // Actions
    handleDeleteUser,
    handleUpdateRole,
    openEditModal,
    closeEditModal,
    refetch,

    // Utilities
    canEditUser,
    canDeleteUser,
    getRoleBadgeClass,
  };
};
