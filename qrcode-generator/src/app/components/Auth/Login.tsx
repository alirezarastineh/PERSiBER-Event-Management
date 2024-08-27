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
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl p-8 space-y-8 bg-slate-100 rounded-lg shadow-lg lg:p-12">
        <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
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
