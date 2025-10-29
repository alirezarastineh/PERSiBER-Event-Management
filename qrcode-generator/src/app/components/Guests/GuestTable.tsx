import { motion, AnimatePresence } from "framer-motion";
import { GuestTableProps } from "@/types/guests";
import ToggleSwitch from "../Common/ToggleSwitch";

export default function GuestTable({
  guests,
  attendedStatuses,
  onToggleAttendedStatus,
  onEditGuest,
  onDeleteGuest,
  onNavigateToDetail,
  userRole,
  variants,
  itemVariants,
}: Readonly<GuestTableProps>) {
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
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Attended At
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Drinks Coupon
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Added By
            </th>
            {isAdminOrMaster && (
              <>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Inviter
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Lady
                </th>
              </>
            )}
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Free Entry
            </th>
            {isAdminOrMaster && (
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          <AnimatePresence>
            {guests.map((guest) => (
              <motion.tr
                key={guest._id}
                variants={itemVariants}
                className="hover:bg-gray-700/30 transition-colors duration-150"
                exit={{ opacity: 0, height: 0 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <motion.span
                    onClick={() => onNavigateToDetail(guest._id)}
                    className="cursor-pointer text-white hover:text-accent-amber transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {guest.name}
                  </motion.span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <ToggleSwitch
                    isActive={attendedStatuses[guest._id]}
                    onToggle={() => onToggleAttendedStatus(guest._id)}
                    size="sm"
                    ariaLabel={
                      attendedStatuses[guest._id] ? "Mark as not attended" : "Mark as attended"
                    }
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {guest.attendedAt && guest.attended === "Yes"
                    ? new Date(guest.attendedAt).toLocaleString()
                    : "Not attended"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {guest.drinksCoupon || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {guest.addedBy ?? "N/A"}
                </td>

                {isAdminOrMaster && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {guest.invitedFrom || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          guest.isStudent
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {guest.isStudent ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          guest.isLady
                            ? "bg-pink-900/30 text-pink-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {guest.isLady ? "Yes" : "No"}
                      </span>
                    </td>
                  </>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      guest.freeEntry
                        ? "bg-amber-900/30 text-amber-300"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {guest.freeEntry ? "Yes" : "No"}
                  </span>
                </td>
                {isAdminOrMaster && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <motion.button
                        onClick={() => onEditGuest(guest)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium text-xs shadow-sm"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 3px 10px rgba(212, 175, 55, 0.2)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        disabled={guest.name === "Master"}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => onDeleteGuest(guest._id)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium text-xs shadow-sm"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 3px 10px rgba(212, 175, 55, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        disabled={guest.name === "Master"}
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
