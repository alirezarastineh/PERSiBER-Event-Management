"use client";

import useRegister from "@/app/hooks/auth/use-register";
import AuthLayout from "./AuthLayout";
import AuthDecorativePanel from "./AuthDecorativePanel";
import AuthFormPanel from "./AuthFormPanel";

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

  const registerFeatures = [
    {
      id: "feature-create",
      title: "One-Click Event Creation",
      desc: "One-Click Event Creation",
      text: "One-Click Event Creation",
      icon: "⚡",
    },
    {
      id: "feature-analytics",
      title: "Detailed Analytics Dashboard",
      desc: "Detailed Analytics Dashboard",
      text: "Detailed Analytics Dashboard",
      icon: "📊",
    },
    {
      id: "feature-support",
      title: "Premium Support",
      desc: "Premium Support",
      text: "Premium Support",
      icon: "🎧",
    },
    {
      id: "feature-security",
      title: "Advanced Security Features",
      desc: "Advanced Security Features",
      text: "Advanced Security Features",
      icon: "🔒",
    },
  ];

  const registerBackgroundUrl =
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80";

  return (
    <AuthLayout>
      <AuthDecorativePanel
        title="Join PERSiBER Today"
        description="Create your account to access the premium event management platform trusted by professionals worldwide."
        features={registerFeatures}
        backgroundImageUrl={registerBackgroundUrl}
      />

      <AuthFormPanel
        title="Create Account"
        subtitle="Register an user to manage your event"
        formConfig={formConfig}
        isLoading={isLoading}
        btnText="Create Account"
        onSubmit={onSubmit}
        onChange={onChange}
      />
    </AuthLayout>
  );
}
