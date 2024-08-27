"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";

export default function NavBar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

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

  return (
    <nav className="w-full bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <button
          className="text-xl md:text-2xl font-bold cursor-pointer bg-transparent hover:bg-transparent hover:text-orange-500 focus:outline-none"
          onClick={() => router.push("/")}
        >
          <Image
            src="https://i.imgur.com/MiwxKii.png"
            alt="PERSiBER Logo"
            width={50}
            height={50}
            className="object-contain w-auto h-auto max-w-full"
            sizes="(max-width: 768px) 40px, (max-width: 1200px) 50px, 60px"
          />
        </button>
        <div className="hidden md:flex space-x-4">
          {!isAuthenticated ? (
            <button
              onClick={handleLoginRedirect}
              className="font-bold py-2 px-4 rounded min-w-[100px]"
            >
              Login
            </button>
          ) : (
            <>
              {(user?.role === "admin" || user?.role === "master") && (
                <>
                  <button
                    onClick={handleRegisterRedirect}
                    className="font-bold py-2 px-4 rounded min-w-[100px]"
                  >
                    Register
                  </button>
                  <button
                    onClick={handleQRRedirect}
                    className="font-bold py-2 px-4 rounded min-w-[100px]"
                  >
                    QR
                  </button>
                  <button
                    onClick={handleUsersRedirect}
                    className="font-bold py-2 px-4 rounded min-w-[100px]"
                  >
                    Users
                  </button>
                </>
              )}
              <button
                onClick={handleGuestsRedirect}
                className="font-bold py-2 px-4 rounded min-w-[100px]"
              >
                Guests
              </button>
              <button
                onClick={handleMembersRedirect}
                className="font-bold py-2 px-4 rounded min-w-[100px]"
              >
                Members
              </button>
              <button
                onClick={handleLogout}
                className="font-bold py-2 px-4 rounded min-w-[100px]"
              >
                Logout
              </button>
            </>
          )}
        </div>
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg
              className="w-6 h-6"
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
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              ></path>
            </svg>
          </button>
        </div>
      </div>
      {/* Overlay */}
      {isMenuOpen && (
        <button
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={closeMenu}
          onKeyDown={closeMenu}
          tabIndex={0}
        ></button>
      )}
      {/* Mobile menu */}
      <div
        className={`md:hidden bg-gray-700 transition-transform transform ease-in-out duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } fixed top-16 right-0 w-3/4 h-full z-50`}
      >
        {!isAuthenticated ? (
          <button
            onClick={handleLoginRedirect}
            className="block w-full text-center px-4 py-2 font-bold text-xl transition-all ease-in-out duration-300 mt-4 bg-transparent hover:bg-transparent hover:text-orange-500 focus:outline-none"
          >
            Login
          </button>
        ) : (
          <>
            {(user?.role === "admin" || user?.role === "master") && (
              <>
                <button
                  onClick={handleRegisterRedirect}
                  className="block w-full text-center px-4 py-2 font-bold text-xl transition-all ease-in-out duration-300 mt-4 bg-transparent hover:bg-transparent hover:text-orange-500 focus:outline-none"
                >
                  Register
                </button>
                <button
                  onClick={handleQRRedirect}
                  className="block w-full text-center px-4 py-2 font-bold text-xl transition-all ease-in-out duration-300 mt-4 bg-transparent hover:bg-transparent hover:text-orange-500 focus:outline-none"
                >
                  QR
                </button>
                <button
                  onClick={handleUsersRedirect}
                  className="block w-full text-center px-4 py-2 font-bold text-xl transition-all ease-in-out duration-300 mt-4 bg-transparent hover:bg-transparent hover:text-orange-500 focus:outline-none"
                >
                  Users
                </button>
              </>
            )}
            <button
              onClick={handleGuestsRedirect}
              className="block w-full text-center px-4 py-2 font-bold text-xl transition-all ease-in-out duration-300 mt-4 bg-transparent hover:bg-transparent hover:text-orange-500 focus:outline-none"
            >
              Guests
            </button>
            <button
              onClick={handleMembersRedirect}
              className="block w-full text-center px-4 py-2 font-bold text-xl transition-all ease-in-out duration-300 mt-4 bg-transparent hover:bg-transparent hover:text-orange-500 focus:outline-none"
            >
              Members
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-center px-4 py-2 font-bold text-xl transition-all ease-in-out duration-300 mt-4 bg-transparent hover:bg-transparent hover:text-orange-500 focus:outline-none"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
