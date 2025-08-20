import React from "react";
import { motion } from "framer-motion";
import { DesktopNavItem } from "./NavItem";
import { DesktopNavigationProps } from "@/types/navigation";

export default function DesktopNavigation({
  isAuthenticated,
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
}: Readonly<DesktopNavigationProps>) {
  const desktopItemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
  };

  return (
    <div className="hidden lg:block">
      <motion.div
        className="flex items-center gap-1"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.2,
            },
          },
        }}
      >
        {isAuthenticated ? (
          <>
            {/* Admin/Master only navigation */}
            {isAdminOrMaster && (
              <>
                <DesktopNavItem
                  icon={
                    <svg
                      className="size-4.5"
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
                  variants={desktopItemVariants}
                />

                <DesktopNavItem
                  icon={
                    <svg
                      className="size-4.5"
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
                  variants={desktopItemVariants}
                />

                <DesktopNavItem
                  icon={
                    <svg
                      className="size-4.5"
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
                  variants={desktopItemVariants}
                />

                <div className="h-8 w-px mx-2 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />
              </>
            )}

            {/* Common navigation items */}
            <DesktopNavItem
              icon={
                <svg
                  className="size-4.5"
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
              variants={desktopItemVariants}
            />

            <DesktopNavItem
              icon={
                <svg
                  className="size-4.5"
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
              variants={desktopItemVariants}
            />

            <DesktopNavItem
              icon={
                <svg
                  className="size-4.5"
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
              variants={desktopItemVariants}
            />

            <DesktopNavItem
              icon={
                <svg
                  className="size-4.5"
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
              variants={desktopItemVariants}
            />

            <div className="h-8 w-px mx-2 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />

            {/* Logout button */}
            <motion.button
              onClick={handleLogout}
              className="relative px-4 py-2 rounded-lg overflow-hidden group"
              variants={desktopItemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-rose-800/90 to-red-900/90 rounded-lg" />
              <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 bg-gradient-to-r from-rose-700 to-red-800 blur-md transition-opacity duration-300" />
              <span className="relative flex items-center text-rose-100">
                <svg
                  className="size-4.5 mr-1.5"
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
                <span className="text-sm font-medium">Logout</span>
              </span>
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={handleLoginRedirect}
            className="relative px-5 py-2.5 rounded-lg overflow-hidden group"
            variants={desktopItemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg" />
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-40 bg-gradient-to-r from-amber-400 to-amber-600 blur-md transition-opacity duration-300" />
            <span className="relative flex items-center text-zinc-900 font-medium">
              <svg
                className="size-4.5 mr-1.5"
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
              Login
            </span>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
