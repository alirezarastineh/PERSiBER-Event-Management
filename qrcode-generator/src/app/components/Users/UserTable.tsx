import { motion, AnimatePresence } from "framer-motion";
import { UserTableProps } from "@/types/auth";

export default function UserTable({
  users,
  canEditUser,
  canDeleteUser,
  getRoleBadgeClass,
  onEditUser,
  onDeleteUser,
  containerVariants,
  itemVariants,
}: Readonly<UserTableProps>) {
  return (
    <motion.div
      className="hidden md:block overflow-hidden bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700/70">
            <th className="px-6 py-5 text-left text-sm font-semibold text-white">Username</th>
            <th className="px-6 py-5 text-left text-sm font-semibold text-white">Role</th>
            <th className="px-6 py-5 text-right text-sm font-semibold text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {users.map((user) => (
              <motion.tr
                key={user._id}
                variants={itemVariants}
                className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors duration-200"
                exit={{ opacity: 0, height: 0 }}
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-medium text-gray-200">{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                      user.role,
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right">
                  <div className="flex justify-end space-x-3">
                    {canEditUser(user.role) && (
                      <motion.button
                        onClick={() => onEditUser(user._id, user.role)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-rich-gold/90 to-accent-amber text-deep-navy font-medium shadow-sm"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 5px 15px rgba(212, 175, 55, 0.3)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Edit Role
                      </motion.button>
                    )}

                    {canDeleteUser(user.role) && (
                      <motion.button
                        onClick={() => onDeleteUser(user._id)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-warm-charcoal to-deep-navy text-soft-cream border border-rich-gold/30 font-medium shadow-sm"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 5px 15px rgba(212, 175, 55, 0.2)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Delete
                      </motion.button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </motion.div>
  );
}
