import Login from "@/app/components/Auth/Login";
import Heading from "@/app/utils/Heading";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Heading title="Login" />
      <Login />
    </div>
  );
}
