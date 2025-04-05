import { Database } from "./database.types";

// Define Types from Database schema
export type QuizResult = Database["public"]["Tables"]["quiz_results"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

// Type for a single quiz answer
export interface QuizAnswer {
  questionId: string;
  questionText: string;
  answer: number;
}

// Enhanced Quiz Result with additional computed properties
export interface EnhancedQuizResult extends QuizResult {
  // Parsed answers with question text
  parsedAnswers: QuizAnswer[];
  // Formatted date string
  formattedDate: string;
  // Color based on mood category
  colorClass: string;
}

// Mood Category Types
export type MoodCategory = "excellent" | "good" | "moderate" | "concerning";

// Get color class based on mood category
export function getMoodColorClass(category: string): string {
  switch (category) {
    case "excellent":
      return "bg-green-100 text-green-800 border-green-200";
    case "good":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "moderate":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "concerning":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Determine mood category from score
export function getMoodCategory(score: number): MoodCategory {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  return "concerning";
}

// Format a date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

// Enhance a quiz result with computed properties
export function enhanceQuizResult(result: QuizResult): EnhancedQuizResult {
  // Parse the stored JSON answers
  const answersObj = result.answers as Record<string, any>;

  const parsedAnswers: QuizAnswer[] = Object.entries(answersObj)
    .filter(([key]) => key.startsWith("q"))
    .map(([key, value]) => ({
      questionId: key,
      questionText: getQuestionText(key),
      answer: typeof value === "number" ? value : parseInt(value as string),
    }));

  return {
    ...result,
    parsedAnswers,
    formattedDate: formatDate(result.created_at),
    colorClass: getMoodColorClass(result.mood_category),
  };
}

// Get question text based on question ID
function getQuestionText(questionId: string): string {
  // Map question IDs to their text
  const questionMap: Record<string, string> = {
    q1: "I feel calm and in control.",
    q2: "I have trouble sleeping.",
    q3: "I've been feeling anxious.",
    q4: "I've been able to concentrate today.",
    q5: "I feel emotionally balanced.",
  };

  return questionMap[questionId] || "Unknown question";
}
