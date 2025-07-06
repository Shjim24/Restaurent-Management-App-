'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      router.push("/auth/login");
    }
  }, []);
}
