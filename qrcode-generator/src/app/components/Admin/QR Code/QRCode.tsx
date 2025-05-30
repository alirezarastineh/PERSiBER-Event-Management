"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { useFindOrCreateGuestMutation } from "@/redux/features/guests/guestsApiSlice";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "@/app/components/Common/Spinner";
import Image from "next/image";
import Modal from "../../Common/Modal";
import { AlertType } from "@/types/types";

const QRCodeComponent = () => {
  const [text, setText] = useState("");
  const [currentGuest, setCurrentGuest] = useState(""); // Added for stable display
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const qrCodeRef = useRef<HTMLCanvasElement | null>(null);
  const [findOrCreateGuest] = useFindOrCreateGuestMutation();
  const [loading, setLoading] = useState(false);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Add this function to show custom alerts
  const showCustomAlert = (
    title: string,
    message: string,
    type: AlertType = "info"
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertModal(true);
  };

  const getAlertBackgroundColor = (type: AlertType) => {
    switch (type) {
      case "success":
        return "rgba(16, 185, 129, 0.2)";
      case "error":
        return "rgba(239, 68, 68, 0.2)";
      case "warning":
        return "rgba(245, 158, 11, 0.2)";
      case "info":
      default:
        return "rgba(59, 130, 246, 0.2)";
    }
  };

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
      showCustomAlert(
        "Input Required",
        "Please enter a guest's name.",
        "warning"
      );
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
      showCustomAlert(
        "Generation Failed",
        "Failed to generate QR code or find/create guest.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrCodeSize = 100; // Make QR code smaller to fit everything
    const qrCodeX = (pageWidth - qrCodeSize) / 2;
    const qrCodeY = pageHeight / 2 - 30; // Move QR code higher up

    // Format the guest name with proper casing
    const formattedText = currentGuest
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // ===== TROPICAL GRADIENT BACKGROUND =====
    // Create blue to golden gradient background like the flyer
    for (let i = 0; i < pageHeight; i += 2) {
      const ratio = i / pageHeight;
      // Blue to golden gradient (RGB values based on flyer)
      const r = Math.round(65 + (255 - 65) * ratio); // Blue to golden red component
      const g = Math.round(130 + (215 - 130) * ratio); // Blue to golden green component
      const b = Math.round(246 - (246 - 135) * ratio); // Blue to golden blue component
      doc.setFillColor(r, g, b);
      doc.rect(0, i, pageWidth, 2, "F");
    }

    // ===== TROPICAL BORDER =====
    const borderWidth = 4;
    const borderMargin = 12;
    doc.setDrawColor(255, 165, 0); // Orange border like flyer elements
    doc.setLineWidth(borderWidth);
    doc.roundedRect(
      borderMargin,
      borderMargin,
      pageWidth - 2 * borderMargin,
      pageHeight - 2 * borderMargin,
      5,
      5,
      "S"
    );

    // ===== HEADER - SUMMER PARTY BRANDING =====
    // "Private Summer Party" all in one line
    doc.setTextColor(255, 215, 0); // Golden yellow
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Private Summer Party", pageWidth / 2, 45, { align: "center" });

    // "BBQ, INDOOR & OPEN AIR PARTY ALL NIGHT LONG" below title
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255); // White
    doc.setFont("helvetica", "bold");
    doc.text("BBQ, INDOOR & OPEN AIR PARTY ALL NIGHT LONG", pageWidth / 2, 55, {
      align: "center",
    });

    // ===== GUEST NAME =====
    // "INVITATION FOR" text
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255); // White
    doc.setFont("helvetica", "normal");

    // Guest name with larger, elegant font
    doc.setFontSize(28);
    doc.setTextColor(255, 215, 0); // Golden yellow for guest name
    doc.setFont("helvetica", "bold");
    doc.text(formattedText, pageWidth / 2, 80, { align: "center" });

    // Dress code below guest name
    doc.setFontSize(12);
    doc.setTextColor(255, 215, 0); // Golden
    doc.setFont("helvetica", "bold");
    doc.text("DRESS CODE: HAWAIIAN", pageWidth / 2, 95, {
      align: "center",
    });

    // ===== QR CODE WITH TROPICAL FRAME =====
    // Tropical-themed frame for QR code
    doc.setDrawColor(255, 165, 0); // Orange frame
    doc.setLineWidth(3);
    doc.roundedRect(
      qrCodeX - 6,
      qrCodeY - 6,
      qrCodeSize + 12,
      qrCodeSize + 12,
      5,
      5,
      "S"
    );

    // Add inner golden frame
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1);
    doc.roundedRect(
      qrCodeX - 3,
      qrCodeY - 3,
      qrCodeSize + 6,
      qrCodeSize + 6,
      3,
      3,
      "S"
    );

    // Add QR code with white background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrCodeX, qrCodeY, qrCodeSize, qrCodeSize, 2, 2, "F");

    doc.addImage(qrCodeUrl, "PNG", qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

    // ===== EVENT DETAILS =====
    // Date and day on one line
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("SATURDAY AUGUST 16", pageWidth / 2, qrCodeY + qrCodeSize + 30, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.text("6 PM - 4 AM", pageWidth / 2, qrCodeY + qrCodeSize + 45, {
      align: "center",
    });

    // ===== SAVE FILE =====
    const pdfFileName = `${formattedText} - Summer Party - PERSiBER August 16.pdf`;
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
                      the Private Summer Party
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

            <AnimatePresence>
              {showAlertModal && (
                <Modal
                  isOpen={showAlertModal}
                  onClose={() => setShowAlertModal(false)}
                  title={alertTitle}
                >
                  <div className="space-y-6">
                    <div
                      className="flex items-center justify-center w-16 h-16 mx-auto rounded-full"
                      style={{
                        backgroundColor: getAlertBackgroundColor(alertType),
                      }}
                    >
                      {alertType === "success" && (
                        <svg
                          className="w-8 h-8 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {alertType === "error" && (
                        <svg
                          className="w-8 h-8 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      {alertType === "warning" && (
                        <svg
                          className="w-8 h-8 text-amber-600 dark:text-amber-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      )}
                      {alertType === "info" && (
                        <svg
                          className="w-8 h-8 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="text-lg font-medium text-warm-charcoal dark:text-white mb-2">
                        {alertTitle}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {alertMessage}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-3 justify-center">
                      <motion.button
                        onClick={() => setShowAlertModal(false)}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-rich-gold to-accent-amber text-deep-navy font-medium shadow-md min-w-[120px]"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 5px 15px rgba(212, 175, 55, 0.25)",
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Okay
                      </motion.button>
                    </div>
                  </div>
                </Modal>
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
              id: "feature-instant-generation",
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
              id: "feature-secure-access",
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
              id: "feature-print-ready",
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
          ].map((feature) => (
            <motion.div
              key={feature.id}
              className="card p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay:
                  0.8 + Array.prototype.indexOf.call(feature, feature) * 0.2,
                duration: 0.5,
              }}
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
