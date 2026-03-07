import { useState, useEffect, useRef, useCallback } from "react";
import {
  useGetGuestByIdQuery,
  useUpdateAttendedStatusMutation,
} from "@/redux/features/guests/guestsApiSlice";
import {
  getBrowserInfo,
  detectFeatures,
  checkCameraAvailability,
  releaseCameraStream,
  parseURL,
  type BrowserInfo,
  type FeatureSupport,
} from "@/app/utils/browserCompat";

// ==================== Type Definitions ====================

/** QR code decode result from html5-qrcode */
interface QrCodeDecodedResult {
  decodedText: string;
  result?: {
    text: string;
    format?: { formatName: string };
  };
}

/** Webkit-prefixed CSS style properties */
type WebkitCSSStyleDeclaration = CSSStyleDeclaration & {
  webkitAppearance: string;
  webkitTapHighlightColor: string;
  webkitTransform: string;
};

/** Html5QrcodeScanner configuration */
interface Html5QrcodeScannerConfig {
  fps?: number;
  qrbox?: number | { width: number; height: number };
  aspectRatio?: number;
  disableFlip?: boolean;
  formatsToSupport?: number[];
  rememberLastUsedCamera?: boolean;
  showTorchButtonIfSupported?: boolean;
  supportedScanTypes?: number[];
  experimentalFeatures?: {
    useBarCodeDetectorIfSupported?: boolean;
  };
  videoConstraints?: MediaTrackConstraints;
  html5qrcodeScannerStrings?: {
    scanButtonStopScanningText?: string;
    textIfCameraScanSelected?: string;
  };
}

/** Html5QrcodeScanner instance type */
interface Html5QrcodeScannerType {
  render: (
    onScanSuccess: (decodedText: string, decodedResult: QrCodeDecodedResult) => void,
    onScanFailure?: (error: string) => void,
  ) => void;
  clear: () => Promise<void>;
}

/** Html5QrcodeScanner constructor type */
type Html5QrcodeScannerConstructor = new (
  elementId: string,
  config: Html5QrcodeScannerConfig,
  verbose: boolean,
) => Html5QrcodeScannerType;

/** Extended globalThis with Html5QrcodeScanner */
interface GlobalThisWithScanner {
  Html5QrcodeScanner?: Html5QrcodeScannerConstructor;
}

/** Guest data from API */
interface GuestData {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  attended?: string;
  [key: string]: unknown;
}

/** Scan result type */
interface ScanResult {
  success: boolean;
  guest?: GuestData;
  message: string;
  error?: "warning" | "error";
}

/** Camera status type */
type CameraStatus =
  | "checking"
  | "available"
  | "unavailable"
  | "denied"
  | "not-supported"
  | "in-use";

/** Scanner error types */
type ScannerErrorType =
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "NOT_READABLE"
  | "NOT_SUPPORTED"
  | "SCRIPT_LOAD_FAILED"
  | "INITIALIZATION_FAILED"
  | "UNKNOWN";

/** Scanner error interface */
interface ScannerError {
  type: ScannerErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
}

/** API error response type */
interface ApiError {
  data?: { message?: string };
  message?: string;
}

// ==================== Helper Functions ====================

/**
 * Get QR box size based on browser and screen size
 */
const getQRBoxSize = (browserInfo: BrowserInfo): { width: number; height: number } => {
  if (browserInfo.isMobile) {
    const screenWidth = globalThis.window === undefined ? 300 : globalThis.window.innerWidth;
    const size = Math.min(screenWidth - 60, 250);
    return { width: size, height: size };
  }
  return { width: 280, height: 280 };
};

/**
 * Get browser-specific scanner configuration
 */
