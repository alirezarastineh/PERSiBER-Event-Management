import ProtectedRoute from "@/app/components/ProtectedRoute";
import Heading from "@/app/utils/Heading";
import Guests from "../components/Guests";

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["user", "admin", "master"]}>
      <Heading title="Guests" />
      <Guests />
    </ProtectedRoute>
  );
}
