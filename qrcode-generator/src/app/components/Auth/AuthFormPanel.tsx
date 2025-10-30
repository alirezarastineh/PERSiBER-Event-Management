import { motion } from "framer-motion";
import Image from "next/image";
import Form from "../Forms/Form";
import { AuthFormPanelProps } from "@/types/auth";

export default function AuthFormPanel({
  title,
  subtitle,
  formConfig,
  isLoading,
  btnText,
  onSubmit,
  onChange,
}: Readonly<AuthFormPanelProps>) {
  return (
    <motion.div
      className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-16 bg-deep-navy relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-amber/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-rich-gold/10 blur-3xl"></div>
      </div>

      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="text-center mb-10">
          <motion.div
            className="inline-block mb-4 lg:hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Image
              src="https://i.imgur.com/MiwxKii.png"
              alt="PERSiBER Logo"
              width={100}
              height={100}
              loading="lazy"
              style={{ width: "auto", height: "auto" }}
            />
          </motion.div>

          <motion.h2
            className="text-3xl font-bold mb-2 text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {title}
          </motion.h2>

          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-gray-800 rounded-2xl p-8 shadow-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-rich-gold to-accent-amber rounded-t-2xl"></div>

          <Form
            config={formConfig}
            isLoading={isLoading}
            btnText={btnText}
            onSubmit={onSubmit}
            onChange={onChange}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
