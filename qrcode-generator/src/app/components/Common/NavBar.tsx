"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";

export default function NavBar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const navbarRef = useRef<HTMLDivElement | null>(null);

  const handleLoginRedirect = () => {
    router.push("/auth/login");
  };

  const handleRegisterRedirect = () => {
    router.push("/auth/register");
  };

  const handleUsersRedirect = () => {
    router.push("/admin/users");
  };

  const handleGuestsRedirect = () => {
    router.push("/guests");
  };

  const handleMembersRedirect = () => {
    router.push("/members");
  };

  const handleQRRedirect = () => {
    router.push("/admin/qrcode");
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/auth/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbarRef]);

  // Handle menu item click and close menu
  const handleMenuItemClick = (redirectFunction: () => void) => {
    redirectFunction();
    closeMenu();
  };

  return (
    <nav className="w-full bg-gray-800 text-white shadow-lg" ref={navbarRef}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo and Brand */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Image
            src="https://i.imgur.com/MiwxKii.png"
            alt="PERSiBER Logo"
            width={50}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {!isAuthenticated ? (
            <button
              onClick={handleLoginRedirect}
              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition duration-300"
            >
              Login
            </button>
          ) : (
            <>
              {(user?.role === "admin" || user?.role === "master") && (
                <>
                  <button
                    onClick={() => handleMenuItemClick(handleRegisterRedirect)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => handleMenuItemClick(handleQRRedirect)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
                  >
                    QR
                  </button>
                  <button
                    onClick={() => handleMenuItemClick(handleUsersRedirect)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
                  >
                    Users
                  </button>
                </>
              )}
              <button
                onClick={() => handleMenuItemClick(handleGuestsRedirect)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
              >
                Guests
              </button>
              <button
                onClick={() => handleMenuItemClick(handleMembersRedirect)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
              >
                Members
              </button>
              <button
                onClick={() => handleMenuItemClick(handleLogout)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition duration-300"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="focus:outline-none bg-transparent"
          >
            <svg
              className="w-8 h-8 transition-transform transform duration-300 ease-in-out"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12" // X icon (menu open)
                    : "M4 6h16M4 12h16M4 18h16" // Hamburger icon (menu closed)
                }
              ></path>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed top-0 right-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close Button for Mobile Menu */}
          <div className="flex justify-end p-4">
            <button
              onClick={closeMenu}
              aria-label="Close menu"
              className="focus:outline-none bg-transparent"
            >
              <svg
                className="w-8 h-8 transition-transform transform duration-300 ease-in-out"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12" // X icon for close button
                ></path>
              </svg>
            </button>
          </div>
          {/* Mobile Menu Content */}
          <div className="p-6 flex flex-col space-y-4">
            {!isAuthenticated ? (
              <button
                onClick={() => handleMenuItemClick(handleLoginRedirect)}
                className="w-full text-left px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition duration-300"
              >
                Login
              </button>
            ) : (
              <>
                {(user?.role === "admin" || user?.role === "master") && (
                  <>
                    <button
                      onClick={() =>
                        handleMenuItemClick(handleRegisterRedirect)
                      }
                      className="w-full text-left px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
                    >
                      Register
                    </button>
                    <button
                      onClick={() => handleMenuItemClick(handleQRRedirect)}
                      className="w-full text-left px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
                    >
                      QR
                    </button>
                    <button
                      onClick={() => handleMenuItemClick(handleUsersRedirect)}
                      className="w-full text-left px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
                    >
                      Users
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleMenuItemClick(handleGuestsRedirect)}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
                >
                  Guests
                </button>
                <button
                  onClick={() => handleMenuItemClick(handleMembersRedirect)}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition duration-300"
                >
                  Members
                </button>
                <button
                  onClick={() => handleMenuItemClick(handleLogout)}
                  className="w-full text-left px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
