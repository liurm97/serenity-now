"use client";

import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function AuthDebug() {
  const { user, session, isLoading } = useAuth();
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [localStorageData, setLocalStorageData] = useState<string | null>(null);

  useEffect(() => {
    // Check for cookies and local storage on client side only
    if (typeof window !== "undefined") {
      // Parse document cookies
      const cookieObj: Record<string, string> = {};
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const [key, value] = cookie.trim().split("=");
        if (key && value) {
          cookieObj[key] = value;
        }
      });
      setCookies(cookieObj);

      // Check local storage for Supabase data
      try {
        const supabaseData = localStorage.getItem("supabase.auth.token");
        setLocalStorageData(supabaseData ? "Present" : "Not found");
      } catch (e) {
        setLocalStorageData("Error accessing");
      }
    }
  }, []);

  // Refreshes the session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Failed to refresh session:", error);
      } else {
        console.log("Session refreshed:", data.session ? "Exists" : "Null");
        window.location.reload();
      }
    } catch (e) {
      console.error("Error refreshing session:", e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() =>
          document.getElementById("auth-debug")?.classList.toggle("hidden")
        }
        className="bg-gray-800 text-white p-2 rounded-md text-xs"
      >
        Debug Auth
      </button>

      <div
        id="auth-debug"
        className="hidden bg-white shadow-xl border rounded-md p-4 w-80 text-xs mt-2"
      >
        <div className="font-bold mb-2">Auth Status</div>
        <div className="space-y-1">
          <div>Loading: {isLoading ? "true" : "false"}</div>
          <div>
            User:{" "}
            {user ? `${user.email} (${user.id.substring(0, 8)}...)` : "none"}
          </div>
          <div>Session: {session ? "active" : "none"}</div>
          <div>
            Auth Cookies:{" "}
            {Object.keys(cookies)
              .filter((c) => c.includes("sb-"))
              .join(", ") || "none"}
          </div>
          <div>Local Storage: {localStorageData}</div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={refreshSession}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Refresh Session
          </button>

          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
