"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { useFindOrCreateGuestMutation } from "@/redux/features/guests/guestsApiSlice"; // Import the mutation

const QRCodeComponent = () => {
  const [text, setText] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const qrCodeRef = useRef<HTMLCanvasElement | null>(null);
  const [findOrCreateGuest] = useFindOrCreateGuestMutation(); // Hook for mutation
  const [loading, setLoading] = useState(false); // State to manage loading

  useEffect(() => {
    if (qrCodeUrl && qrCodeRef.current) {
      const canvas = qrCodeRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        const img = new Image();
        img.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = qrCodeUrl;
      }
    }
  }, [qrCodeUrl]);

  const generateQRCode = async () => {
    if (!text.trim()) {
      alert("Please enter a guest's name.");
      return;
    }

    setLoading(true); // Set loading to true while generating QR code
    try {
      // Find or create the guest and get the response
      const guestResponse = await findOrCreateGuest(text.trim()).unwrap();

      // Construct a URL for accessing the guest's information
      const guestUrl = `${window.location.origin}/guests/${guestResponse._id}`;

      // Generate the QR code with the guest URL
      const url = await QRCode.toDataURL(guestUrl, { width: 800, margin: 2 });
      setQrCodeUrl(url);
    } catch (error) {
      console.error(
        "Error generating QR code or finding/creating guest:",
        error
      );
      alert("Failed to generate QR code or find/create guest.");
    } finally {
      setLoading(false); // Set loading to false after process completes
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const qrCodeSize = 140;
    const qrCodeX = (pageWidth - qrCodeSize) / 2;
    const qrCodeY = (pageHeight - qrCodeSize) / 2;

    doc.setFillColor("#960018");
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    if (qrCodeRef.current) {
      const formattedText = text.replace(/\s+/g, " ").trim();
      doc.setTextColor("#ffdc9a");
      doc.setFontSize(60);
      doc.text(formattedText, pageWidth / 2, qrCodeY - 30, { align: "center" });
      doc.addImage(qrCodeUrl, "PNG", qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
      doc.setFontSize(17);
      doc.text(
        "See you on the Dancefloor! Yalda Night 2024 with PERSiBER 20.12.2024",
        pageWidth / 2,
        qrCodeY + qrCodeSize + 20,
        { align: "center" }
      );

      const pdfFileName = `${formattedText} - Yalda Night - PERSiBER 20.12.2024.pdf`;
      doc.save(pdfFileName);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        PERSiBER QR Code Generator
      </h1>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter the guest's Name"
        className="mb-6 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xs text-black dark:text-white bg-white dark:bg-gray-700 w-full max-w-md focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition duration-300"
      />
      <button
        onClick={generateQRCode}
        disabled={loading} // Disable button while loading
        className={`mb-6 p-3 rounded-lg w-full max-w-md font-semibold shadow-md transition duration-300 ${
          loading ? "text-gray-200 cursor-not-allowed" : "text-white"
        }`}
      >
        {loading ? "Generating..." : "Generate QR Code"}
      </button>
      {qrCodeUrl && (
        <div className="flex flex-col items-center mt-6">
          <canvas
            ref={qrCodeRef}
            className="mb-6 border border-gray-300 dark:border-gray-600 rounded-lg"
            width="300"
            height="300"
          />
          <button
            onClick={downloadPDF}
            className="p-3 bg-green-600 text-white rounded-lg w-full max-w-md font-semibold shadow-md hover:bg-green-700 transition duration-300"
          >
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeComponent;
