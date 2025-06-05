"use client";

import React from "react";
import { motion } from "framer-motion";
import { useNavigation } from "@/app/hooks/useNavigation";
import NavLogo from "../Navigation/NavLogo";
import DesktopNavigation from "../Navigation/DesktopNavigation";
import MobileMenuButton from "../Navigation/MobileMenuButton";
import MobileMenu from "../Navigation/MobileMenu";

export default function NavBar() {
  const {
    isMenuOpen,
    scrolled,
    isAuthenticated,
    user,
    navbarRef,
    isAdminOrMaster,
    toggleMenu,
    closeMenu,
    handleMenuItemClick,
    isActive,
    navigateToHome,
    handleLoginRedirect,
    handleRegisterRedirect,
    handleUsersRedirect,
    handleGuestsRedirect,
    handleMembersRedirect,
    handleBppListRedirect,
    handleQRRedirect,
    handleScannerRedirect,
    handleLogout,
  } = useNavigation();

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
            <NavLogo onLogoClick={navigateToHome} />

            {/* Desktop Navigation */}
            <DesktopNavigation
              isAuthenticated={isAuthenticated}
              user={user}
              isAdminOrMaster={isAdminOrMaster}
              isActive={isActive}
              handleMenuItemClick={handleMenuItemClick}
              handleQRRedirect={handleQRRedirect}
              handleRegisterRedirect={handleRegisterRedirect}
              handleUsersRedirect={handleUsersRedirect}
              handleScannerRedirect={handleScannerRedirect}
              handleGuestsRedirect={handleGuestsRedirect}
              handleMembersRedirect={handleMembersRedirect}
              handleBppListRedirect={handleBppListRedirect}
              handleLogout={handleLogout}
              handleLoginRedirect={handleLoginRedirect}
            />

            {/* Mobile Menu Button */}
            <MobileMenuButton isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isMenuOpen={isMenuOpen}
        closeMenu={closeMenu}
        isAuthenticated={isAuthenticated}
        user={user}
        isAdminOrMaster={isAdminOrMaster}
        isActive={isActive}
        handleMenuItemClick={handleMenuItemClick}
        handleQRRedirect={handleQRRedirect}
        handleRegisterRedirect={handleRegisterRedirect}
        handleUsersRedirect={handleUsersRedirect}
        handleScannerRedirect={handleScannerRedirect}
        handleGuestsRedirect={handleGuestsRedirect}
        handleMembersRedirect={handleMembersRedirect}
        handleBppListRedirect={handleBppListRedirect}
        handleLogout={handleLogout}
        handleLoginRedirect={handleLoginRedirect}
      />
    </>
  );
}
