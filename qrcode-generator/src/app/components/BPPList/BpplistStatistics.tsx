import React from "react";
import { motion } from "framer-motion";
import StatisticsCard from "../Common/StatisticsCard";
import { BpplistStatisticsProps } from "@/types/bpplist";

export default function BpplistStatistics({
  statistics,
  userRole,
  variants,
}: Readonly<BpplistStatisticsProps>) {
  const iconComponents = {
    users: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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
    exit: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
    ),
  };

  const isAdminOrMaster = userRole === "admin" || userRole === "master";

  return (
    <motion.section
      className="mb-12"
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={`grid ${
          isAdminOrMaster ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1"
        } gap-4 mb-8`}
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        {/* Total BPP Attendees card - Only visible to admin and master */}
        {isAdminOrMaster && (
          <StatisticsCard
            title="Total BPP Attendees"
            value={statistics.totalCount}
            icon={iconComponents.users}
            iconBgColor="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
            variants={variants}
          />
        )}

        {/* Attended BPP Members card - Visible to all users */}
        <StatisticsCard
          title="Attended BPP Members"
          value={statistics.attendedCount}
          icon={iconComponents.check}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          variants={variants}
        />

        {/* Student and Left BPP Member cards - Only visible to admin and master */}
        {isAdminOrMaster && (
          <>
            <StatisticsCard
              title="Students Count"
              value={statistics.studentsCount ?? 0}
              icon={iconComponents.book}
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
              variants={variants}
            />

            <StatisticsCard
              title="Left BPP Count"
              value={statistics.hasLeftCount ?? 0}
              icon={iconComponents.exit}
              iconBgColor="bg-orange-100 dark:bg-orange-900/30"
              iconColor="text-orange-600 dark:text-orange-400"
              variants={variants}
            />
          </>
        )}
      </motion.div>
    </motion.section>
  );
}
