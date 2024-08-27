import ProtectedRoute from "@/app/components/ProtectedRoute";
import Heading from "@/app/utils/Heading";
import Members from "../components/Members";

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["user", "admin", "master"]}>
      <Heading title="Members" />
      <Members />
    </ProtectedRoute>
  );
}
