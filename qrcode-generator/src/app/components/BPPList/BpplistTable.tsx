import { motion, AnimatePresence } from "framer-motion";
import { BpplistTableProps } from "@/types/bpplist";
import ToggleSwitch from "../Common/ToggleSwitch";

export default function BpplistTable({
  items,
  toggleStatuses,
  onToggleAttendedStatus,
  onToggleHasLeftStatus,
  onToggleStudentStatus,
  onEditItem,
  onDeleteItem,
  userRole,
  variants,
  itemVariants,
}: Readonly<BpplistTableProps>) {
  const isAdminOrMaster = userRole === "admin" || userRole === "master";

  return (
    <div className="hidden md:block overflow-hidden bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700/50">
      <motion.table
        className="min-w-full divide-y divide-gray-700"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <thead className="bg-gray-800/80">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Attended
            </th>
            {isAdminOrMaster && (
              <>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Inviter
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Left
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Student
                </th>
              </>
            )}
            {isAdminOrMaster && (
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          <AnimatePresence>
            {items.map((item) => (
              <motion.tr
                key={item._id}
                variants={itemVariants}
                className="hover:bg-gray-700/30 transition-colors duration-150"
                exit={{ opacity: 0, height: 0 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden text-gray-300 font-medium">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-medium text-gray-200">{item.name}</div>
                      {item.isStudent && (
                        <span className="text-blue-300 px-2 py-0.5 rounded-full bg-blue-900/30">
                          Student
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <ToggleSwitch
                    isActive={toggleStatuses[item._id]?.attended}
                    onToggle={() => onToggleAttendedStatus(item._id)}
                    size="sm"
                    ariaLabel={
                      toggleStatuses[item._id]?.attended
                        ? "Mark as not attended"
                        : "Mark as attended"
                    }
                  />
                </td>
                {isAdminOrMaster && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.organizer || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.invitedFrom || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <ToggleSwitch
                        isActive={toggleStatuses[item._id]?.hasLeft}
                        onToggle={() => onToggleHasLeftStatus(item._id)}
                        size="sm"
                        ariaLabel={
                          toggleStatuses[item._id]?.hasLeft ? "Mark as not left" : "Mark as left"
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <ToggleSwitch
                        isActive={toggleStatuses[item._id]?.isStudent}
                        onToggle={() => onToggleStudentStatus(item._id)}
                        size="sm"
                        ariaLabel={
                          toggleStatuses[item._id]?.isStudent
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
                        onClick={() => onEditItem(item)}
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
                        onClick={() => onDeleteItem(item._id)}
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
