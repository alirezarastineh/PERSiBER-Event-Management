"use client";

import Image from "next/image";
import Heading from "../utils/Heading";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks"; // Import the Redux hook

export default function LandingPage() {
  // Get authentication state from Redux
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Heading title="PERSiBER" />

      <section className="relative flex-grow flex flex-col items-center justify-center px-6 md:px-12">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#1a1a2e] dark:to-[#151523]"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl"></div>
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5"></div>
        </div>

        <motion.div
          className="relative z-10 max-w-6xl w-full mx-auto py-12 md:py-20 lg:py-28"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content Column */}
            <motion.div
              className="order-2 lg:order-1 space-y-8"
              variants={itemVariants}
            >
              <motion.div
                className="h-1 w-20 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ delay: 1, duration: 0.6 }}
              />

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight gradient-text"
                variants={itemVariants}
              >
                PERSiBER Event Management
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed"
                variants={itemVariants}
              >
                Welcome to the PERSiBER Event Management System. A premium
                solution for organizing and managing your events with elegance.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-6 pt-4"
                variants={itemVariants}
              >
                {/* Modified Link to conditionally redirect based on auth state */}
                <Link
                  href={
                    isAuthenticated ? "/guests" : "/auth/login?redirect=/guests"
                  }
                  passHref
                >
                  <motion.a
                    className="px-8 py-4 bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy dark:text-deep-navy rounded-md font-medium text-lg inline-flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(212, 175, 55, 0.25)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.a>
                </Link>
              </motion.div>
            </motion.div>

            {/* Image Column with enhanced styling */}
            <motion.div
              className="order-1 lg:order-2 flex justify-center items-center"
              variants={itemVariants}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="p-5">
                  <Image
                    src="https://i.imgur.com/MiwxKii.png"
                    alt="PERSiBER Logo"
                    width={300}
                    height={300}
                    className="object-contain w-44 h-44 md:w-64 md:h-64"
                    sizes="(max-width: 768px) 176px, 256px"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Features Section with enhanced styling */}
          <motion.div
            className="mt-24 lg:mt-32"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Event Planning",
                  desc: "Seamlessly plan and schedule your events",
                  icon: "📅",
                },
                {
                  title: "Guest Management",
                  desc: "Efficiently manage attendee lists and invitations",
                  icon: "👥",
                },
                {
                  title: "Analytics",
                  desc: "Comprehensive insights and reporting tools",
                  icon: "📊",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm p-8 rounded-xl border border-gray-100 dark:border-gray-700/20 shadow-sm flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.2, duration: 0.5 }}
                  whileHover={{
                    y: -8,
                    boxShadow:
                      "0 15px 30px rgba(0,0,0,0.05), 0 5px 15px rgba(212, 175, 55, 0.1)",
                    borderColor: "rgba(212, 175, 55, 0.3)",
                    transition: { duration: 0.3 },
                  }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}
