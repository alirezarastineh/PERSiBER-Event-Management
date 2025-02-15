"use client";

import useRegister from "@/app/hooks/use-register";
import Form from "../Forms/Form";

export default function Register() {
  const { username, password, isLoading, onChange, onSubmit } = useRegister();

  const formConfig = [
    {
      label: "Username",
      labelId: "username",
      type: "text",
      value: username,
      onChange,
      required: true,
    },
    {
      label: "Password",
      labelId: "password",
      type: "password",
      value: password,
      onChange,
      required: true,
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg lg:p-12  border border-gray-200/10">
        <h2 className="text-center text-3xl font-bold text-gray-800 dark:text-white">
          Register
        </h2>
        <Form
          config={formConfig}
          isLoading={isLoading}
          btnText="Register"
          onSubmit={onSubmit}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
