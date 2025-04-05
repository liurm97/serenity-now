import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";
// import { AuthDebug } from "@/components/auth-debug";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SerenityNow - Mental Wellness App",
  description: "A mental health assessment and resources app",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            {/* {process.env.NODE_ENV !== "production" && <AuthDebug />} */}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
