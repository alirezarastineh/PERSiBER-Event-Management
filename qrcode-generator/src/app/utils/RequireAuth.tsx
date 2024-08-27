"use client";

import { useAppSelector } from "@/redux/hooks";
import { redirect, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { toast } from "react-toastify";
import Spinner from "../components/Common/Spinner";

interface RequireAuthProps {
  readonly children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please log in to access this page.");
      redirect("/auth/login");
    }
  }, [isLoading, isAuthenticated, pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Spinner lg />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
