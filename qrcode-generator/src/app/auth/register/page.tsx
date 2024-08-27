import Register from "@/app/components/Auth/Register";
import Heading from "@/app/utils/Heading";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Heading title="Login" />
      <Register />
    </div>
  );
}
