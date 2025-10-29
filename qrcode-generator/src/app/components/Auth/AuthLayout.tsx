import { motion } from "framer-motion";
import { AuthLayoutProps } from "@/types/auth";

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <motion.div
      className="min-h-screen flex w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
