"use client";

import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import Spinner from "./Common/Spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !allowedRoles.includes(userRole || "")) {
        router.push("/");
      }
    }
  }, [isLoading, isAuthenticated, userRole, allowedRoles, router]);

  if (isLoading || !isAuthenticated || !allowedRoles.includes(userRole || "")) {
    return (
      <div className="flex justify-center my-8">
        <Spinner lg />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