const getScannerConfig = (browserInfo: BrowserInfo): Html5QrcodeScannerConfig => {
  const qrbox = getQRBoxSize(browserInfo);

  const baseConfig: Html5QrcodeScannerConfig = {
    fps: browserInfo.isMobile ? 8 : 10,
    qrbox,
    rememberLastUsedCamera: true,
    showTorchButtonIfSupported: browserInfo.isMobile,
    html5qrcodeScannerStrings: {
      scanButtonStopScanningText: "Stop Scanning",
      textIfCameraScanSelected: "Select Camera",
    },
  };

  // iOS Safari specific config
  if (browserInfo.isIOS && browserInfo.isSafari) {
    return {
      ...baseConfig,
      fps: 5,
      disableFlip: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: false,
      },
      videoConstraints: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
      },
    };
  }

  // Android specific config
  if (browserInfo.isAndroid) {
    return {
      ...baseConfig,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
      videoConstraints: {
        facingMode: { exact: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };
  }

  // Safari desktop
  if (browserInfo.isSafari) {
    return {
      ...baseConfig,
      disableFlip: true,
      videoConstraints: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };
  }

  // Firefox specific config
  if (browserInfo.isFirefox) {
    return {
      ...baseConfig,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: false,
      },
    };
  }

  // Chrome, Edge, Brave, Opera - modern browsers with full support
  return {
    ...baseConfig,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true,
    },
  };
};

/**
 * Parse error to user-friendly scanner error
 */
const parseError = (error: unknown, browserInfo: BrowserInfo): ScannerError => {
  const errorObj = error as { message?: string; name?: string } | null;
  const errorMessage = errorObj?.message ?? errorObj?.name ?? String(error);

  if (errorMessage.includes("NotAllowedError") || errorMessage.includes("Permission")) {
    let userMessage =
      "Camera permission was denied. Please allow camera access in your browser settings.";

    if (browserInfo.isIOS && browserInfo.isSafari) {
      userMessage =
        "Camera access denied. Go to Settings > Safari > Camera and allow access for this website.";
    } else if (browserInfo.isSafari) {
      userMessage =
        "Camera access denied. Click the camera icon in the Safari address bar to allow access.";
    } else if (browserInfo.isChrome || browserInfo.isBrave) {
      userMessage =
        "Camera access denied. Click the camera icon in the address bar to allow access.";
    }

    return {
      type: "PERMISSION_DENIED",
      message: errorMessage,
      userMessage,
      recoverable: true,
    };
  }

  if (errorMessage.includes("NotFoundError") || errorMessage.includes("DevicesNotFound")) {
    return {
      type: "NOT_FOUND",
      message: errorMessage,
      userMessage: "No camera device found. Please connect a camera and try again.",
      recoverable: false,
    };
  }

  if (errorMessage.includes("NotReadableError") || errorMessage.includes("TrackStartError")) {
    return {
      type: "NOT_READABLE",
      message: errorMessage,
      userMessage:
        "Camera is currently in use by another application. Please close other apps using the camera and try again.",
      recoverable: true,
    };
  }

  if (errorMessage.includes("NotSupportedError") || errorMessage.includes("getUserMedia")) {
    let userMessage =
      "Your browser doesn't support camera access. Please use a modern browser like Chrome, Firefox, or Safari.";

    if (browserInfo.isIE) {
      userMessage =
        "Internet Explorer doesn't support camera access. Please use Microsoft Edge, Chrome, or Firefox.";
    }

    return {
      type: "NOT_SUPPORTED",
      message: errorMessage,
      userMessage,
      recoverable: false,
    };
  }

  return {
    type: "UNKNOWN",
    message: errorMessage,
    userMessage:
      "An unexpected error occurred while accessing the camera. Please refresh the page and try again.",
    recoverable: true,
  };
};

/**
 * Determine camera status from availability result
 */
const determineCameraStatus = (
  permissionState: string | undefined,
  errorMessage: string | undefined,
): CameraStatus => {
  if (permissionState === "denied") {
    return "denied";
  }
  if (errorMessage?.includes("in use")) {
    return "in-use";
  }
  return "unavailable";
};

// ==================== Main Hook ====================

