import { useState } from "react";
import { Member, UpdateMemberDto } from "@/types/members";

export const useMemberModals = () => {
  // Edit modal state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editData, setEditData] = useState<UpdateMemberDto>({
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
  const [memberIdToDelete, setMemberIdToDelete] = useState<string | null>(null);

  // Inviter search for edit modal
  const [invitedFromSearchTerm, setInvitedFromSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Edit modal functions
  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setEditData({
      name: member.name || "",
      attended: member.attended || "No",
      organizer: member.organizer || "",
      invitedFrom: member.invitedFrom || "",
      hasLeft: member.hasLeft,
      isStudent: member.isStudent,
      untilWhen: member.untilWhen || null,
    });
    setInvitedFromSearchTerm(member.invitedFrom || "");
  };

  const closeEditModal = () => {
    setEditingMember(null);
    setInvitedFromSearchTerm("");
    setShowDropdown(false);
  };

  // Delete modal functions
  const openDeleteModal = (memberId: string) => {
    setMemberIdToDelete(memberId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMemberIdToDelete(null);
  };

  return {
    // Edit modal state
    editingMember,
    editData,
    setEditData,
    invitedFromSearchTerm,
    setInvitedFromSearchTerm,
    showDropdown,
    setShowDropdown,

    // Delete modal state
    showDeleteModal,
    memberIdToDelete,

    // Actions
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
  };
};
