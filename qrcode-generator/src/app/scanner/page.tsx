import QRScanner from "@/app/components/Admin/QR Code/QRScanner";
import Heading from "@/app/utils/Heading";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ScannerPage() {
  return (
    <ProtectedRoute allowedRoles={["user", "admin", "master"]}>
      <Heading title="QR Code Scanner" />
      <QRScanner />
    </ProtectedRoute>
  );
}
