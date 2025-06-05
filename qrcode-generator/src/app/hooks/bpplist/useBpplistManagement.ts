import { useState, useEffect } from "react";
import {
  useGetAllBpplistQuery,
  useCreateBpplistItemMutation,
  useUpdateBpplistItemMutation,
  useUpdateAttendedStatusMutation,
  useUpdateHasLeftStatusMutation,
  useUpdateStudentStatusMutation,
  useDeleteBpplistItemMutation,
} from "@/redux/features/bpplist/bpplistApiSlice";
import { CreateBpplistDto, UpdateBpplistDto } from "@/types/bpplist";

export const useBpplistManagement = () => {
  const {
    data: bpplistData,
    isLoading,
    isError,
    refetch,
  } = useGetAllBpplistQuery();

  const [createBpplistItem] = useCreateBpplistItemMutation();
  const [updateBpplistItem] = useUpdateBpplistItemMutation();
  const [deleteBpplistItem] = useDeleteBpplistItemMutation();
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
    if (bpplistData?.bpplist) {
      const initialToggleStatuses: {
        [key: string]: {
          attended: boolean;
          hasLeft: boolean;
          isStudent: boolean;
        };
      } = {};
      bpplistData.bpplist.forEach((item) => {
        initialToggleStatuses[item._id] = {
          attended: item.attended === "Yes",
          hasLeft: item.hasLeft,
          isStudent: item.isStudent,
        };
      });
      setToggleStatuses(initialToggleStatuses);
    }
  }, [bpplistData]);

  // Business logic functions
  const handleCreateBpplistItem = async (itemData: CreateBpplistDto) => {
    if (!itemData.name?.trim()) {
      throw new Error("Please enter a name.");
    }
    await createBpplistItem(itemData).unwrap();
    refetch();
  };

  const handleDeleteBpplistItem = async (itemId: string) => {
    await deleteBpplistItem(itemId).unwrap();
    refetch();
  };

  const handleUpdateBpplistItem = async (
    itemId: string,
    data: UpdateBpplistDto
  ) => {
    await updateBpplistItem({ id: itemId, data }).unwrap();
    refetch();
  };

  const handleToggleAttendedStatus = async (itemId: string) => {
    try {
      const newAttendedStatus = !toggleStatuses[itemId].attended;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [itemId]: { ...prevState[itemId], attended: newAttendedStatus },
      }));

      await updateAttendedStatus({
        id: itemId,
        attended: newAttendedStatus ? "Yes" : "No",
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update attended status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [itemId]: {
          ...prevState[itemId],
          attended: !prevState[itemId].attended,
        },
      }));
      throw error;
    }
  };

  const handleToggleHasLeftStatus = async (itemId: string) => {
    try {
      const newHasLeftStatus = !toggleStatuses[itemId].hasLeft;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [itemId]: { ...prevState[itemId], hasLeft: newHasLeftStatus },
      }));

      await updateHasLeftStatus({
        id: itemId,
        hasLeft: newHasLeftStatus,
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update has left status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [itemId]: {
          ...prevState[itemId],
          hasLeft: !prevState[itemId].hasLeft,
        },
      }));
      throw error;
    }
  };

  const handleToggleStudentStatus = async (itemId: string) => {
    try {
      const newStudentStatus = !toggleStatuses[itemId].isStudent;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [itemId]: { ...prevState[itemId], isStudent: newStudentStatus },
      }));

      await updateStudentStatus({
        id: itemId,
        isStudent: newStudentStatus,
        untilWhen: newStudentStatus ? new Date() : null,
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update student status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [itemId]: {
          ...prevState[itemId],
          isStudent: !prevState[itemId].isStudent,
        },
      }));
      throw error;
    }
  };

  // Filtered items based on search term
  const filteredItems = bpplistData?.bpplist.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    // Data
    bpplistData,
    filteredItems,
    isLoading,
    isError,
    searchTerm,
    toggleStatuses,

    // Setters
    setSearchTerm,

    // Actions
    handleCreateBpplistItem,
    handleDeleteBpplistItem,
    handleUpdateBpplistItem,
    handleToggleAttendedStatus,
    handleToggleHasLeftStatus,
    handleToggleStudentStatus,
    refetch,
  };
};
