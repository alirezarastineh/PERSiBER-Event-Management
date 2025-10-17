import { useState } from "react";
import { Bpplist, UpdateBpplistDto } from "@/types/bpplist";

export const useBpplistModals = () => {
  // Edit modal state
  const [editingItem, setEditingItem] = useState<Bpplist | null>(null);
  const [editData, setEditData] = useState<UpdateBpplistDto>({
    name: "",
    attended: "No",
    organizer: "",
    invitedFrom: "",
    hasLeft: false,
    isStudent: false,
    untilWhen: null,
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemIdToDelete, setItemIdToDelete] = useState<string | null>(null);

  // Inviter search for edit modal
  const [invitedFromSearchTerm, setInvitedFromSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Edit modal functions
  const openEditModal = (item: Bpplist) => {
    setEditingItem(item);
    setEditData({
      name: item.name || "",
      attended: item.attended || "No",
      organizer: item.organizer || "",
      invitedFrom: item.invitedFrom || "",
      hasLeft: item.hasLeft,
      isStudent: item.isStudent,
      untilWhen: item.untilWhen || null,
    });
    setInvitedFromSearchTerm(item.invitedFrom || "");
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setInvitedFromSearchTerm("");
    setShowDropdown(false);
  };

  // Delete modal functions
  const openDeleteModal = (itemId: string) => {
    setItemIdToDelete(itemId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemIdToDelete(null);
  };

  return {
    // Edit modal state
    editingItem,
    editData,
    setEditData,
    invitedFromSearchTerm,
    setInvitedFromSearchTerm,
    showDropdown,
    setShowDropdown,

    // Delete modal state
    showDeleteModal,
    itemIdToDelete,

    // Actions
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  };
};
