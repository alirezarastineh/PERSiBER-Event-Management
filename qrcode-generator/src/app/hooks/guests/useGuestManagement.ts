import { useState, useEffect } from "react";
import {
  useGetAllGuestsQuery,
  useDeleteGuestMutation,
  useUpdateGuestMutation,
  useToggleStudentDiscountMutation,
  useToggleLadyDiscountMutation,
  useUpdateAttendedStatusMutation,
  useCreateGuestMutation,
  useAdjustDrinksCouponMutation,
} from "@/redux/features/guests/guestsApiSlice";
import { Guest, UpdateGuestDto } from "@/types/guests";

export const useGuestManagement = () => {
  const {
    data: guestsData,
    isLoading,
    isError,
    refetch,
  } = useGetAllGuestsQuery();

  const [deleteGuest] = useDeleteGuestMutation();
  const [updateGuest] = useUpdateGuestMutation();
  const [toggleStudentDiscount] = useToggleStudentDiscountMutation();
  const [toggleLadyDiscount] = useToggleLadyDiscountMutation();
  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();
  const [createGuest] = useCreateGuestMutation();
  const [adjustDrinksCoupon] = useAdjustDrinksCouponMutation();

  // State management
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [attendedStatuses, setAttendedStatuses] = useState<{
    [key: string]: boolean;
  }>({});
  const [discountStatuses, setDiscountStatuses] = useState({
    studentDiscountActive: false,
    ladyDiscountActive: false,
  });

  // Initialize discount statuses from API data
  useEffect(() => {
    if (guestsData?.statistics) {
      setDiscountStatuses({
        studentDiscountActive:
          guestsData.statistics.studentDiscountActive ?? false,
        ladyDiscountActive: guestsData.statistics.ladyDiscountActive ?? false,
      });
    }
  }, [guestsData]);

  // Initialize attended statuses
  useEffect(() => {
    if (guestsData?.guests) {
      const initialAttendedStatuses: { [key: string]: boolean } = {};
      guestsData.guests.forEach((guest) => {
        initialAttendedStatuses[guest._id] = guest.attended === "Yes";
      });
      setAttendedStatuses(initialAttendedStatuses);
    }
  }, [guestsData]);

  // Business logic functions
  const handleCreateGuest = async (name: string) => {
    if (!name.trim()) {
      throw new Error("Please enter a guest's name.");
    }
    await createGuest({ name }).unwrap();
    refetch();
  };

  const handleDeleteGuest = async (guestId: string) => {
    await deleteGuest(guestId).unwrap();
    refetch();
  };

  const handleUpdateGuest = async (
    guestId: string,
    data: UpdateGuestDto,
    originalGuest: Guest
  ) => {
    const updatedFields: Partial<UpdateGuestDto> = {};

    if (data.name !== originalGuest.name) {
      updatedFields.name = data.name;
    }
    if (data.invitedFrom !== originalGuest.invitedFrom) {
      updatedFields.invitedFrom = data.invitedFrom ?? "";
    }
    if (data.isStudent !== originalGuest.isStudent) {
      updatedFields.isStudent = data.isStudent;
    }
    if (data.untilWhen !== originalGuest.untilWhen) {
      updatedFields.untilWhen = data.untilWhen;
    }
    if (data.isLady !== originalGuest.isLady) {
      updatedFields.isLady = data.isLady;
    }
    if (data.freeEntry !== originalGuest.freeEntry) {
      updatedFields.freeEntry = data.freeEntry;
    }

    if (Object.keys(updatedFields).length === 0) {
      throw new Error("No changes to update.");
    }

    await updateGuest({ id: guestId, data: updatedFields }).unwrap();
    refetch();
  };

  const handleToggleStudentDiscount = async () => {
    try {
      const newStudentStatus = !discountStatuses.studentDiscountActive;
      setDiscountStatuses((prevState) => ({
        ...prevState,
        studentDiscountActive: newStudentStatus,
      }));

      await toggleStudentDiscount(newStudentStatus).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to toggle student discount:", error);
      setDiscountStatuses((prevState) => ({
        ...prevState,
        studentDiscountActive: !prevState.studentDiscountActive,
      }));
      throw error;
    }
  };

  const handleToggleLadyDiscount = async () => {
    try {
      const newLadyStatus = !discountStatuses.ladyDiscountActive;
      setDiscountStatuses((prevState) => ({
        ...prevState,
        ladyDiscountActive: newLadyStatus,
      }));

      await toggleLadyDiscount(newLadyStatus).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to toggle lady discount:", error);
      setDiscountStatuses((prevState) => ({
        ...prevState,
        ladyDiscountActive: !prevState.ladyDiscountActive,
      }));
      throw error;
    }
  };

  const handleToggleAttendedStatus = async (guestId: string) => {
    const newStatus = !attendedStatuses[guestId];
    await updateAttendedStatus({
      id: guestId,
      attended: newStatus ? "Yes" : "Still Not",
    }).unwrap();
    setAttendedStatuses((prevState) => ({
      ...prevState,
      [guestId]: newStatus,
    }));
    refetch();
  };

  const handleAdjustDrinksCoupon = async (
    guestId: string,
    adjustment: number
  ) => {
    await adjustDrinksCoupon({
      id: guestId,
      adjustment: adjustment,
    }).unwrap();
    refetch();
  };

  // Filtered guests based on search term
  const filteredGuests = guestsData?.guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    // Data
    guestsData,
    filteredGuests,
    isLoading,
    isError,
    searchTerm,
    attendedStatuses,
    discountStatuses,

    // Setters
    setSearchTerm,

    // Actions
    handleCreateGuest,
    handleDeleteGuest,
    handleUpdateGuest,
    handleToggleStudentDiscount,
    handleToggleLadyDiscount,
    handleToggleAttendedStatus,
    handleAdjustDrinksCoupon,
    refetch,
  };
};
