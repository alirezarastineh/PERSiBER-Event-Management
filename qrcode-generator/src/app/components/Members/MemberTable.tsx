import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MemberTableProps } from "@/types/members";
import ToggleSwitch from "../Common/ToggleSwitch";

export default function MemberTable({
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
}: Readonly<MemberTableProps>) {
  const isAdminOrMaster = userRole === "admin" || userRole === "master";

  return (
    <div className="hidden md:block overflow-hidden bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50">
      <motion.table
        className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <thead className="bg-gray-50 dark:bg-gray-800/80">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Attended
            </th>
            {isAdminOrMaster && (
              <>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Inviter
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Left
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
              </>
            )}
            {isAdminOrMaster && (
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          <AnimatePresence>
            {members.map((member) => (
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
                </td>
                {isAdminOrMaster && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {member.organizer || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {member.invitedFrom || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                    </td>
                  </>
                )}
                {isAdminOrMaster && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <motion.button
                        onClick={() => onEditMember(member)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium text-xs shadow-sm"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 3px 10px rgba(212, 175, 55, 0.2)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => onDeleteMember(member._id)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium text-xs shadow-sm"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 3px 10px rgba(212, 175, 55, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </motion.table>
    </div>
  );
}
