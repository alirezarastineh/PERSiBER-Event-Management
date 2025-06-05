import { useState } from "react";
import { Guest, UpdateGuestDto } from "@/types/guests";

export const useGuestModals = () => {
  // Edit modal state
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editData, setEditData] = useState<UpdateGuestDto>({
    name: "",
    invitedFrom: "",
    isStudent: false,
    untilWhen: null,
    isLady: false,
    freeEntry: false,
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [guestIdToDelete, setGuestIdToDelete] = useState<string | null>(null);

  // Inviter search for edit modal
  const [invitedFromSearchTerm, setInvitedFromSearchTerm] =
    useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Edit modal functions
  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setEditData({
      name: guest.name || "",
      invitedFrom: guest.invitedFrom || "",
      isStudent: guest.isStudent,
      untilWhen: guest.untilWhen || null,
      isLady: guest.isLady,
      freeEntry: guest.freeEntry,
    });
    setInvitedFromSearchTerm(guest.invitedFrom || "");
  };

  const closeEditModal = () => {
    setEditingGuest(null);
    setInvitedFromSearchTerm("");
    setShowDropdown(false);
  };

  // Delete modal functions
  const openDeleteModal = (guestId: string) => {
    setGuestIdToDelete(guestId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setGuestIdToDelete(null);
  };

  return {
    // Edit modal state
    editingGuest,
    editData,
    setEditData,
    invitedFromSearchTerm,
    setInvitedFromSearchTerm,
    showDropdown,
    setShowDropdown,

    // Delete modal state
    showDeleteModal,
    guestIdToDelete,

    // Actions
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  };
};
