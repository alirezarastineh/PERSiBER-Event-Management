"use client";

import React from "react";
import { motion } from "framer-motion";
import { useQRCodeGeneration } from "@/app/hooks/qr/useQRCodeGeneration";
import { useAlert } from "@/app/hooks/useAlert";
import QRCodeInput from "../../QRCode/QRCodeInput";
import QRCodePreview from "../../QRCode/QRCodePreview";
import QRCodeFeatures from "../../QRCode/QRCodeFeatures";
import AlertModal from "../../Common/AlertModal";

const QRCodeComponent = () => {
  // Custom hooks
  const {
    text,
    currentGuest,
    qrCodeUrl,
    loading,
    qrCodeRef,
    setText,
    generateQRCode,
    downloadPDF,
  } = useQRCodeGeneration();

  const {
    showAlertModal,
    alertType,
    alertTitle,
    alertMessage,
    showCustomAlert,
    hideAlert,
    getAlertBackgroundColor,
  } = useAlert();

  // Handle QR code generation with error handling
  const handleGenerateQRCode = async () => {
    try {
      await generateQRCode();
    } catch (error: any) {
      showCustomAlert(
        "Input Required",
        error.message ?? "Please enter a guest's name.",
        "warning"
      );
    }
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
          <QRCodeInput
            text={text}
            setText={setText}
            onGenerate={handleGenerateQRCode}
            loading={loading}
          />

          {/* QR Code Preview Section */}
          <QRCodePreview
            qrCodeUrl={qrCodeUrl}
            currentGuest={currentGuest}
            qrCodeRef={qrCodeRef}
            onDownloadPDF={downloadPDF}
          />
        </div>

        {/* Feature Highlights */}
        <QRCodeFeatures />

        {/* Background Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-[10%] w-64 h-64 bg-rich-gold/5 rounded-full blur-3xl transform -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-[10%] w-96 h-96 bg-accent-amber/5 rounded-full blur-3xl transform translate-y-1/2"></div>
          <div className="absolute top-1/3 right-[15%] w-48 h-48 bg-rich-gold/5 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={hideAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        getBackgroundColor={getAlertBackgroundColor}
      />
    </motion.div>
  );
};

export default QRCodeComponent;
