import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";

export const useNavigation = () => {
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

  // Permission checks
  const isAdminOrMaster = user?.role === "admin" || user?.role === "master";

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
  }, [navbarRef, isMenuOpen]);

  return {
    // State
    isMenuOpen,
    scrolled,
    isAuthenticated,
    user,
    navbarRef,
    pathname,

    // Navigation functions
    handleLoginRedirect,
    handleRegisterRedirect,
    handleUsersRedirect,
    handleGuestsRedirect,
    handleMembersRedirect,
    handleBppListRedirect,
    handleQRRedirect,
    handleScannerRedirect,
    handleLogout,

    // Menu functions
    toggleMenu,
    closeMenu,
    handleMenuItemClick,

    // Utilities
    isActive,
    isAdminOrMaster,

    // Navigation actions
    navigateToHome: () => router.push("/"),
  };
};
