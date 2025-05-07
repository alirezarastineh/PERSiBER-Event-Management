"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Navigation functions
  const handleLoginRedirect = () => router.push("/auth/login");
  const handleRegisterRedirect = () => router.push("/auth/register");
  const handleUsersRedirect = () => router.push("/admin/users");
  const handleGuestsRedirect = () => router.push("/guests");
  const handleMembersRedirect = () => router.push("/members");
  const handleBppListRedirect = () => router.push("/bpplist");
  const handleQRRedirect = () => router.push("/admin/qrcode");
  const handleScannerRedirect = () => router.push("/scanner");

  const handleLogout = () => {
    dispatch(logout());
    router.push("/auth/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Check if a path is active
  const isActive = (path: string) => pathname === path;

  // Handle menu item click
  const handleMenuItemClick = (redirectFunction: () => void) => {
    redirectFunction();
    closeMenu();
  };

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    // Handle scroll for navbar appearance change
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    // Control body scroll when mobile menu is open
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Clean up event listeners
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "";
    };
  }, [navbarRef, isMenuOpen]); // Added isMenuOpen as dependency

  // Animation variants
  const navbarVariants = {
    initial: { y: -100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        delay: 0.2,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const glowVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 0.6, 0],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop" as const,
      },
    },
  };

  const menuVariants = {
    hidden: {
      x: "100%",
      opacity: 0,
      transition: { type: "tween", duration: 0.25 },
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
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
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  const desktopItemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <>
      {/* Main content spacing fix - this pushes content below the navbar */}
      <div className="h-20" />

      {/* Navbar */}
      <motion.header
        ref={navbarRef}
        className="fixed top-0 left-0 right-0 z-50"
        variants={navbarVariants}
        initial="initial"
        animate="animate"
      >
        {/* Backdrop blur and gradient */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            scrolled
              ? "bg-gradient-to-r from-zinc-900/95 to-zinc-800/95 backdrop-blur-xl shadow-xl"
              : "bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 backdrop-blur-md"
          }`}
        />

        {/* Bottom border */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="h-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </motion.div>

        {/* Navbar content */}
        <div className="container mx-auto px-4 lg:px-6">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "py-3" : "py-4"
            }`}
          >
            {/* Logo */}
            <motion.button
              className="group flex items-center focus:outline-none"
              onClick={() => router.push("/")}
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-lg"
                  variants={glowVariants}
                />
                <Image
                  src="https://i.imgur.com/MiwxKii.png"
                  alt="PERSiBER Logo"
                  width={40}
                  height={40}
                  className="object-contain z-10"
                />
              </div>
            </motion.button>

            {/* Desktop Navigation */}
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
                    {(user?.role === "admin" || user?.role === "master") && (
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
                          onClick={() =>
                            handleMenuItemClick(handleRegisterRedirect)
                          }
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
                          onClick={() =>
                            handleMenuItemClick(handleUsersRedirect)
                          }
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

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden relative size-14 flex items-center justify-center rounded-lg focus:outline-none bg-transparent"
              onClick={toggleMenu}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ backgroundColor: "transparent", boxShadow: "none" }}
            >
              <span
                className="absolute inset-0 rounded-lg bg-transparent"
                style={{ backgroundColor: "transparent", opacity: 0 }}
              />

              <div className="relative w-8 h-5 flex flex-col justify-between items-center">
                <motion.span
                  className="w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.header>

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
                {!isAuthenticated ? (
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
                ) : (
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
                          <p className="text-amber-500 font-medium">
                            {user?.username ?? "User"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {user?.role
                              ? user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)
                              : "User"}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Admin-only menu items */}
                    {(user?.role === "admin" || user?.role === "master") && (
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
                          onClick={() =>
                            handleMenuItemClick(handleRegisterRedirect)
                          }
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
                          onClick={() =>
                            handleMenuItemClick(handleUsersRedirect)
                          }
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

// Desktop Navigation Item
function DesktopNavItem({ variants, icon, label, onClick, isActive }: any) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative px-3 py-2 rounded-lg overflow-hidden group ${
        isActive ? "text-white" : "text-black hover:text-white"
      }`}
      variants={variants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.span
          className="absolute inset-0 rounded-lg opacity-20 bg-amber-800"
          layoutId="navActiveBackground"
          transition={{ type: "spring", duration: 0.4 }}
        />
      )}

      {/* Hover indicator */}
      <span
        className={`absolute inset-0 rounded-lg ${
          isActive
            ? "bg-amber-500/10"
            : "bg-zinc-700/0 group-hover:bg-zinc-700/30"
        } transition-all duration-300`}
      />

      {/* Content */}
      <span className="relative flex items-center">
        <span className="mr-1.5">{icon}</span>
        <span className="text-sm font-medium tracking-wide">{label}</span>
      </span>
    </motion.button>
  );
}

// Mobile Navigation Item
function MobileNavItem({ icon, label, onClick, isActive, variants }: any) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-white border border-amber-500/20"
          : "bg-zinc-800/30 hover:bg-zinc-800/50 text-gray-200 border border-transparent"
      }`}
      variants={variants}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <span
        className={`flex items-center justify-center size-9 rounded-lg mr-3 ${
          isActive
            ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-white"
            : "bg-zinc-700/50 text-gray-300"
        }`}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>

      {isActive && (
        <svg
          className="size-5 ml-auto text-amber-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4"
          />
        </svg>
      )}
    </motion.button>
  );
}
