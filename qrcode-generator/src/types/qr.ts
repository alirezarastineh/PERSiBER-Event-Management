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

export interface QRScannerViewProps {
  readonly isLoading: boolean;
  readonly isScannerSupported: boolean;
  readonly variants?: any;
  readonly itemVariants?: any;
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
