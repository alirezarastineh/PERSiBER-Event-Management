import Users from "@/app/components/Admin/Users/Users";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Heading from "@/app/utils/Heading";

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "master"]}>
      <Heading title="Users" />
      <Users />
    </ProtectedRoute>
  );
}
