import { useState, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { useFindOrCreateGuestMutation } from "@/redux/features/guests/guestsApiSlice";

export const useQRCodeGeneration = () => {
  const [text, setText] = useState("");
  const [currentGuest, setCurrentGuest] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const qrCodeRef = useRef<HTMLCanvasElement | null>(null);
  const [findOrCreateGuest] = useFindOrCreateGuestMutation();

  const generateQRCode = async () => {
    if (!text.trim()) {
      throw new Error("Please enter a guest's name.");
    }

    setLoading(true);
    try {
      const guestResponse = await findOrCreateGuest(text.trim()).unwrap();
      const guestUrl = `${window.location.origin}/guests/${guestResponse._id}`;
      const url = await QRCode.toDataURL(guestUrl, { width: 800, margin: 2 });
      setQrCodeUrl(url);
      setCurrentGuest(text.trim());
      return { success: true, guestResponse };
    } catch (error) {
      console.error(
        "Error generating QR code or finding/creating guest:",
        error
      );
      throw new Error("Failed to generate QR code or find/create guest.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrCodeSize = 110;
    const qrCodeX = (pageWidth - qrCodeSize) / 2;
    const qrCodeY = 130;

    // Format the guest name with proper casing
    const formattedText = currentGuest
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // Colors (Persian Gala)
    const gold = { r: 255, g: 198, b: 71 }; // #ffc647
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };

    // ===== BACKGROUND: Black -> Gold vertical gradient =====
    for (let y = 0; y < pageHeight; y += 1) {
      const t = y / pageHeight;
      // Bias the interpolation toward black so most of the page is darker
      const biased = Math.pow(t, 2.2);
      const r = Math.round(black.r + (gold.r - black.r) * biased);
      const g = Math.round(black.g + (gold.g - black.g) * biased);
      const b = Math.round(black.b + (gold.b - black.b) * biased);
      doc.setFillColor(r, g, b);
      doc.rect(0, y, pageWidth, 1, "F");
    }

    // ===== HEADER (minimal, no shadow) =====
    doc.setFont("times", "bold");
    doc.setFontSize(46);
    doc.setTextColor(white.r, white.g, white.b);
    doc.text("PERSIAN GALA", pageWidth / 2, 58, { align: "center" });

    // Date • Day • Time line
    doc.setFont("times", "normal");
    doc.setFontSize(13);
    doc.setTextColor(white.r, white.g, white.b);
    doc.text("SATURDAY · NOVEMBER 22 · 9 PM – 3 AM", pageWidth / 2, 72, {
      align: "center",
    });

    // Guest name (invitation personalization)
    if (formattedText) {
      doc.setFont("times", "bold");
      doc.setFontSize(28);
      doc.setTextColor(gold.r, gold.g, gold.b);
      // Position the guest name lower, closer to the QR code
      doc.text(formattedText.toUpperCase(), pageWidth / 2, 100, {
        align: "center",
      });
    }

    // ===== QR CODE WITH MODERN DOUBLE FRAME =====
    doc.setDrawColor(gold.r, gold.g, gold.b);
    doc.setLineWidth(2.4);
    doc.roundedRect(
      qrCodeX - 8,
      qrCodeY - 8,
      qrCodeSize + 16,
      qrCodeSize + 16,
      6,
      6,
      "S"
    );

    doc.setDrawColor(white.r, white.g, white.b);
    doc.setLineWidth(0.8);
    doc.roundedRect(
      qrCodeX - 3,
      qrCodeY - 3,
      qrCodeSize + 6,
      qrCodeSize + 6,
      4,
      4,
      "S"
    );

    doc.setFillColor(white.r, white.g, white.b);
    doc.roundedRect(qrCodeX, qrCodeY, qrCodeSize, qrCodeSize, 3, 3, "F");
    doc.addImage(qrCodeUrl, "PNG", qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

    // ===== EVENT DETAILS =====
    const detailsStartY = qrCodeY + qrCodeSize + 22;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(black.r, black.g, black.b);
    doc.text("DRESS CODE", pageWidth / 2, detailsStartY, { align: "center" });
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(black.r, black.g, black.b);
    doc.text("BLACK COCKTAIL", pageWidth / 2, detailsStartY + 12, {
      align: "center",
    });

    // Admission (no address)
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(white.r, white.g, white.b);
    doc.text("ADMISSION", pageWidth / 2, detailsStartY + 54, {
      align: "center",
    });
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(black.r, black.g, black.b);
    // Place €15 slightly lower for emphasis; black text contrasts with gold gradient near bottom
    doc.text("€15", pageWidth / 2, detailsStartY + 68, { align: "center" });

    // ===== SAVE FILE =====
    const pdfFileName = `${formattedText} - Persian Gala - PERSiBER Nov 22.pdf`;
    doc.save(pdfFileName);
  };

  const clearForm = () => {
    setText("");
    setCurrentGuest("");
    setQrCodeUrl("");
  };

  return {
    // State
    text,
    currentGuest,
    qrCodeUrl,
    loading,
    qrCodeRef,

    // Actions
    setText,
    generateQRCode,
    downloadPDF,
    clearForm,
  };
};
