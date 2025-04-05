"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Debug function to help track auth issues
    const logAuthState = (source: string, sess: Session | null) => {
      console.log(
        `[Auth ${source}] Session:`,
        sess ? "exists" : "null",
        "User:",
        sess?.user?.email || "none"
      );
    };

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
        logAuthState("init", data.session);
      } catch (err) {
        console.error("Error in auth initialization:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log(`[Auth event] ${event}`);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      logAuthState("change", currentSession);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Email OTP sign in
  const signIn = async (email: string, redirectPath: string = "/") => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `https://serenity-4i3a9m96c-bobby-lius-projects.vercel.app/auth/callback?redirectTo=${encodeURIComponent(
            redirectPath
          )}`,
        },
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      console.log(`[Auth] OTP sent to ${email}`);
    } catch (err) {
      console.error("Error during sign in:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP token
  const verifyOtp = async (email: string, token: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        console.error("OTP verification error:", error);
        throw error;
      }

      console.log(`[Auth] OTP verified for ${email}`);
    } catch (err) {
      console.error("Error during OTP verification:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
      }

      console.log("[Auth] Signed out");
    } catch (err) {
      console.error("Error during sign out:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
