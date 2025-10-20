import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MobileNavItem } from "./NavItem";
import { MobileMenuProps } from "@/types/navigation";

export default function MobileMenu({
  isMenuOpen,
  closeMenu,
  isAuthenticated,
  user,
  isAdminOrMaster,
  isActive,
  handleMenuItemClick,
  handleQRRedirect,
  handleRegisterRedirect,
  handleUsersRedirect,
  handleScannerRedirect,
  handleGuestsRedirect,
  handleMembersRedirect,
  handleBppListRedirect,
  handleLogout,
  handleLoginRedirect,
}: Readonly<MobileMenuProps>) {
  const menuVariants = {
    hidden: {
      x: "100%",
      opacity: 0,
      transition: { type: "tween" as const, duration: 0.25 },
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.aside
            className="fixed top-0 right-0 h-full w-[80%] max-w-sm z-50 lg:hidden"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-zinc-900/95 backdrop-blur-xl border-l border-amber-500/10 shadow-2xl" />

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] right-[-20%] w-72 h-72 rounded-full bg-amber-500/5 blur-3xl" />
              <div className="absolute bottom-[-10%] left-[-20%] w-60 h-60 rounded-full bg-amber-600/5 blur-3xl" />
            </div>

            {/* Menu content */}
            <div className="relative h-full flex flex-col">
              {/* Menu header */}
              <motion.div
                className="flex justify-between items-center p-5 border-b border-amber-500/10"
                variants={itemVariants}
              >
                <div className="flex items-center">
                  <div className="size-10 flex items-center justify-center">
                    <Image
                      src="https://i.imgur.com/MiwxKii.png"
                      alt="PERSiBER Logo"
                      width={30}
                      height={30}
                      className="object-contain"
                      loading="lazy"
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                </div>

                <motion.button
                  onClick={closeMenu}
                  className="size-16 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ backgroundColor: "transparent", boxShadow: "none" }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isMenuOpen ? 1 : 0,
                    transition: { duration: 0.3 },
                  }}
                >
                  <svg
                    className="size-28 text-amber-500/80"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                      initial={{ pathLength: 0 }}
                      animate={{
                        pathLength: isMenuOpen ? 1 : 0,
                        transition: { duration: 0.4, ease: "easeInOut" },
                      }}
                    />
                  </svg>
                </motion.button>
              </motion.div>

              {/* Menu items */}
              <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {/* User info card */}
                    <motion.div
                      className="mb-4 p-4 rounded-xl bg-zinc-800/50 border border-amber-500/10"
                      variants={itemVariants}
                    >
                      <div className="flex items-center">
                        <div className="size-10 rounded-full bg-zinc-700/70 border border-amber-500/20 flex items-center justify-center">
                          <svg
                            className="size-5 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-amber-500 font-medium">{user?.username ?? "User"}</p>
                          <p className="text-xs text-gray-400">
                            {user?.role
                              ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                              : "User"}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Admin-only menu items */}
                    {isAdminOrMaster && (
                      <>
                        <MobileNavItem
                          icon={
                            <svg
                              className="size-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                              />
                            </svg>
                          }
                          label="QR Codes"
                          onClick={() => handleMenuItemClick(handleQRRedirect)}
                          isActive={isActive("/admin/qrcode")}
                          variants={itemVariants}
                        />

                        <MobileNavItem
                          icon={
                            <svg
                              className="size-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                              />
                            </svg>
                          }
                          label="Register"
                          onClick={() => handleMenuItemClick(handleRegisterRedirect)}
                          isActive={isActive("/auth/register")}
                          variants={itemVariants}
                        />

                        <MobileNavItem
                          icon={
                            <svg
                              className="size-5"
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
                          }
                          label="Users"
                          onClick={() => handleMenuItemClick(handleUsersRedirect)}
                          isActive={isActive("/admin/users")}
                          variants={itemVariants}
                        />
                      </>
                    )}

                    {/* Common menu items */}
                    <MobileNavItem
                      icon={
                        <svg
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      }
                      label="Scanner"
                      onClick={() => handleMenuItemClick(handleScannerRedirect)}
                      isActive={isActive("/scanner")}
                      variants={itemVariants}
                    />

                    <MobileNavItem
                      icon={
                        <svg
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      }
                      label="Guests"
                      onClick={() => handleMenuItemClick(handleGuestsRedirect)}
                      isActive={isActive("/guests")}
                      variants={itemVariants}
                    />

                    <MobileNavItem
                      icon={
                        <svg
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      }
                      label="Members"
                      onClick={() => handleMenuItemClick(handleMembersRedirect)}
                      isActive={isActive("/members")}
                      variants={itemVariants}
                    />

                    <MobileNavItem
                      icon={
                        <svg
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      }
                      label="BPP List"
                      onClick={() => handleMenuItemClick(handleBppListRedirect)}
                      isActive={isActive("/bpplist")}
                      variants={itemVariants}
                    />
                  </div>
                ) : (
                  <motion.button
                    onClick={() => handleMenuItemClick(handleLoginRedirect)}
                    className="w-full flex items-center p-4 mb-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-medium"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg
                      className="size-5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Login to Account
                  </motion.button>
                )}
              </div>

              {/* Footer with logout button */}
              {isAuthenticated && (
                <motion.div
                  className="mt-auto p-4 border-t border-amber-500/10"
                  variants={itemVariants}
                >
                  <motion.button
                    onClick={() => handleMenuItemClick(handleLogout)}
                    className="w-full flex items-center justify-center p-4 rounded-xl bg-gradient-to-r from-rose-800/80 to-red-900/80 text-rose-100 font-medium border border-rose-800/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg
                      className="size-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
