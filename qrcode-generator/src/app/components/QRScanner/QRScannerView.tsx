import React from "react";
import { motion } from "framer-motion";
import Spinner from "../Common/Spinner";
import { QRScannerViewProps } from "@/types/qr";

export default function QRScannerView({
  isLoading,
  isScannerSupported,
  variants,
  itemVariants,
}: Readonly<QRScannerViewProps>) {
  return (
    <motion.section
      className="mb-8 md:mb-12"
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-700/50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 md:h-64">
            <Spinner lg />
            <p className="mt-4 text-gray-400">Loading QR code scanner...</p>
          </div>
        ) : (
          <>
            {isScannerSupported ? (
              <div className="flex flex-col items-center">
                <div
                  id="qr-reader"
                  className="w-full max-w-md mx-auto overflow-hidden rounded-lg"
                ></div>
                <p className="mt-4 md:mt-6 text-sm text-center text-gray-400">
                  Position the QR code within the frame to scan
                </p>
              </div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center h-48 md:h-64 text-center"
                variants={itemVariants}
              >
                <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 mx-auto rounded-full bg-red-900/30 mb-4">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Scanner Not Available
                </h3>
                <p className="text-sm md:text-base text-gray-400 max-w-md">
                  Your browser doesn&apos;t support the QR code scanner or camera access is blocked.
                  Please ensure you&apos;re using a modern browser and have granted camera
                  permissions.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}
