import { useState, useEffect, useRef, useCallback } from "react";
import {
  useGetGuestByIdQuery,
  useUpdateAttendedStatusMutation,
} from "@/redux/features/guests/guestsApiSlice";

// Types for the Html5QrcodeScanner
type Html5QrcodeScannerConfig = {
  fps?: number;
  qrbox?: number | { width: number; height: number };
  aspectRatio?: number;
  disableFlip?: boolean;
  formatsToSupport?: any[];
  rememberLastUsedCamera?: boolean;
  showTorchButtonIfSupported?: boolean;
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

type ScanResult = {
  success: boolean;
  guest?: any;
  message: string;
  error?: "warning" | "error";
};

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerSupported, setIsScannerSupported] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [lastScannedGuestId, setLastScannedGuestId] = useState<string | null>(
    null
  );

  const scannerRef = useRef<Html5QrcodeScannerType | null>(null);
  const lastScanTime = useRef<number>(0);
  const lastScannedCode = useRef<string>("");
  const onScanSuccessRef = useRef<((result: ScanResult) => void) | null>(null);
  const isRenderingRef = useRef<boolean>(false); // Prevent multiple renders
  const SCAN_COOLDOWN_MS = 3000; // Increase cooldown to 3 seconds for better protection

  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();

  // Get guest details if we have a lastScannedGuestId
  const { data: scannedGuest } = useGetGuestByIdQuery(
    lastScannedGuestId ?? "",
    {
      skip: !lastScannedGuestId,
    }
  );

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
          return;
        }

        // Check camera permissions
        if (!(await checkCameraPermission())) {
          console.error("Camera permission denied");
          setIsScannerSupported(false);
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
      }
    };

    initializeScanner();
  }, [scriptLoaded]);

  // Start scanning when scanner is initialized - using the same pattern as the working version
  useEffect(() => {
    if (!isScanning || !scannerRef.current || isRenderingRef.current) {
      console.log(
        "Not scanning, scanner ref not initialized, or already rendering",
        {
          isScanning,
          hasRef: !!scannerRef.current,
          isRendering: isRenderingRef.current,
        }
      );
      return;
    }

    console.log("Setting up scan handlers for QR scanner");
    isRenderingRef.current = true; // Mark as rendering to prevent multiple calls

    const handleScanSuccess = async (
      decodedText: string,
      decodedResult: any
    ) => {
      console.log(`Scan result: ${decodedText}`, decodedResult);

      // Enhanced debounce mechanism - prevent duplicate scans
      const currentTime = Date.now();
      const isSameCode = lastScannedCode.current === decodedText;
      const isWithinCooldown =
        currentTime - lastScanTime.current < SCAN_COOLDOWN_MS;

      if (isSameCode && isWithinCooldown) {
        console.log(
          `Duplicate scan detected for "${decodedText}", ignoring... (cooldown: ${Math.round(
            (SCAN_COOLDOWN_MS - (currentTime - lastScanTime.current)) / 1000
          )}s remaining)`
        );
        return;
      }

      // Update scan tracking immediately to block subsequent calls
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

        const result: ScanResult = {
          success: true,
          guest: updatedGuest,
          message: `Guest "${updatedGuest.name}" has been marked as attended.`,
        };

        // Call the callback if it exists
        if (onScanSuccessRef.current) {
          onScanSuccessRef.current(result);
        }
      } catch (error: any) {
        console.error("Error processing scan:", error);

        // Check if the error is related to already attended guest
        const errorMessage = error?.data?.message ?? error?.message ?? "";
        const result: ScanResult = errorMessage.includes("already attended")
          ? {
              success: false,
              error: "warning",
              message: "This guest has already been marked as attended.",
            }
          : {
              success: false,
              error: "error",
              message:
                "QR code scanned, but there was an error updating attendance status.",
            };

        // Call the callback if it exists
        if (onScanSuccessRef.current) {
          onScanSuccessRef.current(result);
        }
      }
    };

    const handleScanFailure = (error: string) => {
      // This will be called frequently when no QR code is in view
      console.debug("QR code scanning failed", error);
    };

    try {
      scannerRef.current.render(handleScanSuccess, handleScanFailure);
      console.log("Scanner handlers registered successfully");
    } catch (error) {
      console.error("Error setting up scanner handlers:", error);
      isRenderingRef.current = false; // Reset on error
    }

    // Cleanup function to reset rendering flag
    return () => {
      isRenderingRef.current = false;
    };
  }, [isScanning, updateAttendedStatus]);

  // Apply custom styling for the scanner - same as working version
  useEffect(() => {
    if (!scriptLoaded || !isScannerSupported) return;

    console.log("Applying custom styles to scanner UI");

    const styleStopButton = (button: HTMLButtonElement) => {
      button.classList.add("stop-btn");
      button.style.backgroundColor = "#1a1b26";
      button.style.color = "#ffffff";
      button.style.border = "1px solid rgba(212, 175, 55, 0.3)";
      button.style.padding = "10px 18px";
      button.style.borderRadius = "8px";
      button.style.margin = "10px 10px 10px 0";
      button.style.fontWeight = "500";
      button.style.fontSize = "0.9rem";
      button.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
      button.style.transition = "all 0.2s ease";

      if (window.innerWidth < 640) {
        button.style.width = "calc(50% - 15px)";
      }
    };

    const styleTorchButton = (button: HTMLButtonElement) => {
      button.classList.add("torch-btn");
      button.style.backgroundImage =
        "linear-gradient(to right, #d4af37, #f0c64b)";
      button.style.color = "#1a1b26";
      button.style.border = "none";
      button.style.padding = "10px 18px";
      button.style.borderRadius = "8px";
      button.style.margin = "10px 0 10px 10px";
      button.style.fontWeight = "500";
      button.style.fontSize = "0.9rem";
      button.style.boxShadow = "0 2px 8px rgba(212, 175, 55, 0.3)";
      button.style.transition = "all 0.2s ease";

      if (window.innerWidth < 640) {
        button.style.width = "calc(50% - 15px)";
      }
    };

    const styleButton = (button: HTMLButtonElement) => {
      if (button.innerText === "Stop Scanning") {
        styleStopButton(button);
      } else if (button.innerText.includes("Torch")) {
        styleTorchButton(button);
      }
    };

    const styleSelectElement = (select: HTMLSelectElement) => {
      select.style.backgroundColor = "#f8f9fa";
      select.style.border = "1px solid #e2e8f0";
      select.style.borderRadius = "6px";
      select.style.padding = "8px 12px";
      select.style.width = "100%";
      select.style.marginBottom = "15px";
      select.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
      select.style.color = "#4a5568";
      select.style.fontSize = "0.9rem";

      if (window.innerWidth >= 640) {
        select.style.maxWidth = "300px";
      }
    };

    const styleScannerSection = (scannerContainer: HTMLElement) => {
      const scannerSection = scannerContainer.querySelector("#reader");
      if (scannerSection) {
        (scannerSection as HTMLElement).style.boxShadow = "none";
        (scannerSection as HTMLElement).style.border =
          "2px solid rgba(212, 175, 55, 0.2)";
        (scannerSection as HTMLElement).style.borderRadius = "12px";
        (scannerSection as HTMLElement).style.overflow = "hidden";
        (scannerSection as HTMLElement).style.backgroundColor = "#ffffff";
      }
    };

    const processElements = () => {
      const scannerContainer = document.getElementById("qr-reader");
      if (!scannerContainer) return;

      const buttons = scannerContainer.querySelectorAll("button");
      buttons.forEach(styleButton);

      const selectElements = scannerContainer.querySelectorAll("select");
      selectElements.forEach(styleSelectElement);

      styleScannerSection(scannerContainer);
    };

    const applyCustomStyles = () => {
      try {
        setTimeout(processElements, 500);
      } catch (error) {
        console.error("Error applying custom styles:", error);
      }
    };

    applyCustomStyles();
    window.addEventListener("resize", applyCustomStyles);

    return () => {
      window.removeEventListener("resize", applyCustomStyles);
    };
  }, [scriptLoaded, isScannerSupported]);

  // Function to set the scan success callback - using ref to avoid re-renders
  const setScanSuccessCallback = useCallback(
    (callback: (result: ScanResult) => void) => {
      onScanSuccessRef.current = callback;
    },
    []
  );

  return {
    // State
    isLoading,
    isScannerSupported,
    scannedGuest,
    lastScannedGuestId,

    // Actions
    setScanSuccessCallback,
    setLastScannedGuestId,
  };
};
