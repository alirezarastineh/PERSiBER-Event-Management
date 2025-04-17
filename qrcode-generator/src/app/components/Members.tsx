"use client";

import React, { useEffect, useState } from "react";
import {
  useGetAllMembersQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useUpdateAttendedStatusMutation,
  useUpdateHasLeftStatusMutation,
  useUpdateStudentStatusMutation,
  useDeleteMemberMutation,
} from "@/redux/features/members/membersApiSlice";
import { Member, CreateMemberDto, UpdateMemberDto } from "@/types/types";
import { useAppSelector } from "@/redux/hooks";
import Spinner from "./Common/Spinner";
import Modal from "./Common/Modal";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Members() {
  const {
    data: membersData,
    isLoading,
    isError,
    refetch,
  } = useGetAllMembersQuery();

  const [createMember] = useCreateMemberMutation();
  const [updateMember] = useUpdateMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();
  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();
  const [updateHasLeftStatus] = useUpdateHasLeftStatusMutation();
  const [updateStudentStatus] = useUpdateStudentStatusMutation();

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

  const [newMemberData, setNewMemberData] = useState<CreateMemberDto>({
    name: "",
    attended: "No",
    organizer: "",
    invitedFrom: "",
    hasLeft: false,
    isStudent: false,
    untilWhen: null,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>("");

  const [toggleStatuses, setToggleStatuses] = useState<{
    [key: string]: { attended: boolean; hasLeft: boolean; isStudent: boolean };
  }>({});

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [memberIdToDelete, setMemberIdToDelete] = useState<string | null>(null);

  const userRole = useAppSelector((state) => state.auth.user?.role);

  // Existing useEffect hooks remain unchanged
  useEffect(() => {
    if (membersData?.members) {
      const initialToggleStatuses: {
        [key: string]: {
          attended: boolean;
          hasLeft: boolean;
          isStudent: boolean;
        };
      } = {};
      membersData.members.forEach((member) => {
        initialToggleStatuses[member._id] = {
          attended: member.attended === "Yes",
          hasLeft: member.hasLeft,
          isStudent: member.isStudent,
        };
      });
      setToggleStatuses(initialToggleStatuses);
    }
  }, [membersData]);

  // All handlers remain unchanged
  const handleDeleteMember = async () => {
    if (memberIdToDelete) {
      try {
        await deleteMember(memberIdToDelete).unwrap();
        refetch();
        setShowDeleteModal(false);
        setMemberIdToDelete(null);
      } catch (error) {
        console.error("Failed to delete member:", error);
      }
    }
  };

  const openDeleteModal = (id: string) => {
    setMemberIdToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMemberIdToDelete(null);
  };

  const handleEditMember = (member: Member) => {
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
    setSearchTerm(member.invitedFrom || "");
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      await updateMember({ id: editingMember._id, data: editData }).unwrap();
      refetch();
      setEditingMember(null);
    } catch (error) {
      console.error("Failed to update member:", error);
    }
  };

  const handleCreateMember = async () => {
    try {
      await createMember(newMemberData).unwrap();
      refetch();
      setNewMemberData({
        name: "",
        attended: "No",
        organizer: "",
        invitedFrom: "",
        hasLeft: false,
        isStudent: false,
        untilWhen: null,
      });
    } catch (error) {
      console.error("Failed to create member:", error);
    }
  };

  const handleToggleAttendedStatus = async (id: string) => {
    try {
      const newAttendedStatus = !toggleStatuses[id].attended;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], attended: newAttendedStatus },
      }));

      await updateAttendedStatus({
        id,
        attended: newAttendedStatus ? "Yes" : "No",
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update attended status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], attended: !prevState[id].attended },
      }));
    }
  };

  const handleToggleHasLeftStatus = async (id: string) => {
    try {
      const newHasLeftStatus = !toggleStatuses[id].hasLeft;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], hasLeft: newHasLeftStatus },
      }));

      await updateHasLeftStatus({ id, hasLeft: newHasLeftStatus }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update has left status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], hasLeft: !prevState[id].hasLeft },
      }));
    }
  };

  const handleToggleStudentStatus = async (id: string) => {
    try {
      const newStudentStatus = !toggleStatuses[id].isStudent;
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], isStudent: newStudentStatus },
      }));

      await updateStudentStatus({
        id,
        isStudent: newStudentStatus,
        untilWhen: newStudentStatus ? new Date() : null,
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update student status:", error);
      setToggleStatuses((prevState) => ({
        ...prevState,
        [id]: { ...prevState[id], isStudent: !prevState[id].isStudent },
      }));
    }
  };

  const filteredMembers = membersData?.members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const globallyFilteredMembers = membersData?.members.filter((member) =>
    member.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  if (isLoading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-[70vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Spinner xl />
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        className="text-center p-8 rounded-xl bg-red-50 dark:bg-deep-navy border border-red-200 dark:border-red-800/30 shadow-lg max-w-2xl mx-auto my-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          className="w-12 h-12 text-red-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
          Error Loading Members
        </h2>
        <p className="text-red-600 dark:text-red-300">
          We couldn&apos;t retrieve the member data. Please try again later.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-soft-cream to-gray-100 dark:from-deep-navy dark:to-gray-900 transition-colors duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.header
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-soft-cream dark:bg-deep-navy rounded-full p-2">
                <Image
                  src="https://i.imgur.com/MiwxKii.png"
                  alt="PERSiBER Logo"
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-3 gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Member Management
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-rich-gold to-accent-amber rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.header>
        {/* Statistics Summary Cards */}
        {membersData?.statistics && (
          <motion.section
            className="mb-12"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className={`grid ${
                userRole === "admin" || userRole === "master"
                  ? "grid-cols-2 md:grid-cols-4"
                  : "grid-cols-1"
              } gap-4 mb-8`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Total Members card - Only visible to admin and master */}
              {(userRole === "admin" || userRole === "master") && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Members
                    </span>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <svg
                        className="w-4 h-4 text-amber-600 dark:text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-rich-gold">
                    {membersData.statistics.totalCount}
                  </p>
                </motion.div>
              )}

              {/* Attended Members card - Visible to all users */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Attended
                  </span>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-rich-gold">
                  {membersData.statistics.attendedCount}
                </p>
              </motion.div>

              {/* Student and Left Member cards - Only visible to admin and master */}
              {(userRole === "admin" || userRole === "master") && (
                <>
                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Students
                      </span>
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-rich-gold">
                      {membersData.statistics.studentsCount || 0}
                    </p>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Members Left
                      </span>
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <svg
                          className="w-4 h-4 text-orange-600 dark:text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-rich-gold">
                      {membersData.statistics.hasLeftCount || 0}
                    </p>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.section>
        )}
        {/* Control Panel Section */}
        <motion.section
          className="mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
            {/* Search Input */}
            <div>
              <label
                htmlFor="search-members"
                className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
              >
                Search Members
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <motion.input
                  id="search-members"
                  type="text"
                  placeholder="Search by name..."
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
            </div>

            {/* Add Member Form - Admin/Master only */}
            {(userRole === "admin" || userRole === "master") && (
              <motion.div
                className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-xl font-bold mb-4 text-warm-charcoal dark:text-white">
                  Add New Member
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <label
                      htmlFor="member-name"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      Member Name
                    </label>
                    <motion.input
                      id="member-name"
                      type="text"
                      placeholder="Enter name"
                      value={newMemberData.name || ""}
                      onChange={(e) =>
                        setNewMemberData({
                          ...newMemberData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="member-organizer"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      Organizer
                    </label>
                    <motion.select
                      id="member-organizer"
                      value={newMemberData.organizer ?? ""}
                      onChange={(e) =>
                        setNewMemberData({
                          ...newMemberData,
                          organizer: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white transition-all duration-300"
                      whileFocus={{ scale: 1.01 }}
                    >
                      <option value="">Select Organizer</option>
                      <option value="Kourosh">Kourosh</option>
                      <option value="Sobhan">Sobhan</option>
                      <option value="Mutual">Mutual</option>
                    </motion.select>
                  </div>
                </div>

                <div className="mt-5">
                  <motion.button
                    onClick={handleCreateMember}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 5px 15px rgba(212, 175, 55, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Member
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>
        {/* Members List Section */}
        <motion.section
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          {globallyFilteredMembers?.length === 0 ? (
            <motion.div
              className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/50">
                <svg
                  className="w-10 h-10 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-warm-charcoal dark:text-white mb-2">
                No Members Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {globalSearchTerm
                  ? "No members match your search criteria."
                  : "There are currently no members in the system. Add your first member above."}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Desktop Member Table */}
              <div className="hidden md:block overflow-hidden bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50">
                <motion.table
                  className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <thead className="bg-gray-50 dark:bg-gray-800/80">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Attended
                      </th>

                      {/* Only show the following fields for admin or master */}
                      {(userRole === "admin" || userRole === "master") && (
                        <>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Organizer
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Inviter
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Left
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Student
                          </th>
                        </>
                      )}

                      <th
                        scope="col"
                        className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {globallyFilteredMembers?.map((member) => (
                        <motion.tr
                          key={member._id}
                          variants={itemVariants}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden text-gray-700 dark:text-gray-300 font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                  {member.name}
                                </div>
                                {member.isStudent && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    Student
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <motion.button
                              onClick={() =>
                                handleToggleAttendedStatus(member._id)
                              }
                              className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                                toggleStatuses[member._id]?.attended
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                              whileTap={{ scale: 0.95 }}
                            >
                              <motion.span
                                className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                                animate={{
                                  translateX: toggleStatuses[member._id]
                                    ?.attended
                                    ? 24
                                    : 0,
                                }}
                              />
                            </motion.button>
                          </td>

                          {/* Conditionally render additional fields based on userRole */}
                          {(userRole === "admin" || userRole === "master") && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {member.organizer || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {member.invitedFrom || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <motion.button
                                  onClick={() =>
                                    handleToggleHasLeftStatus(member._id)
                                  }
                                  className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                                    toggleStatuses[member._id]?.hasLeft
                                      ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  }`}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <motion.span
                                    className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                                    animate={{
                                      translateX: toggleStatuses[member._id]
                                        ?.hasLeft
                                        ? 24
                                        : 0,
                                    }}
                                  />
                                </motion.button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <motion.button
                                  onClick={() =>
                                    handleToggleStudentStatus(member._id)
                                  }
                                  className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                                    toggleStatuses[member._id]?.isStudent
                                      ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                      : "bg-gray-300 dark:bg-gray-600"
                                  }`}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <motion.span
                                    className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                                    animate={{
                                      translateX: toggleStatuses[member._id]
                                        ?.isStudent
                                        ? 24
                                        : 0,
                                    }}
                                  />
                                </motion.button>
                              </td>
                            </>
                          )}

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {(userRole === "admin" ||
                              userRole === "master") && (
                              <div className="flex justify-end space-x-2">
                                <motion.button
                                  onClick={() => handleEditMember(member)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium text-xs shadow-sm"
                                  whileHover={{
                                    scale: 1.05,
                                    boxShadow:
                                      "0 3px 10px rgba(212, 175, 55, 0.2)",
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  Edit
                                </motion.button>
                                <motion.button
                                  onClick={() => openDeleteModal(member._id)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium text-xs shadow-sm"
                                  whileHover={{
                                    scale: 1.05,
                                    boxShadow:
                                      "0 3px 10px rgba(212, 175, 55, 0.1)",
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  Delete
                                </motion.button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </motion.table>
              </div>

              {/* Mobile Member Cards */}
              <motion.div
                className="md:hidden space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {globallyFilteredMembers?.map((member) => (
                  <motion.div
                    key={member._id}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700/50"
                    exit={{ opacity: 0, height: 0 }}
                    layout
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-300">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {member.name}
                          </h3>
                        </div>
                      </div>
                      <div>
                        <motion.button
                          onClick={() => handleToggleAttendedStatus(member._id)}
                          className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                            toggleStatuses[member._id]?.attended
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                          whileTap={{ scale: 0.95 }}
                          aria-label={
                            toggleStatuses[member._id]?.attended
                              ? "Mark as not attended"
                              : "Mark as attended"
                          }
                        >
                          <motion.span
                            className="absolute bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                            animate={{
                              translateX: toggleStatuses[member._id]?.attended
                                ? 24
                                : 0,
                            }}
                          />
                        </motion.button>
                      </div>
                    </div>

                    {/* Conditionally render additional member details */}
                    {(userRole === "admin" || userRole === "master") && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Organizer
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {member.organizer || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Inviter
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {member.invitedFrom || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Left
                          </span>
                          <motion.button
                            onClick={() =>
                              handleToggleHasLeftStatus(member._id)
                            }
                            className={`relative w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                              toggleStatuses[member._id]?.hasLeft
                                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.span
                              className="absolute bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300"
                              animate={{
                                translateX: toggleStatuses[member._id]?.hasLeft
                                  ? 20
                                  : 0,
                              }}
                            />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Student
                          </span>
                          <motion.button
                            onClick={() =>
                              handleToggleStudentStatus(member._id)
                            }
                            className={`relative w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                              toggleStatuses[member._id]?.isStudent
                                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.span
                              className="absolute bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300"
                              animate={{
                                translateX: toggleStatuses[member._id]
                                  ?.isStudent
                                  ? 20
                                  : 0,
                              }}
                            />
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {/* Admin/Master actions */}
                    {(userRole === "admin" || userRole === "master") && (
                      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/30">
                        <motion.button
                          onClick={() => handleEditMember(member)}
                          className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium text-sm shadow-sm flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => openDeleteModal(member._id)}
                          className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium text-sm shadow-sm flex items-center justify-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.section>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <Modal
            isOpen={showDeleteModal}
            onClose={closeDeleteModal}
            title="Confirm Deletion"
          >
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-warm-charcoal dark:text-white mb-2">
                  Delete Member
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this member? This action
                  cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <motion.button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-warm-charcoal dark:text-white font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeleteMember}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-md"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 5px 15px rgba(212, 175, 55, 0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Yes, Delete
                </motion.button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Member Modal */}
      <AnimatePresence>
        {editingMember && (
          <Modal
            isOpen={!!editingMember}
            onClose={() => setEditingMember(null)}
            title="Edit Member Information"
          >
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                <label
                  htmlFor="memberName"
                  className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                >
                  Member Name
                </label>
                <motion.input
                  id="memberName"
                  type="text"
                  placeholder="Name"
                  value={editData.name ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="organizer"
                  className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                >
                  Organizer
                </label>
                <motion.input
                  id="organizer"
                  type="text"
                  placeholder="Organizer"
                  value={editData.organizer ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, organizer: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>

              <div className="space-y-2 relative">
                <label
                  htmlFor="invitedFromSearch"
                  className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                >
                  Invited From
                </label>
                <motion.input
                  id="invitedFromSearch"
                  type="text"
                  placeholder="Search for member..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(e.target.value !== "");
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber transition-all duration-300 text-warm-charcoal dark:text-white"
                  whileFocus={{ scale: 1.01 }}
                />

                {/* Dropdown suggestions using filteredMembers */}
                {showDropdown &&
                  filteredMembers &&
                  filteredMembers.length > 0 && (
                    <motion.div
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {filteredMembers.map((member) => (
                        <button
                          key={member._id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm transition-colors duration-150"
                          onClick={() => {
                            setEditData({
                              ...editData,
                              invitedFrom: member.name,
                            });
                            setSearchTerm(member.name);
                            setShowDropdown(false);
                          }}
                        >
                          {member.name}
                        </button>
                      ))}
                    </motion.div>
                  )}

                <input
                  type="hidden"
                  value={editData.invitedFrom ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, invitedFrom: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Attended Status */}
                <div className="space-y-2">
                  <label
                    htmlFor="attendedStatus"
                    className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                  >
                    Attended Status
                  </label>
                  <select
                    id="attendedStatus"
                    value={editData.attended ?? "No"}
                    onChange={(e) =>
                      setEditData({ ...editData, attended: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-warm-charcoal dark:text-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Left Status Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="hasLeft"
                      className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                    >
                      Has Left
                    </label>
                    <motion.button
                      onClick={() =>
                        setEditData({ ...editData, hasLeft: !editData.hasLeft })
                      }
                      className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        editData.hasLeft
                          ? "bg-gradient-to-r from-rich-gold to-accent-amber"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      whileTap={{ scale: 0.95 }}
                      aria-label={
                        editData.hasLeft ? "Set as not left" : "Set as left"
                      }
                    >
                      <motion.span
                        className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                        animate={{
                          translateX: editData.hasLeft ? 26 : 0,
                        }}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Student Status and Date Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="isStudent"
                      className="text-sm font-medium text-warm-charcoal dark:text-gray-300"
                    >
                      Student
                    </label>
                    <motion.button
                      onClick={() =>
                        setEditData({
                          ...editData,
                          isStudent: !editData.isStudent,
                        })
                      }
                      className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                        editData.isStudent
                          ? "bg-gradient-to-r from-rich-gold to-accent-amber"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      whileTap={{ scale: 0.95 }}
                      aria-label={
                        editData.isStudent
                          ? "Set as not student"
                          : "Set as student"
                      }
                    >
                      <motion.span
                        className="absolute bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300"
                        animate={{
                          translateX: editData.isStudent ? 26 : 0,
                        }}
                      />
                    </motion.button>
                  </div>
                </div>

                {editData.isStudent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="validUntil"
                      className="block text-sm font-medium text-warm-charcoal dark:text-gray-300"
                    >
                      Valid Until
                    </label>
                    <input
                      id="validUntil"
                      type="date"
                      value={
                        editData.untilWhen
                          ? new Date(editData.untilWhen)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const parsedDate = new Date(e.target.value);
                        setEditData({
                          ...editData,
                          untilWhen: isNaN(parsedDate.getTime())
                            ? null
                            : parsedDate,
                        });
                      }}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold transition-all duration-300 text-warm-charcoal dark:text-white"
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <motion.button
                  onClick={handleUpdateMember}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Changes
                </motion.button>
                <motion.button
                  onClick={() => setEditingMember(null)}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-warm-charcoal dark:text-white font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Enhanced Visual Footer */}
      <motion.footer
        className="mt-20 mb-8 text-center opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-rich-gold/20 to-transparent mb-6"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The member management system tracks attendance, status, and
            membership details to ensure a premium experience for all members.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500">
              <svg
                className="w-4 h-4 mr-1 text-rich-gold/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Member creation
            </span>
            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500">
              <svg
                className="w-4 h-4 mr-1 text-rich-gold/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Attendance tracking
            </span>
            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500">
              <svg
                className="w-4 h-4 mr-1 text-rich-gold/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure data
            </span>
            <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-500">
              <svg
                className="w-4 h-4 mr-1 text-rich-gold/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Student status tracking
            </span>
          </div>
        </div>
      </motion.footer>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-[10%] w-64 h-64 bg-rich-gold/5 rounded-full blur-3xl transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-[10%] w-96 h-96 bg-accent-amber/5 rounded-full blur-3xl transform translate-y-1/2"></div>
        <div className="absolute top-1/3 right-[15%] w-48 h-48 bg-rich-gold/5 rounded-full blur-2xl"></div>
      </div>
    </motion.div>
  );
}
