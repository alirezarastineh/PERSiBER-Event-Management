"use client";

import useLogin from "@/app/hooks/auth/use-login";
import AuthLayout from "./AuthLayout";
import AuthDecorativePanel from "./AuthDecorativePanel";
import AuthFormPanel from "./AuthFormPanel";

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

  const loginFeatures = [
    {
      id: "feature-planning",
      title: "Seamless Event Planning",
      desc: "Seamless Event Planning",
      text: "Seamless Event Planning",
      icon: "📅",
    },
    {
      id: "feature-analytics",
      title: "Powerful Analytics",
      desc: "Powerful Analytics",
      text: "Powerful Analytics",
      icon: "📊",
    },
    {
      id: "feature-guests",
      title: "Guest Management",
      desc: "Guest Management",
      text: "Guest Management",
      icon: "👥",
    },
    {
      id: "feature-security",
      title: "Secure Access Control",
      desc: "Secure Access Control",
      text: "Secure Access Control",
      icon: "🔒",
    },
  ];

  const loginBackgroundUrl =
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80";

  return (
    <AuthLayout>
      <AuthDecorativePanel
        title="PERSiBER Event Management"
        description="The premium solution for organizing and managing your events with elegance and efficiency."
        features={loginFeatures}
        backgroundImageUrl={loginBackgroundUrl}
      />

      <AuthFormPanel
        title="Welcome Back"
        subtitle="Sign in to your account"
        formConfig={formConfig}
        isLoading={isLoading}
        btnText="Sign In"
        onSubmit={onSubmit}
        onChange={onChange}
      />
    </AuthLayout>
  );
}
