"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();

  useLayoutEffect(() => {
    const userStr = localStorage.getItem("user");
    let token = null;

    try {
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user?.data?.token || null;
      }
    } catch (err) {
      console.error("Error parsing localStorage user:", err);
    }

    if (!token) {
      router.push("/"); // redirect to homepage/login if not authenticated
    }
  }, [router]);

  return <>{children}</>;
};

export default ProtectedRoute;
