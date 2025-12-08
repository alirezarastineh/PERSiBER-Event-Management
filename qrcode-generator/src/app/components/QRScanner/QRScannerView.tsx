import { motion } from "framer-motion";
import Spinner from "../Common/Spinner";
import { QRScannerViewProps } from "@/types/qr";

export default function QRScannerView({
  isLoading,
  isScannerSupported,
  variants,
  itemVariants,
  scannerError,
  browserInfo,
  cameraStatus,
  onRetry,
}: Readonly<QRScannerViewProps>) {
  // Get appropriate error icon based on error type
  const getErrorIcon = () => {
    if (cameraStatus === "denied") {
      return (
        <svg
          className="w-8 h-8 md:w-10 md:h-10 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      );
    }

    if (cameraStatus === "not-supported") {
      return (
        <svg
          className="w-8 h-8 md:w-10 md:h-10 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-8 h-8 md:w-10 md:h-10 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  // Get error title
  const getErrorTitle = () => {
    if (cameraStatus === "denied") {
      return "Camera Access Denied";
    }
    if (cameraStatus === "not-supported") {
      return "Browser Not Supported";
    }
    if (cameraStatus === "in-use") {
      return "Camera In Use";
    }
    if (scannerError?.type === "SCRIPT_LOAD_FAILED") {
      return "Scanner Load Failed";
    }
    return "Scanner Not Available";
  };

  // Get error message
  const getErrorMessage = () => {
    if (scannerError?.userMessage) {
      return scannerError.userMessage;
    }

    if (cameraStatus === "denied") {
      if (browserInfo?.isIOS && browserInfo?.isSafari) {
        return "Camera access was denied. Go to Settings > Safari > Camera and allow access for this website.";
      }
      if (browserInfo?.isSafari) {
        return "Camera access was denied. Click the camera icon in the Safari address bar to allow access.";
      }
      return "Camera access was denied. Please allow camera access in your browser settings and try again.";
    }

    if (cameraStatus === "not-supported") {
      if (browserInfo?.isIE) {
        return "Internet Explorer doesn't support camera access. Please use Microsoft Edge, Chrome, or Firefox.";
      }
      return "Your browser doesn't support the QR code scanner. Please use a modern browser like Chrome, Firefox, Safari, or Edge.";
    }

    if (cameraStatus === "in-use") {
      return "The camera is currently being used by another application. Please close other apps using the camera and try again.";
    }

    return "Your browser doesn't support the QR code scanner or camera access is blocked. Please ensure you're using a modern browser and have granted camera permissions.";
  };

  // Get browser-specific instructions
  const getBrowserInstructions = () => {
    if (!browserInfo || cameraStatus !== "denied") return null;

    let instructions: string[] = [];

    if (browserInfo.isChrome || browserInfo.isBrave) {
      instructions = [
        "Click the camera/lock icon in the address bar",
        "Select 'Allow' for camera access",
        "Refresh the page",
      ];
    } else if (browserInfo.isSafari) {
      if (browserInfo.isIOS) {
        instructions = [
          "Open Settings app on your device",
          "Scroll down and tap Safari",
          "Tap Camera and select 'Allow'",
          "Return to this page and refresh",
        ];
      } else {
        instructions = [
          "Click Safari in the menu bar",
          "Select Settings for this Website",
          "Change Camera to 'Allow'",
          "Refresh the page",
        ];
      }
    } else if (browserInfo.isFirefox) {
      instructions = [
        "Click the camera icon in the address bar",
        "Select 'Allow' from the dropdown",
        "Refresh the page",
      ];
    } else if (browserInfo.isEdge) {
      instructions = [
        "Click the lock icon in the address bar",
        "Click 'Site permissions'",
        "Allow camera access",
        "Refresh the page",
      ];
    }

    if (instructions.length === 0) return null;

    return (
      <div className="mt-4 text-left bg-gray-700/50 rounded-lg p-4">
        <p className="text-sm text-gray-300 font-medium mb-2">How to enable camera:</p>
        <ol className="text-sm text-gray-400 list-decimal list-inside space-y-1">
          {instructions.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <motion.section
      className="mb-8 md:mb-12"
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {/* 
        Cross-browser compatible container with fallbacks:
        - backdrop-filter with -webkit prefix for Safari
        - Fallback background for browsers without backdrop-filter support
      */}
      <div
        className="bg-gray-800/60 rounded-2xl p-4 md:p-8 shadow-lg border border-gray-700/50"
        style={{
          // Fallback for browsers without backdrop-filter
          backgroundColor: "rgba(31, 41, 55, 0.85)",
          // Vendor-prefixed backdrop-filter
          WebkitBackdropFilter: "blur(8px)",
          backdropFilter: "blur(8px)",
        }}
      >
        {isLoading ? (
          <div
            className="flex flex-col items-center justify-center h-48 md:h-64"
            aria-live="polite"
          >
            <Spinner lg />
            <p className="mt-4 text-gray-400">Loading QR code scanner...</p>
            {browserInfo && (
              <p className="mt-2 text-xs text-gray-500">
                Detected: {browserInfo.name} {browserInfo.isMobile ? "(Mobile)" : "(Desktop)"}
              </p>
            )}
          </div>
        ) : (
          <>
            {isScannerSupported ? (
              <div className="flex flex-col items-center">
                {/* 
                  QR Reader container with cross-browser compatible styles
                  The html5-qrcode library will mount here
                */}
                <div
                  id="qr-reader"
                  className="w-full max-w-md mx-auto overflow-hidden rounded-lg"
                  style={{
                    // Ensure proper rendering on all browsers
                    transform: "translateZ(0)",
                    WebkitTransform: "translateZ(0)",
                    // Prevent iOS Safari tap highlight
                    WebkitTapHighlightColor: "transparent",
                  }}
                  role="application"
                  aria-label="QR Code Scanner"
                />
                <p className="mt-4 md:mt-6 text-sm text-center text-gray-400">
                  Position the QR code within the frame to scan
                </p>
                {/* Show camera status hint on mobile */}
                {browserInfo?.isMobile && cameraStatus === "available" && (
                  <p className="mt-2 text-xs text-gray-500">
                    Tip: Ensure good lighting for best scanning results
                  </p>
                )}
              </div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center min-h-48 md:min-h-64 text-center px-4"
                variants={itemVariants}
                role="alert"
                aria-live="assertive"
              >
                {/* Error Icon */}
                <div
                  className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 mx-auto rounded-full mb-4 ${
                    cameraStatus === "denied" ? "bg-amber-900/30" : "bg-red-900/30"
                  }`}
                >
                  {getErrorIcon()}
                </div>

                {/* Error Title */}
                <h3 className="text-xl font-semibold mb-2 text-white">{getErrorTitle()}</h3>

                {/* Error Message */}
                <p className="text-sm md:text-base text-gray-400 max-w-md">{getErrorMessage()}</p>

                {/* Browser-specific instructions */}
                {getBrowserInstructions()}

                {/* Retry Button */}
                {scannerError?.recoverable && onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-6 px-6 py-3 bg-linear-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    style={{
                      // Ensure minimum touch target size
                      minHeight: "44px",
                      minWidth: "44px",
                      // Safari tap highlight fix
                      WebkitTapHighlightColor: "transparent",
                    }}
                    aria-label="Try again to access camera"
                  >
                    Try Again
                  </button>
                )}

                {/* Alternative: File upload hint */}
                {!isScannerSupported && (
                  <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">Alternative:</span> The scanner
                      also supports uploading an image of a QR code if camera scanning is not
                      available.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}
