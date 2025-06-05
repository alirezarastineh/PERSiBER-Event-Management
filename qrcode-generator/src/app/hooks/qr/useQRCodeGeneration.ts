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
    const qrCodeSize = 100;
    const qrCodeX = (pageWidth - qrCodeSize) / 2;
    const qrCodeY = pageHeight / 2 - 30;

    // Format the guest name with proper casing
    const formattedText = currentGuest
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // ===== TROPICAL GRADIENT BACKGROUND =====
    for (let i = 0; i < pageHeight; i += 2) {
      const ratio = i / pageHeight;
      const r = Math.round(65 + (255 - 65) * ratio);
      const g = Math.round(130 + (215 - 130) * ratio);
      const b = Math.round(246 - (246 - 135) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(0, i, pageWidth, 2, "F");
    }

    // ===== TROPICAL BORDER =====
    const borderWidth = 4;
    const borderMargin = 12;
    doc.setDrawColor(255, 165, 0);
    doc.setLineWidth(borderWidth);
    doc.roundedRect(
      borderMargin,
      borderMargin,
      pageWidth - 2 * borderMargin,
      pageHeight - 2 * borderMargin,
      5,
      5,
      "S"
    );

    // ===== HEADER - SUMMER PARTY BRANDING =====
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Private Summer Party", pageWidth / 2, 45, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("BBQ, INDOOR & OPEN AIR PARTY ALL NIGHT LONG", pageWidth / 2, 55, {
      align: "center",
    });

    // ===== GUEST NAME =====
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");

    doc.setFontSize(28);
    doc.setTextColor(255, 215, 0);
    doc.setFont("helvetica", "bold");
    doc.text(formattedText, pageWidth / 2, 80, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(255, 215, 0);
    doc.setFont("helvetica", "bold");
    doc.text("DRESS CODE: HAWAIIAN", pageWidth / 2, 95, {
      align: "center",
    });

    // ===== QR CODE WITH TROPICAL FRAME =====
    doc.setDrawColor(255, 165, 0);
    doc.setLineWidth(3);
    doc.roundedRect(
      qrCodeX - 6,
      qrCodeY - 6,
      qrCodeSize + 12,
      qrCodeSize + 12,
      5,
      5,
      "S"
    );

    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1);
    doc.roundedRect(
      qrCodeX - 3,
      qrCodeY - 3,
      qrCodeSize + 6,
      qrCodeSize + 6,
      3,
      3,
      "S"
    );

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrCodeX, qrCodeY, qrCodeSize, qrCodeSize, 2, 2, "F");

    doc.addImage(qrCodeUrl, "PNG", qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

    // ===== EVENT DETAILS =====
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("SATURDAY AUGUST 16", pageWidth / 2, qrCodeY + qrCodeSize + 30, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.text("6 PM - 4 AM", pageWidth / 2, qrCodeY + qrCodeSize + 45, {
      align: "center",
    });

    // ===== SAVE FILE =====
    const pdfFileName = `${formattedText} - Summer Party - PERSiBER August 16.pdf`;
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
