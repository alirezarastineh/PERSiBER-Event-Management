import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetGuestByIdQuery,
  useGetAllGuestsQuery,
  useDeleteGuestMutation,
  useUpdateGuestMutation,
  useUpdateStudentStatusMutation,
  useUpdateLadyStatusMutation,
  useUpdateAttendedStatusMutation,
  useAdjustDrinksCouponMutation,
} from "@/redux/features/guests/guestsApiSlice";
import { Guest, UpdateGuestDto } from "@/types/guests";
import { useAppSelector } from "@/redux/hooks";

export const useGuestDetail = () => {
  const router = useRouter();
  const { id } = useParams();

  // API Queries and Mutations
  const {
    data: guest,
    isLoading: isGuestLoading,
    isError: isGuestError,
    refetch,
  } = useGetGuestByIdQuery(id as string, {
    skip: !id,
  });

  const {
    data: guestsData,
    isLoading: isGuestsLoading,
    isError: isGuestsError,
  } = useGetAllGuestsQuery();

  const [deleteGuest] = useDeleteGuestMutation();
  const [updateGuest] = useUpdateGuestMutation();
  const [updateStudentStatus] = useUpdateStudentStatusMutation();
  const [updateLadyStatus] = useUpdateLadyStatusMutation();
  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();
  const [adjustDrinksCoupon] = useAdjustDrinksCouponMutation();

  // Local State
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editData, setEditData] = useState<UpdateGuestDto>({
    name: "",
    invitedFrom: "",
    isStudent: false,
    untilWhen: null,
    isLady: false,
    freeEntry: false,
  });
  const [attendedStatus, setAttendedStatus] = useState<boolean>(false);
  const [invitedFromSearchTerm, setInvitedFromSearchTerm] =
    useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // User role
  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Initialize edit data when guest loads
  useEffect(() => {
    if (guest) {
      setEditingGuest(guest);
      setEditData({
        name: guest.name,
        invitedFrom: guest.invitedFrom ?? "",
        isStudent: guest.isStudent ?? false,
        untilWhen: guest.untilWhen ?? null,
        isLady: guest.isLady ?? false,
        freeEntry: guest.freeEntry ?? false,
      });
    }
  }, [guest]);

  useEffect(() => {
    if (guest) {
      setAttendedStatus(guest.attended === "Yes");
    }
  }, [guest]);

  // Handlers
  const handleDeleteGuest = async (guestId: string) => {
    try {
      await deleteGuest(guestId).unwrap();
      router.push("/guests");
      refetch();
    } catch (error) {
      console.error("Failed to delete guest:", error);
      throw error;
    }
  };

  const handleToggleAttendedStatus = async () => {
    if (!editingGuest) return;
    const newStatus = attendedStatus ? "Still Not" : "Yes";
    try {
      await updateAttendedStatus({
        id: editingGuest._id,
        attended: newStatus,
      }).unwrap();
      setAttendedStatus(!attendedStatus);
      refetch();
    } catch (error) {
      console.error("Failed to update attended status:", error);
      throw error;
    }
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest) return;
    try {
      await updateGuest({ id: editingGuest._id, data: editData }).unwrap();
      refetch();
      setEditingGuest(null);
    } catch (error) {
      console.error("Failed to update guest:", error);
      throw error;
    }
  };

  const handleUpdateStudentStatus = async (isStudent: boolean) => {
    if (!editingGuest?._id) return;
    try {
      await updateStudentStatus({
        id: editingGuest._id,
        isStudent,
        untilWhen: isStudent ? editData.untilWhen ?? null : null,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update student status:", error);
      throw error;
    }
  };

  const handleUpdateLadyStatus = async (isLady: boolean) => {
    if (!editingGuest?._id) return;
    try {
      await updateLadyStatus({
        id: editingGuest._id,
        isLady,
      }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update lady status:", error);
      throw error;
    }
  };

  const handleAdjustDrinksCoupon = async (newValue: number) => {
    if (!guest) return;
    const originalValue = guest.drinksCoupon ?? 0;
    const adjustment = newValue - originalValue;

    if (adjustment !== 0) {
      try {
        await adjustDrinksCoupon({
          id: guest._id,
          adjustment: adjustment,
        }).unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to update drinks coupon:", error);
        throw error;
      }
    }
  };

  const handleUpdateFreeEntry = async (freeEntry: boolean) => {
    if (!editingGuest?._id) return;
    try {
      await updateGuest({
        id: editingGuest._id,
        data: { freeEntry },
      }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update free entry status:", error);
      throw error;
    }
  };

  return {
    // Data
    guest,
    guestsData,
    editingGuest,
    editData,
    attendedStatus,
    invitedFromSearchTerm,
    showDropdown,
    userRole,

    // Loading and error states
    isLoading: isGuestLoading || isGuestsLoading,
    isError: isGuestError || isGuestsError,

    // Setters
    setEditData,
    setInvitedFromSearchTerm,
    setShowDropdown,

    // Handlers
    handleDeleteGuest,
    handleToggleAttendedStatus,
    handleUpdateGuest,
    handleUpdateStudentStatus,
    handleUpdateLadyStatus,
    handleAdjustDrinksCoupon,
    handleUpdateFreeEntry,

    // Navigation
    goBack: () => router.push("/guests"),
  };
};
