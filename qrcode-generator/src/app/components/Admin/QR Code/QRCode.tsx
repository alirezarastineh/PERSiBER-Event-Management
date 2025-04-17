"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { useFindOrCreateGuestMutation } from "@/redux/features/guests/guestsApiSlice";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "@/app/components/Common/Spinner";
import Image from "next/image";

const QRCodeComponent = () => {
  const [text, setText] = useState("");
  const [currentGuest, setCurrentGuest] = useState(""); // Added for stable display
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const qrCodeRef = useRef<HTMLCanvasElement | null>(null);
  const [findOrCreateGuest] = useFindOrCreateGuestMutation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (qrCodeUrl && qrCodeRef.current) {
      const canvas = qrCodeRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        // Clear previous content
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Create image for drawing
        const img = new window.Image();
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
  }, [qrCodeUrl]);

  const generateQRCode = async () => {
    if (!text.trim()) {
      alert("Please enter a guest's name.");
      return;
    }

    setLoading(true);
    try {
      const guestResponse = await findOrCreateGuest(text.trim()).unwrap();
      const guestUrl = `${window.location.origin}/guests/${guestResponse._id}`;
      const url = await QRCode.toDataURL(guestUrl, { width: 800, margin: 2 });
      setQrCodeUrl(url);
      setCurrentGuest(text.trim()); // Store the current guest name
    } catch (error) {
      console.error(
        "Error generating QR code or finding/creating guest:",
        error
      );
      alert("Failed to generate QR code or find/create guest.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrCodeSize = 120; // Slightly smaller for better layout
    const qrCodeX = (pageWidth - qrCodeSize) / 2;
    const qrCodeY = pageHeight / 2 - 10; // Position slightly above center

    // Format the guest name with proper casing
    const formattedText = currentGuest
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // ===== BACKGROUND =====
    // Create a premium dark gradient background
    doc.setFillColor(26, 26, 46); // Deep navy from color scheme
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Add subtle gradient layer
    for (let i = 0; i < pageHeight; i += 2) {
      const alpha = 1 - (i / pageHeight) * 0.7;
      doc.setFillColor(45, 45, 65, alpha);
      doc.rect(0, i, pageWidth, 2, "F");
    }

    // ===== DECORATIVE ELEMENTS =====
    // Gold border
    const borderWidth = 5;
    const borderMargin = 15;
    doc.setDrawColor(212, 175, 55); // Rich gold
    doc.setLineWidth(borderWidth);
    doc.rect(
      borderMargin,
      borderMargin,
      pageWidth - 2 * borderMargin,
      pageHeight - 2 * borderMargin,
      "S"
    );

    // Inner border with thinner line
    doc.setDrawColor(212, 175, 55, 0.6); // Rich gold with opacity
    doc.setLineWidth(1);
    doc.rect(
      borderMargin + 5,
      borderMargin + 5,
      pageWidth - 2 * (borderMargin + 5),
      pageHeight - 2 * (borderMargin + 5),
      "S"
    );

    // Decorative corner accents
    const cornerSize = 15;
    const cornerOffset = borderMargin - 2;

    // Top left corner accent
    doc.setFillColor(212, 175, 55);
    doc.triangle(
      cornerOffset,
      cornerOffset,
      cornerOffset + cornerSize,
      cornerOffset,
      cornerOffset,
      cornerOffset + cornerSize,
      "F"
    );

    // Top right corner accent
    doc.triangle(
      pageWidth - cornerOffset,
      cornerOffset,
      pageWidth - cornerOffset - cornerSize,
      cornerOffset,
      pageWidth - cornerOffset,
      cornerOffset + cornerSize,
      "F"
    );

    // Bottom left corner accent
    doc.triangle(
      cornerOffset,
      pageHeight - cornerOffset,
      cornerOffset + cornerSize,
      pageHeight - cornerOffset,
      cornerOffset,
      pageHeight - cornerOffset - cornerSize,
      "F"
    );

    // Bottom right corner accent
    doc.triangle(
      pageWidth - cornerOffset,
      pageHeight - cornerOffset,
      pageWidth - cornerOffset - cornerSize,
      pageHeight - cornerOffset,
      pageWidth - cornerOffset,
      pageHeight - cornerOffset - cornerSize,
      "F"
    );

    // ===== HEADER =====
    // Event name in elegant gold at top
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("2-YEAR ANNIVERSARY 2025", pageWidth / 2, 45, { align: "center" });

    // Add decorative divider
    const dividerWidth = 120;
    const dividerY = 55;
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(
      (pageWidth - dividerWidth) / 2,
      dividerY,
      (pageWidth + dividerWidth) / 2,
      dividerY
    );

    // Add small ornament in the middle of divider
    const ornSize = 4;
    doc.setFillColor(212, 175, 55);
    doc.circle(pageWidth / 2, dividerY, ornSize, "F");

    // ===== GUEST NAME =====
    // "INVITATION FOR" text
    doc.setFontSize(14);
    doc.setTextColor(255, 220, 154); // Lighter gold
    doc.setFont("helvetica", "normal");
    doc.text("TICKET FOR", pageWidth / 2, 80, { align: "center" });

    // Guest name with larger, elegant font
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(formattedText, pageWidth / 2, 95, { align: "center" });

    // ===== QR CODE =====
    // Frame for QR code
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(2);
    doc.roundedRect(
      qrCodeX - 5,
      qrCodeY - 5,
      qrCodeSize + 10,
      qrCodeSize + 10,
      3,
      3,
      "S"
    );

    // Add QR code with white background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrCodeX, qrCodeY, qrCodeSize, qrCodeSize, 2, 2, "F");

    doc.addImage(qrCodeUrl, "PNG", qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

    // ===== FOOTER =====
    // Event details - pure white color for better visibility
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255); // Changed to white for better visibility
    doc.setFont("helvetica", "bold"); // Bold for better visibility
    doc.text(
      "See you on the Dancefloor!",
      pageWidth / 2,
      qrCodeY + qrCodeSize + 25,
      { align: "center" }
    );

    // Date and organizer - Moved up to ensure it's fully visible
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("MAY 17, 2025", pageWidth / 2, qrCodeY + qrCodeSize + 35, {
      align: "center",
    });

    // Add PERSiBER branding - Also adjusted position
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "bold");
    doc.text("PERSi", pageWidth / 2 - 10, qrCodeY + qrCodeSize + 50, {
      align: "right",
    });
    doc.setTextColor(255, 179, 71); // Accent amber
    doc.text("BER", pageWidth / 2 + 10, qrCodeY + qrCodeSize + 50, {
      align: "left",
    });

    // ===== SAVE FILE =====
    const pdfFileName = `${formattedText} - 2-Year Anniversary - PERSiBER 17.05.2025.pdf`;
    doc.save(pdfFileName);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-soft-cream to-gray-100 dark:from-deep-navy dark:to-gray-900 px-4 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="p-2">
                <Image
                  src="https://i.imgur.com/MiwxKii.png"
                  alt="PERSiBER Logo"
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-3 gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            QR Code Generator
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-rich-gold to-accent-amber rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />

          <motion.p
            className="mt-4 text-lg text-warm-charcoal dark:text-gray-300 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Create personalized QR codes for your event guests
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Input Section */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 order-1 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rich-gold to-accent-amber rounded-t-2xl"></div>

            <h2 className="text-2xl font-bold mb-6 text-warm-charcoal dark:text-white">
              Guest Information
            </h2>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="guestName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Guest Name
                </label>
                <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
                  <input
                    id="guestName"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the guest's full name"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rich-gold dark:focus:ring-accent-amber focus:border-rich-gold dark:focus:border-accent-amber text-warm-charcoal dark:text-white placeholder-gray-400 transition-all duration-300"
                  />
                </motion.div>
              </div>

              <motion.button
                onClick={generateQRCode}
                disabled={loading}
                className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-semibold text-lg tracking-wide shadow-lg transition-all duration-300"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(212, 175, 55, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Spinner sm />
                    <span className="ml-2">Generating...</span>
                  </span>
                ) : (
                  "Generate QR Code"
                )}
              </motion.button>

              <motion.p
                className="text-sm text-gray-500 dark:text-gray-400 text-center italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                QR codes will link directly to the guest&apos;s information page
              </motion.p>
            </div>
          </motion.div>

          {/* QR Code Preview Section */}
          <motion.div className="order-2 lg:order-2" layout>
            <AnimatePresence mode="wait">
              {qrCodeUrl ? (
                <motion.div
                  key="qrcode"
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-warm-charcoal dark:text-white">
                    QR Code Preview
                  </h2>

                  {/* Guest Name Display - Only shows the current guest */}
                  {currentGuest && (
                    <div className="mb-4 text-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        GUEST
                      </span>
                      <h3 className="text-xl font-bold text-warm-charcoal dark:text-white">
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
                      <canvas
                        ref={qrCodeRef}
                        width="300"
                        height="300"
                        className="hidden"
                      />
                      {/* Display the QR code as Image instead of img */}
                      <Image
                        src={qrCodeUrl}
                        alt="QR Code"
                        width={300}
                        height={300}
                        className="rounded-lg"
                      />
                    </div>
                  </motion.div>

                  <motion.div className="w-full">
                    <button
                      onClick={downloadPDF}
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
                    <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
                      PDF includes personalized invitation for{" "}
                      <span className="font-semibold">{currentGuest}</span> to
                      the 2-Year Anniversary
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  className="bg-white/30 dark:bg-gray-800/30 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[500px] backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-700">
                      <svg
                        className="w-16 h-16 text-gray-400 dark:text-gray-500"
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
                    <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">
                      No QR Code Generated Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                      Enter a guest name and generate your first QR code
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          {[
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              title: "Instant Generation",
              desc: "Create QR codes in seconds with minimal input required",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              ),
              title: "Secure Access",
              desc: "Each QR code links to a secure, personalized guest page",
            },
            {
              icon: (
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
              ),
              title: "Print Ready",
              desc: "Download professionally formatted PDF invitations",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="card p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.2, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-rich-gold/20 to-accent-amber/20 text-rich-gold dark:text-accent-amber mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-warm-charcoal dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QRCodeComponent;
