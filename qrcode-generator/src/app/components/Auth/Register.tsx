"use client";

import useRegister from "@/app/hooks/use-register";
import Form from "../Forms/Form";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Register() {
  const { username, password, isLoading, onChange, onSubmit } = useRegister();

  const formConfig = [
    {
      label: "Username",
      labelId: "username",
      type: "text",
      value: username,
      onChange,
      required: true,
    },
    {
      label: "Password",
      labelId: "password",
      type: "password",
      value: password,
      onChange,
      required: true,
    },
  ];

  return (
    <motion.div
      className="min-h-screen flex w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Left panel - decorative */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-deep-navy to-warm-charcoal z-0">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full h-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <Image
                src="https://i.imgur.com/MiwxKii.png"
                alt="PERSiBER Logo"
                width={160}
                height={160}
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Join PERSiBER Today
            </h2>
            <p className="text-gray-300 max-w-md mx-auto">
              Create your account to access the premium event management
              platform trusted by professionals worldwide.
            </p>

            <div className="mt-12 space-y-8">
              {[
                { id: "feature-create", text: "One-Click Event Creation" },
                {
                  id: "feature-analytics",
                  text: "Detailed Analytics Dashboard",
                },
                { id: "feature-support", text: "Premium Support" },
                { id: "feature-security", text: "Advanced Security Features" },
              ].map((feature, i) => (
                <motion.div
                  key={feature.id}
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                >
                  <div className="w-6 h-6 rounded-full bg-rich-gold flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-deep-navy"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-200">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right panel - registration form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-16 bg-soft-cream dark:bg-deep-navy relative"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-amber/5 dark:bg-accent-amber/10 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-rich-gold/5 dark:bg-rich-gold/10 blur-3xl"></div>
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
                priority
              />
            </motion.div>

            <motion.h2
              className="text-3xl font-bold mb-2 text-warm-charcoal dark:text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Create Account
            </motion.h2>

            <motion.p
              className="text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Register an user to manage your event
            </motion.p>
          </div>

          {/* Form Card */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rich-gold to-accent-amber rounded-t-2xl"></div>

            <Form
              config={formConfig}
              isLoading={isLoading}
              btnText="Create Account"
              onSubmit={onSubmit}
              onChange={onChange}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