export const useQRScanner = () => {
  // State
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerSupported, setIsScannerSupported] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [lastScannedGuestId, setLastScannedGuestId] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("checking");
  const [scannerError, setScannerError] = useState<ScannerError | null>(null);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [featureSupport, setFeatureSupport] = useState<FeatureSupport | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const scannerRef = useRef<Html5QrcodeScannerType | null>(null);
  const lastScanTime = useRef<number>(0);
  const lastScannedCode = useRef<string>("");
  const onScanSuccessRef = useRef<((result: ScanResult) => void) | null>(null);
  const isRenderingRef = useRef<boolean>(false);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const initAttemptRef = useRef<number>(0);
  const MAX_INIT_ATTEMPTS = 3;
  const SCAN_COOLDOWN_MS = 3000;

  const [updateAttendedStatus] = useUpdateAttendedStatusMutation();

  // Get guest details if we have a lastScannedGuestId
  const { data: scannedGuest } = useGetGuestByIdQuery(lastScannedGuestId ?? "", {
    skip: !lastScannedGuestId,
  });

  // Initialize browser info and feature detection
  useEffect(() => {
    const info = getBrowserInfo();
    const features = detectFeatures();
    setBrowserInfo(info);
    setFeatureSupport(features);

    console.log(
      "Browser detected:",
      info.name,
      info.version,
      info.isMobile ? "(mobile)" : "(desktop)",
    );
    console.log("Feature support:", features);

    // Check if getUserMedia is supported
    if (!features.getUserMedia) {
      setIsScannerSupported(false);
      setCameraStatus("not-supported");
      setIsLoading(false);
      setScannerError({
        type: "NOT_SUPPORTED",
        message: "getUserMedia not supported",
        userMessage: info.isIE
          ? "Internet Explorer doesn't support camera access. Please use Microsoft Edge, Chrome, or Firefox."
          : "Your browser doesn't support camera access. Please use a modern browser.",
        recoverable: false,
      });
    }
  }, []);

  // Check camera availability
  const checkCamera = useCallback(async () => {
    if (!browserInfo || !featureSupport) return;

    setCameraStatus("checking");

    try {
      const result = await checkCameraAvailability(browserInfo);

      if (result.available) {
        setCameraStatus("available");
        return true;
      } else {
        const status = determineCameraStatus(result.permissionState, result.error);
        setCameraStatus(status);

        if (browserInfo) {
          setScannerError(parseError(new Error(result.error ?? "Camera unavailable"), browserInfo));
        }
        return false;
      }
    } catch (error) {
      console.error("Camera check failed:", error);
      setCameraStatus("unavailable");
      if (browserInfo) {
        setScannerError(parseError(error, browserInfo));
      }
      return false;
    }
  }, [browserInfo, featureSupport]);

  // Load the html5-qrcode library dynamically with retry logic
  useEffect(() => {
    if (!browserInfo || !featureSupport?.getUserMedia) return;

    const globalWithScanner = globalThis as GlobalThisWithScanner;

    const handleScriptError = () => {
      if (retryCount < 2) {
        setRetryCount((prev) => prev + 1);
        console.log(`Retrying script load (attempt ${retryCount + 1})`);
        setTimeout(loadScript, 1000);
      } else {
        setIsScannerSupported(false);
        setIsLoading(false);
        setScannerError({
          type: "SCRIPT_LOAD_FAILED",
          message: "Failed to load QR scanner library",
          userMessage:
            "Failed to load the QR scanner. Please check your internet connection and refresh the page.",
          recoverable: true,
        });
      }
    };

    const loadScript = () => {
      try {
        // Check if library is already available globally
        if (globalWithScanner.Html5QrcodeScanner) {
          console.log("Html5QrcodeScanner already loaded");
          setScriptLoaded(true);
          setIsLoading(false);
          return;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector('script[src*="html5-qrcode"]');
        if (existingScript) {
          // Wait for it to load
          const checkLoaded = setInterval(() => {
            if (globalWithScanner.Html5QrcodeScanner) {
              clearInterval(checkLoaded);
              setScriptLoaded(true);
              setIsLoading(false);
            }
          }, 100);

          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkLoaded);
            if (!globalWithScanner.Html5QrcodeScanner) {
              handleScriptError();
            }
          }, 10000);
          return;
        }

        console.log("Loading Html5QrcodeScanner script");
        const script = document.createElement("script");

        // Use different CDN based on browser for better compatibility
        const cdnUrl = browserInfo.isIE
          ? "https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"
          : "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";

        script.src = cdnUrl;
        script.async = true;
        script.crossOrigin = "anonymous";

        const markScriptReady = () => {
          setScriptLoaded(true);
          setIsLoading(false);
        };

        script.onload = () => {
          console.log("Html5QrcodeScanner script loaded successfully");
          // Add small delay for Safari to ensure script is fully initialized
          const delay = browserInfo.isSafari ? 200 : 0;
          if (delay > 0) {
            setTimeout(markScriptReady, delay);
          } else {
            markScriptReady();
          }
        };

        script.onerror = () => {
          console.error("Failed to load html5-qrcode script");
          handleScriptError();
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error("Error loading script:", error);
        handleScriptError();
      }
    };

    loadScript();

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error("Failed to clear scanner instance", err);
        });
      }
      if (cameraStreamRef.current) {
        releaseCameraStream(cameraStreamRef.current);
        cameraStreamRef.current = null;
      }
    };
  }, [browserInfo, featureSupport, retryCount]);

  // Initialize scanner when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !browserInfo) return;

    const globalWithScanner = globalThis as GlobalThisWithScanner;

    const initializeScanner = async () => {
      try {
        // Check if Html5QrcodeScanner is available
        if (!globalWithScanner.Html5QrcodeScanner) {
          console.error("Html5QrcodeScanner not found in globalThis object");

          if (initAttemptRef.current < MAX_INIT_ATTEMPTS) {
            initAttemptRef.current++;
            console.log(`Retrying scanner initialization (attempt ${initAttemptRef.current})`);
            setTimeout(initializeScanner, 500);
            return;
          }

          setIsScannerSupported(false);
          setScannerError({
            type: "INITIALIZATION_FAILED",
            message: "Scanner library not initialized",
            userMessage: "Failed to initialize the QR scanner. Please refresh the page.",
            recoverable: true,
          });
          return;
        }

        // Check camera availability
        const cameraAvailable = await checkCamera();
        if (!cameraAvailable) {
          console.error("Camera not available");
          setIsScannerSupported(false);
          return;
        }

        // Get browser-specific config
        const config = getScannerConfig(browserInfo);
        console.log("Creating HTML5QrcodeScanner with config:", config);

        // Create scanner instance
        scannerRef.current = new globalWithScanner.Html5QrcodeScanner(
          "qr-reader",
          config,
          false, // verbose
        );

        console.log("HTML5QrcodeScanner instance created successfully");
        setIsScanning(true);
        setScannerError(null);
      } catch (error) {
        console.error("Error initializing scanner:", error);

        if (initAttemptRef.current < MAX_INIT_ATTEMPTS) {
          initAttemptRef.current++;
          console.log(`Retrying scanner initialization (attempt ${initAttemptRef.current})`);
          setTimeout(initializeScanner, 1000);
          return;
        }

        setIsScannerSupported(false);
        setScannerError(parseError(error, browserInfo));
      }
    };

    initializeScanner();
  }, [scriptLoaded, browserInfo, checkCamera]);

  // Start scanning when scanner is initialized
  useEffect(() => {
    if (!isScanning || !scannerRef.current || isRenderingRef.current || !browserInfo) {
      return;
    }

    console.log("Setting up scan handlers for QR scanner");
    isRenderingRef.current = true;

    const isDuplicateScan = (decodedText: string): boolean => {
      const currentTime = Date.now();
      const isSameCode = lastScannedCode.current === decodedText;
      const isWithinCooldown = currentTime - lastScanTime.current < SCAN_COOLDOWN_MS;

      if (isSameCode && isWithinCooldown) {
        console.log(`Duplicate scan detected for "${decodedText}", ignoring...`);
        return true;
      }

      lastScanTime.current = currentTime;
      lastScannedCode.current = decodedText;
      return false;
    };

    const extractGuestId = (decodedText: string): string => {
      const parsedUrl = parseURL(decodedText);
      if (!parsedUrl) return decodedText;

      try {
        const pathParts = parsedUrl.pathname.split("/");
        const guestsIndex = pathParts.indexOf("guests");
        const hasGuestId = guestsIndex >= 0 && guestsIndex + 1 < pathParts.length;
        return hasGuestId ? pathParts[guestsIndex + 1] : decodedText;
      } catch (error) {
        console.warn("Error parsing URL path:", error);
        return decodedText;
      }
    };

    const notifyScanResult = (result: ScanResult) => {
      if (onScanSuccessRef.current) {
        onScanSuccessRef.current(result);
      }
    };

    const buildErrorResult = (apiError: ApiError): ScanResult => {
      const errorMessage = apiError?.data?.message ?? apiError?.message ?? "";
      const alreadyAttended = errorMessage.includes("already attended");
      return alreadyAttended
        ? {
            success: false,
            error: "warning",
            message: "This guest has already been marked as attended.",
          }
        : {
            success: false,
            error: "error",
            message: "QR code scanned, but there was an error updating attendance status.",
          };
    };

    const processScan = async (guestId: string) => {
      try {
        const updatedGuest = await updateAttendedStatus({
          id: guestId,
          attended: "Yes",
        }).unwrap();

        setLastScannedGuestId(guestId);

        const guestData = updatedGuest as unknown as GuestData;
        notifyScanResult({
          success: true,
          guest: guestData,
          message: `Guest "${guestData.name}" has been marked as attended.`,
        });
      } catch (error: unknown) {
        console.error("Error processing scan:", error);
        notifyScanResult(buildErrorResult(error as ApiError));
      }
    };

    const handleScanSuccess = async (decodedText: string, _decodedResult: QrCodeDecodedResult) => {
      console.log(`Scan result: ${decodedText}`, _decodedResult);

      if (isDuplicateScan(decodedText)) return;

      const guestId = extractGuestId(decodedText);
      await processScan(guestId);
    };

    const handleScanFailure = (error: string) => {
      // This is called frequently when no QR code is in view - suppress in production
      if (process.env.NODE_ENV === "development") {
        console.debug("QR scan attempt:", error);
      }
    };

    try {
      scannerRef.current.render(handleScanSuccess, handleScanFailure);
      console.log("Scanner handlers registered successfully");
    } catch (error) {
      console.error("Error setting up scanner handlers:", error);
      isRenderingRef.current = false;
      setScannerError(parseError(error, browserInfo));
    }

    return () => {
      isRenderingRef.current = false;
    };
  }, [isScanning, updateAttendedStatus, browserInfo]);

  // Apply custom styling for the scanner with cross-browser support
  useEffect(() => {
    if (!scriptLoaded || !isScannerSupported || !browserInfo) return;

    console.log("Applying custom styles to scanner UI");

    const styleStopButton = (button: HTMLButtonElement) => {
      button.classList.add("stop-btn");

      const webkitStyle = button.style as WebkitCSSStyleDeclaration;

      // Use cross-browser compatible styles
      const styles: Partial<CSSStyleDeclaration> = {
        backgroundColor: "#1a1b26",
        color: "#ffffff",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        padding: "10px 18px",
        borderRadius: "8px",
        margin: "10px 10px 10px 0",
        fontWeight: "500",
        fontSize: "0.9rem",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        minHeight: "44px",
        minWidth: "44px",
      };

      Object.assign(button.style, styles);

      // Mobile responsive
      if (browserInfo.isMobile && globalThis.window !== undefined && window.innerWidth < 640) {
        button.style.width = "calc(50% - 15px)";
        button.style.padding = "12px 16px";
      }

      // Safari-specific webkit fixes
      if (browserInfo.isSafari) {
        webkitStyle.webkitAppearance = "none";
        webkitStyle.webkitTapHighlightColor = "transparent";
      }
    };

    const styleTorchButton = (button: HTMLButtonElement) => {
      button.classList.add("torch-btn");

      const webkitStyle = button.style as WebkitCSSStyleDeclaration;

      const styles: Partial<CSSStyleDeclaration> = {
        backgroundImage: "linear-gradient(to right, #d4af37, #f0c64b)",
        color: "#1a1b26",
        border: "none",
        padding: "10px 18px",
        borderRadius: "8px",
        margin: "10px 0 10px 10px",
        fontWeight: "500",
        fontSize: "0.9rem",
        boxShadow: "0 2px 8px rgba(212, 175, 55, 0.3)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        minHeight: "44px",
        minWidth: "44px",
      };

      Object.assign(button.style, styles);

      // Mobile responsive
      if (browserInfo.isMobile && globalThis.window !== undefined && window.innerWidth < 640) {
        button.style.width = "calc(50% - 15px)";
        button.style.padding = "12px 16px";
      }

      // Safari fixes
      if (browserInfo.isSafari) {
        webkitStyle.webkitAppearance = "none";
        webkitStyle.webkitTapHighlightColor = "transparent";
        // Use webkit gradient for Safari
        button.style.background = "-webkit-linear-gradient(left, #d4af37, #f0c64b)";
      }
    };

    const styleButton = (button: HTMLButtonElement) => {
      const text = button.innerText || button.textContent || "";
      if (text.includes("Stop")) {
        styleStopButton(button);
      } else if (text.includes("Torch") || text.includes("Flash")) {
        styleTorchButton(button);
      }
    };

    const styleSelectElement = (select: HTMLSelectElement) => {
      const webkitStyle = select.style as WebkitCSSStyleDeclaration;

      const styles: Partial<CSSStyleDeclaration> = {
        backgroundColor: "#f8f9fa",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        padding: "8px 12px",
        width: "100%",
        marginBottom: "15px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        color: "#4a5568",
        fontSize: browserInfo.isMobile ? "16px" : "0.9rem",
        minHeight: "44px",
      };

      Object.assign(select.style, styles);

      // Safari fixes
      if (browserInfo.isSafari) {
        webkitStyle.webkitAppearance = "menulist";
      }

      if (!browserInfo.isMobile && globalThis.window !== undefined && window.innerWidth >= 640) {
        select.style.maxWidth = "300px";
      }
    };

    const styleScannerSection = (scannerContainer: HTMLElement) => {
      const scannerSection = scannerContainer.querySelector<HTMLElement>("#reader");
      if (scannerSection) {
        const webkitStyle = scannerSection.style as WebkitCSSStyleDeclaration;

        scannerSection.style.boxShadow = "none";
        scannerSection.style.border = "2px solid rgba(212, 175, 55, 0.2)";
        scannerSection.style.borderRadius = "12px";
        scannerSection.style.overflow = "hidden";
        scannerSection.style.backgroundColor = "#ffffff";

        // Fix for Safari video rendering
        if (browserInfo.isSafari) {
          scannerSection.style.transform = "translateZ(0)";
          webkitStyle.webkitTransform = "translateZ(0)";
        }
      }

      // Style the video element for proper rendering
      const video = scannerContainer.querySelector("video");
      if (video) {
        video.style.objectFit = "cover";
        video.style.borderRadius = "8px";

        // iOS Safari video fixes
        if (browserInfo.isIOS) {
          video.setAttribute("playsinline", "true");
          video.setAttribute("webkit-playsinline", "true");
          video.setAttribute("muted", "true");
        }
      }
    };

    const processElements = () => {
      const scannerContainer = document.getElementById("qr-reader");
      if (!scannerContainer) return;

      // Style buttons
      const buttons = scannerContainer.querySelectorAll("button");
      buttons.forEach(styleButton);

      // Style selects
      const selectElements = scannerContainer.querySelectorAll("select");
      selectElements.forEach(styleSelectElement);

      // Style main scanner section
      styleScannerSection(scannerContainer);

      // Style file input for fallback scanning
      const fileInputs = scannerContainer.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => {
        const fileInput = input as HTMLInputElement;
        fileInput.style.fontSize = browserInfo.isMobile ? "16px" : "0.9rem";
      });
    };

    const applyCustomStyles = () => {
      try {
        // Delay for DOM to be ready
        setTimeout(processElements, 500);
        // Apply again after a longer delay for dynamic elements
        setTimeout(processElements, 1500);
      } catch (error) {
        console.error("Error applying custom styles:", error);
      }
    };

    applyCustomStyles();

    // Handle resize for responsive styles
    const handleResize = () => {
      requestAnimationFrame(applyCustomStyles);
    };

    window.addEventListener("resize", handleResize);

    // Handle orientation change for mobile
    const handleOrientationChange = () => {
      setTimeout(applyCustomStyles, 300);
    };

    globalThis.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      globalThis.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [scriptLoaded, isScannerSupported, browserInfo]);

  // Retry scanner initialization
  const retryScanner = useCallback(async () => {
    setIsLoading(true);
    setScannerError(null);
    setIsScannerSupported(true);
    setCameraStatus("checking");
    initAttemptRef.current = 0;

    // Clear existing scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.error("Error clearing scanner:", e);
      }
      scannerRef.current = null;
    }

    // Release camera stream
    if (cameraStreamRef.current) {
      releaseCameraStream(cameraStreamRef.current);
      cameraStreamRef.current = null;
    }

    isRenderingRef.current = false;
    setIsScanning(false);

    // Trigger re-initialization by incrementing retry count
    setRetryCount((prev) => prev + 1);
  }, []);

  // Set scan success callback
  const setScanSuccessCallback = useCallback((callback: (result: ScanResult) => void) => {
    onScanSuccessRef.current = callback;
  }, []);

  return {
    // State
    isLoading,
    isScannerSupported,
    scannedGuest,
    lastScannedGuestId,
    cameraStatus,
    scannerError,
    browserInfo,
    featureSupport,

    // Actions
    setScanSuccessCallback,
    setLastScannedGuestId,
    retryScanner,
    checkCamera,
  };
};
