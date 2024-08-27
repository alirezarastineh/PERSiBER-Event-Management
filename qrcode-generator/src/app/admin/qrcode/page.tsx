import QRCodeComponent from "@/app/components/Admin/QR Code/QRCode";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Heading from "@/app/utils/Heading";

export default function Home() {
  return (
    <ProtectedRoute allowedRoles={["admin", "master"]}>
      <Heading title="QR COde" />
      <QRCodeComponent />
    </ProtectedRoute>
  );
}
