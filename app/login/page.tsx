"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import LoginForm from "@/components/login-form";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectPath, setRedirectPath] = useState("/");

  useEffect(() => {
    // Get redirectTo from query params if it exists
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) {
      setRedirectPath(redirectTo);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect to intended page if already logged in
    if (user && !isLoading) {
      router.push(redirectPath);
    }
  }, [user, isLoading, router, redirectPath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-teal-50 to-blue-50">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <Link href={"/"} className="text-4xl font-bold text-purple-800 mb-2">
            SerenityNow
          </Link>
          <p className="text-gray-600">Welcome to your mindfulness journey</p>
        </div>
        <LoginForm redirectTo={redirectPath} />
        <Toaster />
      </div>
    </main>
  );
}
