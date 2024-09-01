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
    const qrCodeY = (pageHeight - qrCodeSize) / 2 - 20;

    if (qrCodeRef.current) {
      doc.addImage(qrCodeUrl, "PNG", qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
      doc.text(
        "See you on the Dancefloor, PERSiBER Team 27.09.2024",
        pageWidth / 2,
        qrCodeY + qrCodeSize + 20,
        { align: "center" }
      );

      const formattedText = text.replace(/\s+/g, " ").trim();
      const pdfFileName = `${formattedText} - PERSiBER 27.09.2024.pdf`;
      doc.save(pdfFileName);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4 text-center">
        PERSiBER QR Code Generator
      </h1>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter the guest's Name"
        className="mb-4 p-2 border rounded text-black w-full max-w-md"
      />
      <button
        onClick={generateQRCode}
        disabled={loading} // Disable button while loading
        className="mb-4 p-2 bg-cyan-800 text-white rounded w-full max-w-md"
      >
        {loading ? "Generating..." : "Generate QR Code"}{" "}
        {/* Show loading state */}
      </button>
      {qrCodeUrl && (
        <div className="flex flex-col items-center">
          <canvas ref={qrCodeRef} className="mb-4" width="300" height="300" />
          <button
            onClick={downloadPDF}
            className="p-2 bg-green-800 text-white rounded w-full max-w-md"
          >
            Download as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeComponent;
