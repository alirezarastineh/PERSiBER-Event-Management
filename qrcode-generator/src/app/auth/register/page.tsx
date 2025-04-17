import Register from "@/app/components/Auth/Register";
import Heading from "@/app/utils/Heading";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Heading title="Register" />
      <Register />
    </div>
  );
}
