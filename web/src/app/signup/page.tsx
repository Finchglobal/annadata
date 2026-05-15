"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Signup is now handled by the unified OTP login page
export default function SignupPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}
