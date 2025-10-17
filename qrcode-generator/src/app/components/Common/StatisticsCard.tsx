import React from "react";
import { motion } from "framer-motion";
import { StatisticsCardProps } from "@/types/common";

export default function StatisticsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  variants,
}: Readonly<StatisticsCardProps>) {
  return (
    <motion.div
      variants={variants}
      className="bg-white dark:bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/30"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
        <span className={`flex items-center justify-center w-8 h-8 rounded-full ${iconBgColor}`}>
          <div className={`w-4 h-4 ${iconColor}`}>{icon}</div>
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold text-rich-gold">{value}</p>
    </motion.div>
  );
}
