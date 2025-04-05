import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    // Debug
    console.log(
      "[Auth Callback] Processing callback with code:",
      code ? "exists" : "missing"
    );

    if (code) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseAnonKey = process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("[Auth Callback] Missing Supabase environment variables");
        return NextResponse.redirect(new URL("/", requestUrl.origin));
      }

      // Create client with auth configuration
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      });

      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error(
          "[Auth Callback] Error exchanging code for session:",
          error
        );
      } else {
        console.log(
          "[Auth Callback] Session established successfully:",
          data.session ? "exists" : "null"
        );
      }
    } else {
      console.warn("[Auth Callback] No code provided in callback");
    }

    // Get redirectTo from query params or default to home
    const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";
    console.log("hi");
    // URL to redirect to after sign in
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
  } catch (error) {
    console.error("[Auth Callback] Unexpected error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
