"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../../Common/Modal";
import { AlertType } from "@/types/types";
import Spinner from "../../Common/Spinner";
import {
  useGetGuestByIdQuery,
  useUpdateAttendedStatusMutation,
} from "@/redux/features/guests/guestsApiSlice";

// Types for the Html5QrcodeScanner which we'll load dynamically
type Html5QrcodeScannerConfig = {
  fps?: number;
  qrbox?: number | { width: number; height: number };
  aspectRatio?: number;
  disableFlip?: boolean;
  formatsToSupport?: any[];
  rememberLastUsedCamera?: boolean;
  showTorchButtonIfSupported?: boolean;
  // Add custom parameters for html5QrcodeScanner
  html5qrcodeScannerStrings?: {
    scanButtonStopScanningText?: string;
    textIfCameraScanSelected?: string;
  };
};

type Html5QrcodeScannerType = {
  render: (
    onScanSuccess: (decodedText: string, decodedResult: any) => void,
    onScanFailure?: (error: string) => void
  ) => void;
  clear: () => Promise<void>;
};

type Html5QrcodeScanner = (
  elementId: string,
  config: Html5QrcodeScannerConfig,
  verbose: boolean
) => Html5QrcodeScannerType;

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerSupported, setIsScannerSupported] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const scannerRef = useRef<Html5QrcodeScannerType | null>(null);
  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();

  // Track last scanned guest ID
  const [lastScannedGuestId, setLastScannedGuestId] = useState<string | null>(
    null
  );

  // Debounce mechanism to prevent duplicate scans
  const lastScanTime = useRef<number>(0);
  const lastScannedCode = useRef<string>("");
  const SCAN_COOLDOWN_MS = 2000; // 2 seconds cooldown

  // Get guest details if we have a lastScannedGuestId
  const { data: scannedGuest } = useGetGuestByIdQuery(
    lastScannedGuestId ?? "",
    {
      skip: !lastScannedGuestId,
    }
  );

  // Alert state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Function to check camera permissions
  const checkCameraPermission = async () => {
    try {
      console.log("Checking camera permissions");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("Camera permission granted");

      // Stop all tracks to release the camera
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error("Camera permission denied:", error);
      return false;
    }
  };

  // Show custom alert
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

  // Load the html5-qrcode library dynamically
  useEffect(() => {
    const loadScript = async () => {
      try {
        // Check if library is already available globally
        if ((window as any).Html5QrcodeScanner) {
          console.log("Html5QrcodeScanner already loaded");
          setScriptLoaded(true);
          setIsLoading(false);
          return;
        }

        // Check if script tag already exists
        if (!document.querySelector('script[src*="html5-qrcode.min.js"]')) {
          console.log("Loading Html5QrcodeScanner script");
          const script = document.createElement("script");
          script.src =
            "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
          script.async = true;
          script.onload = () => {
            console.log("Html5QrcodeScanner script loaded successfully");
            setScriptLoaded(true);
            setIsLoading(false);
          };
          script.onerror = (error) => {
            console.error("Failed to load html5-qrcode script:", error);
            setIsScannerSupported(false);
            setIsLoading(false);
            showCustomAlert(
              "Scanner Error",
              "Failed to load QR scanner. Please try again later.",
              "error"
            );
          };
          document.body.appendChild(script);
        } else {
          console.log("Html5QrcodeScanner script tag already exists");
          setScriptLoaded(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading script:", error);
        setIsScannerSupported(false);
        setIsLoading(false);
      }
    };

    loadScript();

    // Clean up
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error("Failed to clear scanner instance", err);
        });
      }
    };
  }, []);

  // Initialize scanner when script is loaded
  useEffect(() => {
    if (!scriptLoaded) return;

    const initializeScanner = async () => {
      try {
        // Check if Html5QrcodeScanner is available in the window object
        if (!(window as any).Html5QrcodeScanner) {
          console.error("Html5QrcodeScanner not found in window object");
          setIsScannerSupported(false);
          showCustomAlert(
            "Browser Not Supported",
            "Your browser doesn't support the QR code scanner.",
            "error"
          );
          return;
        }

        // Check camera permissions
        if (!(await checkCameraPermission())) {
          console.error("Camera permission denied");
          setIsScannerSupported(false);
          showCustomAlert(
            "Camera Access Denied",
            "Please allow camera access to use the QR scanner. You may need to reset permissions in your browser settings.",
            "error"
          );
          return;
        }

        const config: Html5QrcodeScannerConfig = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          html5qrcodeScannerStrings: {
            scanButtonStopScanningText: "Stop Scanning",
            textIfCameraScanSelected: "Select Camera",
          },
        };

        console.log("Creating HTML5QrcodeScanner instance");
        // Use the proper new constructor
        scannerRef.current = new (window as any).Html5QrcodeScanner(
          "qr-reader",
          config,
          false
        );
        console.log("HTML5QrcodeScanner instance created successfully");

        setIsScanning(true);
      } catch (error) {
        console.error("Error initializing scanner:", error);
        setIsScannerSupported(false);
        showCustomAlert(
          "Scanner Error",
          "Could not initialize the QR scanner. Your device may not be compatible.",
          "error"
        );
      }
    };

    initializeScanner();
  }, [scriptLoaded]);

  // Add custom styling for the scanner
  useEffect(() => {
    if (!scriptLoaded || !isScannerSupported) return;

    console.log("Applying custom styles to scanner UI");

    // Style customization for the scanner UI
    const styleStopButton = (button: HTMLButtonElement) => {
      button.classList.add("stop-btn");
      button.style.backgroundColor = "#1a1b26"; // Deep navy
      button.style.color = "#ffffff";
      button.style.border = "1px solid rgba(212, 175, 55, 0.3)";
      button.style.padding = "10px 18px";
      button.style.borderRadius = "8px";
      button.style.margin = "10px 10px 10px 0";
      button.style.fontWeight = "500";
      button.style.fontSize = "0.9rem";
      button.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
      button.style.transition = "all 0.2s ease";

      // Set proper width on mobile
      if (window.innerWidth < 640) {
        button.style.width = "calc(50% - 15px)";
      }
    };

    const styleTorchButton = (button: HTMLButtonElement) => {
      button.classList.add("torch-btn");
      button.style.backgroundImage =
        "linear-gradient(to right, #d4af37, #f0c64b)";
      button.style.color = "#1a1b26"; // Deep navy text
      button.style.border = "none";
      button.style.padding = "10px 18px";
      button.style.borderRadius = "8px";
      button.style.margin = "10px 0 10px 10px";
      button.style.fontWeight = "500";
      button.style.fontSize = "0.9rem";
      button.style.boxShadow = "0 2px 8px rgba(212, 175, 55, 0.3)";
      button.style.transition = "all 0.2s ease";

      // Set proper width on mobile
      if (window.innerWidth < 640) {
        button.style.width = "calc(50% - 15px)";
      }
    };

    const handleButtonMouseOver = (event: MouseEvent) => {
      const button = event.target as HTMLButtonElement;
      button.style.transform = "scale(1.02)";
      button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.15)";
    };

    const handleButtonMouseOut = (event: MouseEvent) => {
      const button = event.target as HTMLButtonElement;
      button.style.transform = "scale(1)";
      button.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    };

    const styleButton = (button: HTMLButtonElement, buttonType: string) => {
      if (buttonType === "stop") {
        styleStopButton(button);
      } else if (buttonType === "torch") {
        styleTorchButton(button);
      }
      button.addEventListener("mouseover", handleButtonMouseOver);
      button.addEventListener("mouseout", handleButtonMouseOut);
    };

    const styleButtons = (scannerContainer: HTMLElement) => {
      const buttons = scannerContainer.querySelectorAll("button");
      buttons.forEach((button) => {
        if (button.innerText === "Stop Scanning") {
          styleButton(button, "stop");
        } else if (button.innerText.includes("Torch")) {
          styleButton(button, "torch");
        }
      });
    };

    const styleSelectElements = (scannerContainer: HTMLElement) => {
      const selectElements = scannerContainer.querySelectorAll("select");
      selectElements.forEach((select) => {
        select.style.backgroundColor = "#f8f9fa";
        select.style.border = "1px solid #e2e8f0";
        select.style.borderRadius = "6px";
        select.style.padding = "8px 12px";
        select.style.width = "100%";
        select.style.marginBottom = "15px";
        select.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
        select.style.color = "#4a5568";
        select.style.fontSize = "0.9rem";

        // Set responsive width
        if (window.innerWidth >= 640) {
          select.style.maxWidth = "300px";
        }
      });
    };

    const styleCameraSelectorSections = (scannerContainer: HTMLElement) => {
      const cameraSelectorSections =
        scannerContainer.querySelectorAll(".section");
      cameraSelectorSections.forEach((section) => {
        (section as HTMLElement).style.margin = "15px 0";
      });
    };

    const applyCustomStyles = () => {
      try {
        // Target scanner buttons
        const scannerContainer = document.getElementById("qr-reader");
        if (!scannerContainer) return;

        // Give it some time to render the scanner elements
        setTimeout(() => {
          styleButtons(scannerContainer);
          styleSelectElements(scannerContainer);

          // Improve container padding and spacing
          const qrScanRegion =
            scannerContainer.querySelector("#qr-shaded-region");
          const parentElement =
            qrScanRegion?.parentElement as HTMLElement | null;
          if (parentElement) {
            parentElement.style.padding = "15px";
          }

          // Improve spacing for button container
          const buttonContainer = scannerContainer.querySelector(
            "#html5-qrcode-button-container"
          );
          if (buttonContainer) {
            (buttonContainer as HTMLElement).style.display = "flex";
            (buttonContainer as HTMLElement).style.justifyContent = "center";
            (buttonContainer as HTMLElement).style.flexWrap = "wrap";
            (buttonContainer as HTMLElement).style.gap = "10px";
            (buttonContainer as HTMLElement).style.margin = "15px 0";
          }

          styleCameraSelectorSections(scannerContainer);

          // Style scanner borders and frame
          const scannerSection = scannerContainer.querySelector("#reader");
          if (scannerSection) {
            (scannerSection as HTMLElement).style.boxShadow = "none";
            (scannerSection as HTMLElement).style.border =
              "2px solid rgba(212, 175, 55, 0.2)";
            (scannerSection as HTMLElement).style.borderRadius = "12px";
            (scannerSection as HTMLElement).style.overflow = "hidden";
            (scannerSection as HTMLElement).style.backgroundColor = "#ffffff";
          }

          // Fix the styling for mobile
          if (window.innerWidth < 640) {
            // Make the scan region more compact on mobile
            const scanRegion =
              scannerContainer.querySelector("#qr-shaded-region");
            if (scanRegion) {
              (scanRegion as HTMLElement).style.maxWidth = "90vw";
            }

            // Adjust padding for mobile
            if (scannerSection) {
              (scannerSection as HTMLElement).style.padding = "10px";
            }
          }
        }, 500);
      } catch (error) {
        console.error("Error applying custom styles:", error);
      }
    };

    applyCustomStyles();

    // Apply styles when window resizes
    window.addEventListener("resize", applyCustomStyles);

    return () => {
      window.removeEventListener("resize", applyCustomStyles);
    };
  }, [scriptLoaded, isScannerSupported]);

  // Start scanning when scanner is initialized
  useEffect(() => {
    if (!isScanning || !scannerRef.current) {
      console.log("Not scanning or scanner ref not initialized", {
        isScanning,
        hasRef: !!scannerRef.current,
      });
      return;
    }

    console.log("Setting up scan handlers for QR scanner");

    const handleScanSuccess = async (
      decodedText: string,
      decodedResult: any
    ) => {
      console.log(`Scan result: ${decodedText}`, decodedResult);

      // Debounce mechanism - prevent duplicate scans
      const currentTime = Date.now();
      const isSameCode = lastScannedCode.current === decodedText;
      const isWithinCooldown =
        currentTime - lastScanTime.current < SCAN_COOLDOWN_MS;

      if (isSameCode && isWithinCooldown) {
        console.log(`Duplicate scan detected for ${decodedText}, ignoring...`);
        return; // Ignore duplicate scan
      }

      // Update scan tracking
      lastScanTime.current = currentTime;
      lastScannedCode.current = decodedText;

      // Extract ID from URL if it's a guest URL from our app
      let guestId = decodedText;
      try {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split("/");
        if (pathParts.includes("guests")) {
          const idIndex = pathParts.indexOf("guests") + 1;
          if (idIndex < pathParts.length) {
            guestId = pathParts[idIndex];
          }
        }
      } catch (error) {
        console.warn("Scanned text is not a valid URL:", error);
        // Use the decoded text as is
      }

      try {
        // Update attendance status to "Yes"
        const updatedGuest = await updateAttendedStatus({
          id: guestId,
          attended: "Yes",
        }).unwrap();

        // Set the last scanned guest ID to fetch details
        setLastScannedGuestId(guestId);

        // Show success modal with guest's name
        showCustomAlert(
          "QR Code Scanned",
          `Guest "${updatedGuest.name}" has been marked as attended.`,
          "success"
        );
      } catch (error: any) {
        console.error("Error processing scan:", error);

        // Check if the error is related to already attended guest
        const errorMessage = error?.data?.message ?? error?.message ?? "";
        if (errorMessage.includes("already attended")) {
          showCustomAlert(
            "Already Attended",
            "This guest has already been marked as attended.",
            "warning"
          );
        } else {
          showCustomAlert(
            "Error",
            "QR code scanned, but there was an error updating attendance status.",
            "error"
          );
        }
      }
    };

    const handleScanFailure = (error: string) => {
      // This will be called frequently when no QR code is in view
      // So we don't need to handle every failure
      console.debug("QR code scanning failed", error);
    };

    scannerRef.current.render(handleScanSuccess, handleScanFailure);
  }, [isScanning, updateAttendedStatus]);

  // Handle alert modal close
  const handleAlertClose = () => {
    setShowAlertModal(false);
  };

  // Get info for guest card display
  const getAttendedStatusBadgeColor = (status: string) => {
    return status === "Yes"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  };

  // Animation variants from Guests.tsx
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
        <motion.section
          className="mb-8 md:mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700/50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 md:h-64">
                <Spinner lg />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading QR code scanner...
                </p>
              </div>
            ) : (
              <>
                {!isScannerSupported ? (
                  <motion.div
                    className="flex flex-col items-center justify-center h-48 md:h-64 text-center"
                    variants={itemVariants}
                  >
                    <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                      <svg
                        className="w-8 h-8 md:w-10 md:h-10 text-red-500 dark:text-red-400"
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
                    <h3 className="text-xl font-semibold mb-2 text-warm-charcoal dark:text-white">
                      Scanner Not Available
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-md">
                      Your browser doesn&apos;t support the QR code scanner or
                      camera access is blocked. Please ensure you&apos;re using
                      a modern browser and have granted camera permissions.
                    </p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div
                      id="qr-reader"
                      className="w-full max-w-md mx-auto overflow-hidden rounded-lg"
                    ></div>
                    <p className="mt-4 md:mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
                      Position the QR code within the frame to scan
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.section>

        {/* Instructions Section */}
        <motion.section
          className="mb-8 md:mb-12"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-center text-warm-charcoal dark:text-white">
              How to Use the Scanner
            </h3>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700/30"
              >
                <div className="bg-rich-gold/20 p-2 md:p-3 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-rich-gold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium mb-1 text-center text-warm-charcoal dark:text-white text-sm md:text-base">
                  1. Allow Camera Access
                </h4>
                <p className="text-xs md:text-sm text-center text-gray-600 dark:text-gray-400">
                  When prompted, allow access to your device&apos;s camera
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700/30"
              >
                <div className="bg-rich-gold/20 p-2 md:p-3 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-rich-gold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h4 className="font-medium mb-1 text-center text-warm-charcoal dark:text-white text-sm md:text-base">
                  2. Center the QR Code
                </h4>
                <p className="text-xs md:text-sm text-center text-gray-600 dark:text-gray-400">
                  Position the QR code within the scanner frame
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/70 dark:to-gray-800/50 rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700/30"
              >
                <div className="bg-rich-gold/20 p-2 md:p-3 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-rich-gold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h4 className="font-medium mb-1 text-center text-warm-charcoal dark:text-white text-sm md:text-base">
                  3. Access Guest Data
                </h4>
                <p className="text-xs md:text-sm text-center text-gray-600 dark:text-gray-400">
                  Upon successful scan, you&apos;ll be directed to the guest
                  page
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Alert Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <Modal
            isOpen={showAlertModal}
            onClose={handleAlertClose}
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

              {/* Guest Information Card (only show for success scans) */}
              {alertType === "success" && scannedGuest && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                  <h4 className="font-medium text-center mb-3 text-warm-charcoal dark:text-white">
                    Guest Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Name:
                      </span>
                      <span className="font-medium text-warm-charcoal dark:text-white">
                        {scannedGuest.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAttendedStatusBadgeColor(
                          scannedGuest.attended
                        )}`}
                      >
                        {scannedGuest.attended}
                      </span>
                    </div>
                    {scannedGuest.invitedFrom && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Invited By:
                        </span>
                        <span className="font-medium text-warm-charcoal dark:text-white">
                          {scannedGuest.invitedFrom}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Drinks Coupon:
                      </span>
                      <span className="font-medium text-warm-charcoal dark:text-white">
                        {scannedGuest.drinksCoupon || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Free Entry:
                      </span>
                      <span className="font-medium text-warm-charcoal dark:text-white">
                        {scannedGuest.freeEntry ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Student:
                      </span>
                      <span className="font-medium text-warm-charcoal dark:text-white">
                        {scannedGuest.isStudent ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 justify-center">
                <motion.button
                  onClick={handleAlertClose}
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

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-[10%] w-64 h-64 bg-rich-gold/5 rounded-full blur-3xl transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-[10%] w-96 h-96 bg-accent-amber/5 rounded-full blur-3xl transform translate-y-1/2"></div>
        <div className="absolute top-1/3 right-[15%] w-48 h-48 bg-rich-gold/5 rounded-full blur-2xl"></div>
      </div>
    </motion.div>
  );
};

export default QRScanner;
