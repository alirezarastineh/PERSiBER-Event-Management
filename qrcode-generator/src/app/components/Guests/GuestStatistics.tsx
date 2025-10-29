import { motion } from "framer-motion";
import StatisticsCard from "../Common/StatisticsCard";
import { GuestStatisticsProps } from "@/types/guests";

export default function GuestStatistics({
  statistics,
  userRole,
  variants,
}: Readonly<GuestStatisticsProps>) {
  const iconComponents = {
    users: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    check: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    book: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    user: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  const isAdminOrMaster = userRole === "admin" || userRole === "master";

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <StatisticsCard
        title="Total Guests"
        value={statistics.totalCount}
        icon={iconComponents.users}
        iconBgColor="bg-amber-900/30"
        iconColor="text-amber-400"
        variants={variants}
      />

      <StatisticsCard
        title="Attended"
        value={statistics.attendedCount}
        icon={iconComponents.check}
        iconBgColor="bg-green-900/30"
        iconColor="text-green-400"
        variants={variants}
      />

      {isAdminOrMaster && (
        <>
          <StatisticsCard
            title="Students"
            value={statistics.studentsCount ?? 0}
            icon={iconComponents.book}
            iconBgColor="bg-blue-900/30"
            iconColor="text-blue-400"
            variants={variants}
          />

          <StatisticsCard
            title="Ladies"
            value={statistics.ladiesCount ?? 0}
            icon={iconComponents.user}
            iconBgColor="bg-pink-900/30"
            iconColor="text-pink-400"
            variants={variants}
          />
        </>
      )}
    </motion.div>
  );
}
