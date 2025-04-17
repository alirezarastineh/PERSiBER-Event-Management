import ProtectedRoute from "@/app/components/ProtectedRoute";
import Heading from "@/app/utils/Heading";
import BPPList from "../components/BPPList";

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["user", "admin", "master"]}>
      <Heading title="BPP List" />
      <BPPList />
    </ProtectedRoute>
  );
}
