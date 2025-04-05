"use client";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, ClipboardCheck, LineChart, BookOpen, Check } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-800">
                  Mental Wellness
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-purple-900">
                  Serenity Now
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Take a moment for yourself. Assess your mental well-being and
                  find helpful resources.
                </p>
              </div>
              {!user ? (
                <div className="space-x-4">
                  <Link href="/login">
                    <Button className="bg-purple-600 text-white hover:bg-purple-700">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/quiz">
                    <Button variant="outline">Take Assessment</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    Signed in as {user.email}
                  </p>
                  <div className="space-x-4">
                    <Link href="/quiz">
                      <Button className="bg-purple-600 text-white hover:bg-purple-700">
                        Take Assessment
                      </Button>
                    </Link>
                    <Link href="/history">
                      <Button variant="outline">View History</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Quick Assessment</h3>
                <p className="text-gray-500 mt-2">
                  A simple questionnaire to gauge your current mental state and
                  offer immediate feedback.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">
                  Mental Health Resources
                </h3>
                <p className="text-gray-500 mt-2">
                  Discover helpful articles, guides, and support hotlines
                  tailored to your specific needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-purple-800">
                    Track Your Mental Wellness Journey
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Regular check-ins help you understand your mental health
                    patterns and identify effective coping strategies.
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Track mood changes over time
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Identify stress triggers and patterns
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Access personalized resources
                    </span>
                  </div>
                </div>
                <div>
                  <Link href="/quiz">
                    <Button className="bg-purple-600 text-white hover:bg-purple-700">
                      Start Your First Assessment
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-80 overflow-hidden rounded-lg shadow-lg">
                  <div className="bg-gradient-to-br from-purple-100 to-indigo-200 w-full h-full flex items-center justify-center">
                    <LineChart className="h-32 w-32 text-purple-500 opacity-70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-purple-50 w-full py-6 md:py-0">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-center md:justify-between py-6">
          <div className="flex mb-4 md:mb-0">
            <p className="text-sm text-purple-900 dark:text-purple-300">
              © 2024 Serenity Now. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="#"
              className="text-sm text-purple-900 hover:text-purple-700"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-sm text-purple-900 hover:text-purple-700"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-purple-900 hover:text-purple-700"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
