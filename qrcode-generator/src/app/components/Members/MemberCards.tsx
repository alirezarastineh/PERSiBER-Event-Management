import React from "react";
import { motion } from "framer-motion";
import { MemberCardsProps } from "@/types/members";
import ToggleSwitch from "../Common/ToggleSwitch";

export default function MemberCards({
  members,
  toggleStatuses,
  onToggleAttendedStatus,
  onToggleHasLeftStatus,
  onToggleStudentStatus,
  onEditMember,
  onDeleteMember,
  userRole,
  variants,
  itemVariants,
}: Readonly<MemberCardsProps>) {
  const isAdminOrMaster = userRole === "admin" || userRole === "master";

  return (
    <motion.div
      className="md:hidden space-y-4"
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {members.map((member) => (
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
                {member.isStudent && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Student
                  </span>
                )}
              </div>
            </div>
            <div>
              <ToggleSwitch
                isActive={toggleStatuses[member._id]?.attended}
                onToggle={() => onToggleAttendedStatus(member._id)}
                size="sm"
                ariaLabel={
                  toggleStatuses[member._id]?.attended
                    ? "Mark as not attended"
                    : "Mark as attended"
                }
              />
            </div>
          </div>

          {/* Conditionally render additional member details */}
          {isAdminOrMaster && (
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
                <ToggleSwitch
                  isActive={toggleStatuses[member._id]?.hasLeft}
                  onToggle={() => onToggleHasLeftStatus(member._id)}
                  size="sm"
                  ariaLabel={
                    toggleStatuses[member._id]?.hasLeft
                      ? "Mark as not left"
                      : "Mark as left"
                  }
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Student
                </span>
                <ToggleSwitch
                  isActive={toggleStatuses[member._id]?.isStudent}
                  onToggle={() => onToggleStudentStatus(member._id)}
                  size="sm"
                  ariaLabel={
                    toggleStatuses[member._id]?.isStudent
                      ? "Mark as not student"
                      : "Mark as student"
                  }
                />
              </div>
            </div>
          )}

          {/* Admin/Master actions */}
          {isAdminOrMaster && (
            <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/30">
              <motion.button
                onClick={() => onEditMember(member)}
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
                onClick={() => onDeleteMember(member._id)}
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
  );
}
