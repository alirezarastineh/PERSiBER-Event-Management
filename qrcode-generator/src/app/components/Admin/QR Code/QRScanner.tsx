"use client";

import React from "react";
import { motion } from "framer-motion";
import { useQRScanner } from "@/app/hooks/qr/useQRScanner";
import { useAlert } from "@/app/hooks/useAlert";
import QRScannerView from "../../QRScanner/QRScannerView";
import QRScannerInstructions from "../../QRScanner/QRScannerInstructions";
import GuestDetailsCard from "../../GuestDetail/GuestDetailsCard";
import AlertModal from "../../Common/AlertModal";

const QRScanner = () => {
  // Custom hooks
  const {
    isLoading,
    isScannerSupported,
    scannedGuest,
    setScanSuccessCallback,
  } = useQRScanner();

  const {
    showAlertModal,
    alertType,
    alertTitle,
    alertMessage,
    showCustomAlert,
    hideAlert,
    getAlertBackgroundColor,
  } = useAlert();

  // Set up scan success callback
  React.useEffect(() => {
    setScanSuccessCallback((result) => {
      if (result.success) {
        showCustomAlert("QR Code Scanned", result.message, "success");
      } else if (result.error === "warning") {
        showCustomAlert("Already Attended", result.message, "warning");
      } else if (result.error === "error") {
        showCustomAlert("Error", result.message, "error");
      }
    });
  }, [setScanSuccessCallback, showCustomAlert]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-soft-cream to-gray-100 dark:from-deep-navy dark:to-gray-900 transition-colors duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <motion.header
          className="mb-8 md:mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-3 gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            QR Code Scanner
          </motion.h1>

          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-rich-gold to-accent-amber rounded-full mx-auto"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />

          <motion.p
            className="mt-4 text-base md:text-lg text-warm-charcoal dark:text-gray-300 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Scan guest QR codes to quickly access their information
          </motion.p>
        </motion.header>

        {/* Scanner Section */}
        <QRScannerView
          isLoading={isLoading}
          isScannerSupported={isScannerSupported}
          variants={fadeIn}
          itemVariants={itemVariants}
        />

        {/* Instructions Section */}
        <QRScannerInstructions
          variants={fadeIn}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />

        {/* Background Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-[10%] w-64 h-64 bg-rich-gold/5 rounded-full blur-3xl transform -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-[10%] w-96 h-96 bg-accent-amber/5 rounded-full blur-3xl transform translate-y-1/2"></div>
          <div className="absolute top-1/3 right-[15%] w-48 h-48 bg-rich-gold/5 rounded-full blur-2xl"></div>
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
