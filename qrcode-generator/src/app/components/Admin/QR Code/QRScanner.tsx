"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQRScanner } from "@/app/hooks/qr/useQRScanner";
import { AlertType } from "@/types/common";
import QRScannerView from "../../QRScanner/QRScannerView";
import QRScannerInstructions from "../../QRScanner/QRScannerInstructions";
import GuestDetailsCard from "../../GuestDetail/GuestDetailsCard";
import AlertModal from "../../Common/AlertModal";

const ScannerHeader = ({
  prefersReducedMotion,
  browserInfo,
}: {
  prefersReducedMotion: boolean;
  browserInfo: ReturnType<typeof useQRScanner>["browserInfo"];
}) => (
  <motion.header
    className="mb-8 md:mb-16 text-center"
    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: prefersReducedMotion ? 0.1 : 0.7 }}
  >
    <motion.h1
      className="text-3xl md:text-5xl font-bold mb-3 gradient-text"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: prefersReducedMotion ? 0 : 0.2,
        duration: prefersReducedMotion ? 0.1 : 0.7,
      }}
    >
      QR Code Scanner
    </motion.h1>

    <motion.div
      className="h-1 w-24 rounded-full mx-auto"
      style={{
        // Cross-browser gradient
        background: "linear-gradient(to right, #d4af37, #ffb347)",
      }}
      initial={{ width: 0 }}
      animate={{ width: 96 }}
      transition={{
        delay: prefersReducedMotion ? 0 : 0.3,
        duration: prefersReducedMotion ? 0.1 : 0.8,
      }}
    />

    <motion.p
      className="mt-4 text-base md:text-lg text-gray-300 max-w-xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: prefersReducedMotion ? 0 : 0.5,
        duration: prefersReducedMotion ? 0.1 : 0.7,
      }}
    >
      Scan guest QR codes to quickly access their information
    </motion.p>

    {/* Browser compatibility indicator (dev only) */}
    {process.env.NODE_ENV === "development" && browserInfo && (
      <motion.p
        className="mt-2 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {browserInfo.name} {browserInfo.version} ({browserInfo.isMobile ? "Mobile" : "Desktop"})
      </motion.p>
    )}
  </motion.header>
);

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

const createScanResultHandler =
  (showAlert: (title: string, message: string, type: AlertType) => void) => (result: any) => {
    if (result.success) {
      showAlert("QR Code Scanned", result.message, "success");
    } else if (result.error === "warning") {
      showAlert("Already Attended", result.message, "warning");
    } else if (result.error === "error") {
      showAlert("Error", result.message, "error");
    }
  };

const buildAnimationVariants = (prefersReducedMotion: boolean) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0.1 }
        : { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0.1 : 0.6 },
    },
  };

  return { containerVariants, itemVariants, fadeIn };
};

const QRScanner = () => {
  // Alert state - managed directly like in the working version
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Custom hooks - now includes cross-browser compatibility features
  const {
    isLoading,
    isScannerSupported,
    scannedGuest,
    setScanSuccessCallback,
    scannerError,
    browserInfo,
    cameraStatus,
    retryScanner,
  } = useQRScanner();

  // Show custom alert - like in working version
  const showCustomAlert = (title: string, message: string, type: AlertType = "info") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setShowAlertModal(true);
  };

  const hideAlert = () => {
    setShowAlertModal(false);
  };

  // Set up scan success callback - following exact pattern of working version
  useEffect(() => {
    setScanSuccessCallback(createScanResultHandler(showCustomAlert));
  }, [setScanSuccessCallback]); // Remove showCustomAlert dependency to avoid circular dependency

  // Animation variants with cross-browser support (reduced motion preference)
  const prefersReducedMotion = !!globalThis.window?.matchMedia?.("(prefers-reduced-motion: reduce)")
    ?.matches;

  const { containerVariants, itemVariants, fadeIn } = buildAnimationVariants(prefersReducedMotion);

  return (
    <motion.div
      className="min-h-screen transition-colors duration-500"
      style={{
        // Cross-browser gradient with fallbacks
        background: "linear-gradient(to bottom, #1a1a2e, #111827)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.6 }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <ScannerHeader prefersReducedMotion={prefersReducedMotion} browserInfo={browserInfo} />

        {/* Scanner Section - now with cross-browser props */}
        <QRScannerView
          isLoading={isLoading}
          isScannerSupported={isScannerSupported}
          variants={fadeIn}
          itemVariants={itemVariants}
          scannerError={scannerError}
          browserInfo={browserInfo}
          cameraStatus={cameraStatus}
          onRetry={retryScanner}
        />

        {/* Instructions Section */}
        <QRScannerInstructions
          variants={fadeIn}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />

        {/* Background Decorative Elements with cross-browser blur */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
          <div
            className="absolute top-0 left-[10%] w-64 h-64 rounded-full"
            style={{
              background: "rgba(212, 175, 55, 0.05)",
              filter: "blur(48px)",
              WebkitFilter: "blur(48px)",
              transform: "translateY(-50%) translateZ(0)",
              WebkitTransform: "translateY(-50%) translateZ(0)",
            }}
          />
          <div
            className="absolute bottom-0 right-[10%] w-96 h-96 rounded-full"
            style={{
              background: "rgba(255, 179, 71, 0.05)",
              filter: "blur(48px)",
              WebkitFilter: "blur(48px)",
              transform: "translateY(50%) translateZ(0)",
              WebkitTransform: "translateY(50%) translateZ(0)",
            }}
          />
          <div
            className="absolute top-1/3 right-[15%] w-48 h-48 rounded-full"
            style={{
              background: "rgba(212, 175, 55, 0.05)",
              filter: "blur(32px)",
              WebkitFilter: "blur(32px)",
              transform: "translateZ(0)",
              WebkitTransform: "translateZ(0)",
            }}
          />
        </div>
      </div>

      {/* Alert Modal with Guest Details */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={hideAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        getBackgroundColor={getAlertBackgroundColor}
        customContent={
          alertType === "success" && scannedGuest ? (
            <GuestDetailsCard guest={scannedGuest} />
          ) : undefined
        }
      />
    </motion.div>
  );
};

export default QRScanner;
