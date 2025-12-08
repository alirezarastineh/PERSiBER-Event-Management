import type { BrowserInfo, FeatureSupport } from "@/app/utils/browserCompat";

export interface QRCodeInputProps {
  readonly text: string;
  readonly setText: (value: string) => void;
  readonly onGenerate: () => void;
  readonly loading: boolean;
}

export interface QRCodePreviewProps {
  readonly qrCodeUrl: string;
  readonly currentGuest: string;
  readonly qrCodeRef: React.RefObject<HTMLCanvasElement | null>;
  readonly onDownloadPDF: () => void;
}

// Scanner error type for cross-browser error handling
export type ScannerErrorType =
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "NOT_READABLE"
  | "NOT_SUPPORTED"
  | "SCRIPT_LOAD_FAILED"
  | "INITIALIZATION_FAILED"
  | "UNKNOWN";

export interface ScannerError {
  type: ScannerErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
}

// Camera status for cross-browser camera handling
export type CameraStatus =
  | "checking"
  | "available"
  | "unavailable"
  | "denied"
  | "not-supported"
  | "in-use";

export interface QRScannerViewProps {
  readonly isLoading: boolean;
  readonly isScannerSupported: boolean;
  readonly variants?: any;
  readonly itemVariants?: any;
  // Cross-browser compatibility props
  readonly scannerError?: ScannerError | null;
  readonly browserInfo?: BrowserInfo | null;
  readonly cameraStatus?: CameraStatus;
  readonly onRetry?: () => void;
}

export interface QRScannerInstructionsProps {
  readonly variants?: any;
  readonly containerVariants?: any;
  readonly itemVariants?: any;
}

export interface QRCodeProps {
  text: string;
  qrCodeUrl: string;
  setQrCodeUrl: (url: string) => void;
}

// Scan result type
export interface ScanResult {
  success: boolean;
  guest?: any;
  message: string;
  error?: "warning" | "error";
}

// QR Scanner hook return type
export interface UseQRScannerReturn {
  // State
  isLoading: boolean;
  isScannerSupported: boolean;
  scannedGuest: any;
  lastScannedGuestId: string | null;
  cameraStatus: CameraStatus;
  scannerError: ScannerError | null;
  browserInfo: BrowserInfo | null;
  featureSupport: FeatureSupport | null;
  // Actions
  setScanSuccessCallback: (callback: (result: ScanResult) => void) => void;
  setLastScannedGuestId: (id: string | null) => void;
  retryScanner: () => Promise<void>;
  checkCamera: () => Promise<boolean>;
}
