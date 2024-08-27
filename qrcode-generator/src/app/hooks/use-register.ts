import { useRegisterMutation } from "@/redux/features/auth/authApiSlice";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-toastify";

export default function useRegister() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { username, password } = formData;

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await register({ username, password }).unwrap();
      toast.success("Registration successful!");
      router.push("/admin/users");
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error?.data) {
        const errorMessage =
          error.data.username?.[0] ||
          error.data.detail ||
          "Registration failed.";
        toast.error(errorMessage);
      } else {
        toast.error("Registration failed.");
      }
    }
  };

  return {
    username,
    password,
    isLoading,
    onChange,
    onSubmit,
  };
}
