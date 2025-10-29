import { motion } from "framer-motion";
import { GuestDetailHeaderProps } from "@/types/guests";

export default function GuestDetailHeader({ guestName }: Readonly<GuestDetailHeaderProps>) {
  return (
    <motion.header
      className="mb-12 text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-3 gradient-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        {guestName}
      </motion.h1>

      <motion.div
        className="h-1 w-24 bg-gradient-to-r from-rich-gold to-accent-amber rounded-full mx-auto"
        initial={{ width: 0 }}
        animate={{ width: 96 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      />
    </motion.header>
  );
}
