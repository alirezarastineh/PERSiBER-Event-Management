import { motion } from "framer-motion";

export default function UserEmptyState() {
  return (
    <motion.div
      className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl border border-gray-700/50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-700/50">
        <svg
          className="w-10 h-10 text-gray-500"
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
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">No Users Found</h2>
      <p className="text-gray-400 max-w-md mx-auto">
        There are currently no users in the system. Users will appear here once they are added.
      </p>
    </motion.div>
  );
}
