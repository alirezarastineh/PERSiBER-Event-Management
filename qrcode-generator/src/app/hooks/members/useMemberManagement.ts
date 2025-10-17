import { useState, useEffect } from "react";
import {
  useGetAllMembersQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useUpdateAttendedStatusMutation,
  useUpdateHasLeftStatusMutation,
  useUpdateStudentStatusMutation,
  useDeleteMemberMutation,
} from "@/redux/features/members/membersApiSlice";
import { CreateMemberDto, UpdateMemberDto } from "@/types/members";

export const useMemberManagement = () => {
  const { data: membersData, isLoading, isError, refetch } = useGetAllMembersQuery();

  const [createMember] = useCreateMemberMutation();
  const [updateMember] = useUpdateMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();
  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();
  const [updateHasLeftStatus] = useUpdateHasLeftStatusMutation();
  const [updateStudentStatus] = useUpdateStudentStatusMutation();

  // State management
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [toggleStatuses, setToggleStatuses] = useState<{
    [key: string]: { attended: boolean; hasLeft: boolean; isStudent: boolean };
  }>({});

  // Initialize toggle statuses
  useEffect(() => {
    if (membersData?.members) {
      const initialToggleStatuses: {
        [key: string]: {
          attended: boolean;
          hasLeft: boolean;
          isStudent: boolean;
        };
      } = {};
      for (const member of membersData.members) {
        initialToggleStatuses[member._id] = {
          attended: member.attended === "Yes",
          hasLeft: member.hasLeft,
          isStudent: member.isStudent,
        };
      }
      setToggleStatuses(initialToggleStatuses);
    }
  }, [membersData]);

  // Business logic functions
  const handleCreateMember = async (memberData: CreateMemberDto) => {
    if (!memberData.name?.trim()) {
      throw new Error("Please enter a member's name.");
    }
    await createMember(memberData).unwrap();
    refetch();
  };

  const handleDeleteMember = async (memberId: string) => {
    await deleteMember(memberId).unwrap();
    refetch();
  };

  const handleUpdateMember = async (memberId: string, data: UpdateMemberDto) => {
    await updateMember({ id: memberId, data }).unwrap();
    refetch();
  };

  const handleToggleAttendedStatus = async (memberId: string) => {
    try {
      const newAttendedStatus = !toggleStatuses[memberId].attended;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [memberId]: { ...prevState[memberId], attended: newAttendedStatus },
      }));

      await updateAttendedStatus({
        id: memberId,
        attended: newAttendedStatus ? "Yes" : "No",
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update attended status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [memberId]: {
          ...prevState[memberId],
          attended: !prevState[memberId].attended,
        },
      }));
      throw error;
    }
  };

  const handleToggleHasLeftStatus = async (memberId: string) => {
    try {
      const newHasLeftStatus = !toggleStatuses[memberId].hasLeft;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [memberId]: { ...prevState[memberId], hasLeft: newHasLeftStatus },
      }));

      await updateHasLeftStatus({
        id: memberId,
        hasLeft: newHasLeftStatus,
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update has left status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [memberId]: {
          ...prevState[memberId],
          hasLeft: !prevState[memberId].hasLeft,
        },
      }));
      throw error;
    }
  };

  const handleToggleStudentStatus = async (memberId: string) => {
    try {
      const newStudentStatus = !toggleStatuses[memberId].isStudent;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [memberId]: { ...prevState[memberId], isStudent: newStudentStatus },
      }));

      await updateStudentStatus({
        id: memberId,
        isStudent: newStudentStatus,
        untilWhen: newStudentStatus ? new Date() : null,
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update student status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [memberId]: {
          ...prevState[memberId],
          isStudent: !prevState[memberId].isStudent,
        },
      }));
      throw error;
    }
  };

  // Filtered members based on search term
  const filteredMembers = membersData?.members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return {
    // Data
    membersData,
    filteredMembers,
    isLoading,
    isError,
    searchTerm,
    toggleStatuses,

    // Setters
    setSearchTerm,

    // Actions
    handleCreateMember,
    handleDeleteMember,
    handleUpdateMember,
    handleToggleAttendedStatus,
    handleToggleHasLeftStatus,
    handleToggleStudentStatus,
    refetch,
  };
};
