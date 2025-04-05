"use client";

import MentalHealthQuiz from "@/components/mental-health-quiz";
import { SiteHeader } from "@/components/site-header";
import { QuizDebug } from "@/components/quiz-debug";

export default function QuizPage() {
  const showDebug = process.env.NODE_ENV !== "production";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-to-b from-teal-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <MentalHealthQuiz />
          {/* {showDebug && <QuizDebug />} */}
        </div>
      </main>
    </div>
  );
}
