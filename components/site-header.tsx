"use client";

import Link from "next/link";
import { UserAccount } from "@/components/user-account";
import { BarChart2, MoonIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MoonIcon className="h-6 w-6 text-purple-600" />
          <Link href="/" className="text-xl font-semibold text-purple-800">
            SerenityNow
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-purple-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/quiz"
            className="text-sm font-medium hover:text-purple-600 transition-colors"
          >
            Mental Health Quiz
          </Link>
          {user && (
            <Link
              href="/history"
              className="text-sm font-medium hover:text-purple-600 transition-colors flex items-center gap-1"
            >
              <BarChart2 className="h-4 w-4" />
              History
            </Link>
          )}
          <UserAccount />
        </nav>
      </div>
    </header>
  );
}
