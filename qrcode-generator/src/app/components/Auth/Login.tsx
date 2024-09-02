"use client";

import useLogin from "@/app/hooks/use-login";
import Form from "../Forms/Form";

export default function Login() {
  const { username, password, isLoading, onChange, onSubmit } = useLogin();

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
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg lg:p-12 border border-gray-200/10">
        <h2 className="text-center text-3xl font-bold text-gray-800 dark:text-white">
          Login
        </h2>
        <Form
          config={formConfig}
          isLoading={isLoading}
          btnText="Login"
          onSubmit={onSubmit}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
