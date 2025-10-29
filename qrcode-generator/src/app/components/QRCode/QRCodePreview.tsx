import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { QRCodePreviewProps } from "@/types/qr";

export default function QRCodePreview({
  qrCodeUrl,
  currentGuest,
  qrCodeRef,
  onDownloadPDF,
}: Readonly<QRCodePreviewProps>) {
  useEffect(() => {
    if (qrCodeUrl && qrCodeRef.current) {
      const canvas = qrCodeRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        // Clear previous content
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Create image for drawing
        const img = new globalThis.Image();
        img.onload = () => {
          // Set specific dimensions to ensure proper rendering
          canvas.width = 300;
          canvas.height = 300;

          // Draw with the correct dimensions
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        // Handle any potential loading errors
        img.onerror = (err) => {
          console.error("Error loading QR code image:", err);
        };

        // Set image source after adding event handlers
        img.src = qrCodeUrl;
      }
    }
  }, [qrCodeUrl, qrCodeRef]);

  return (
    <motion.div className="order-2 lg:order-2" layout>
      <AnimatePresence mode="wait">
        {qrCodeUrl ? (
          <motion.div
            key="qrcode"
            className="bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-white">
              QR Code Preview
            </h2>

            {/* Guest Name Display - Only shows the current guest */}
            {currentGuest && (
              <div className="mb-4 text-center">
                <span className="text-sm font-medium text-gray-400">GUEST</span>
                <h3 className="text-xl font-bold text-white">
                  {currentGuest}
                </h3>
              </div>
            )}

            <motion.div
              className="relative p-1 mb-8 bg-gradient-to-r from-rich-gold to-accent-amber rounded-xl shadow-lg"
              whileHover={{ scale: 1.02, rotate: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white p-4 rounded-lg">
                {/* Keep the canvas for PDF generation but hide it */}
                <canvas ref={qrCodeRef} width="300" height="300" className="hidden" />
                {/* Display the QR code as Image instead of img */}
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={300}
                  height={300}
                  className="rounded-lg"
                  priority
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            </motion.div>

            <motion.div className="w-full">
              <button
                onClick={onDownloadPDF}
                className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-lg tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download as PDF
              </button>

              {/* Enhanced description with event details - Using currentGuest */}
              <p className="mt-4 text-sm text-center text-gray-400">
                PDF includes personalized invitation for{" "}
                <span className="font-semibold">{currentGuest}</span> to the Private Summer Party
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            className="bg-gray-800/30 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[500px] backdrop-blur-sm border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-gray-700">
                <svg
                  className="w-16 h-16 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-300">
                No QR Code Generated Yet
              </h3>
              <p className="text-gray-400 max-w-xs">
                Enter a guest name and generate your first QR code
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
