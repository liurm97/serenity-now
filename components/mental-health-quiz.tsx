"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth-provider";
import {
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Moon,
  Lock,
  LogIn,
  Save,
  Check,
} from "lucide-react";
import Link from "next/link";
import { getMoodCategory } from "@/lib/models";
import { saveQuizResult } from "@/lib/quiz-service";
import { saveQuizResultDirect } from "@/lib/database";
import { Textarea } from "@/components/ui/textarea";
import { MentalHealthResources } from "@/components/mental-health-resources";

interface QuizQuestion {
  id: string;
  text: string;
  value: number;
}

interface AnswerOption {
  value: number;
  label: string;
}

export default function MentalHealthQuiz() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [notes, setNotes] = useState("");
  const [showResources, setShowResources] = useState(false);

  const questions: QuizQuestion[] = [
    { id: "q1", text: "I feel calm and in control.", value: 0 },
    { id: "q2", text: "I have trouble sleeping.", value: 0 },
    { id: "q3", text: "I've been feeling anxious.", value: 0 },
    { id: "q4", text: "I've been able to concentrate today.", value: 0 },
    { id: "q5", text: "I feel emotionally balanced.", value: 0 },
  ];

  const answerOptions: AnswerOption[] = [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" },
  ];

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [riskLevel, setRiskLevel] = useState<"low" | "moderate" | "high">(
    "low"
  );

  const handleAnswerChange = (value: string) => {
    const questionId = questions[currentQuestionIndex].id;
    setAnswers({
      ...answers,
      [questionId]: Number.parseInt(value),
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    // Hide any previous prompts
    setShowAuthPrompt(false);
    setShowSavePrompt(false);
    setShowResources(false);

    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Please answer all questions",
        description:
          "We need your response to all questions to provide accurate feedback.",
        variant: "destructive",
      });
      return;
    }

    // Calculate score - questions 1, 4, 5 are positive (higher is better)
    // questions 2, 3 are negative (lower is better)
    let totalScore = 0;

    totalScore += answers.q1; // Positive
    totalScore += 6 - answers.q2; // Negative (invert)
    totalScore += 6 - answers.q3; // Negative (invert)
    totalScore += answers.q4; // Positive
    totalScore += answers.q5; // Positive

    // Maximum possible score is 25 (5 questions × max value of 5)
    const normalizedScore = (totalScore / 25) * 100;

    setScore(normalizedScore);
    setShowResults(true);
    setResultSaved(false);

    // Determine risk level based on the score
    let calculatedRiskLevel: "low" | "moderate" | "high" = "low";
    if (normalizedScore < 40) {
      calculatedRiskLevel = "high";
    } else if (normalizedScore < 70) {
      calculatedRiskLevel = "moderate";
    } else {
      calculatedRiskLevel = "low";
    }
    setRiskLevel(calculatedRiskLevel);

    // If user is authenticated, save results immediately
    if (user) {
      saveResultToSupabase(normalizedScore);
    } else {
      // Show save prompt for guest users after a short delay
      setTimeout(() => {
        setShowSavePrompt(true);
      }, 2000);
    }
  };

  // Save results to database for authenticated users
  const saveResultToSupabase = async (normalizedScore: number) => {
    if (!user) return;

    setIsSaving(true);
    try {
      await saveQuizResultDirect(user.id, normalizedScore, answers, notes);

      setResultSaved(true);
      toast({
        title: "Result saved",
        description: "Your quiz result has been saved to your history.",
      });
    } catch (error) {
      console.error("Error saving result:", error);
      toast({
        title: "Error saving results",
        description: "There was a problem saving your results.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveResult = () => {
    if (user) {
      saveResultToSupabase(score);
    } else {
      saveAndCreateAccount();
    }
    setShowSavePrompt(false);
    setShowResults(true);
  };

  // For guest users to save and create account
  const saveAndCreateAccount = async () => {
    await saveQuizResult({
      userId: user?.id || "guest",
      score: score,
      answers: answers,
      notes: notes,
    });

    router.push("/auth?action=signup&returnUrl=/history");
  };

  const getResultMessage = () => {
    if (score >= 70) {
      return {
        title: "You're doing great! Keep it up.",
        description:
          "Your responses indicate a positive mental state. Continue with your current self-care practices.",
        color: "bg-green-100 text-green-800",
        icon: <ThumbsUp className="h-8 w-8 text-green-600" />,
      };
    } else if (score >= 40) {
      return {
        title: "Consider exploring self-care techniques.",
        description:
          "Your responses indicate moderate stress levels. Taking short breaks for mindfulness can help improve your well-being.",
        color: "bg-yellow-100 text-yellow-800",
        icon: <AlertCircle className="h-8 w-8 text-yellow-600" />,
      };
    } else {
      return {
        title: "Be gentle with yourself today.",
        description:
          "Your responses indicate higher stress levels. Consider exploring our mental health resources for support.",
        color: "bg-red-100 text-red-800",
        icon: <ThumbsDown className="h-8 w-8 text-red-600" />,
      };
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setShowAuthPrompt(false);
    setShowSavePrompt(false);
    setResultSaved(false);
    setNotes("");
    setShowResources(false);
    setCurrentQuestionIndex(0);
  };

  const goHome = () => {
    router.push("/");
  };

  const viewHistory = () => {
    router.push("/history");
  };

  const viewResources = () => {
    setShowResources(true);
  };

  const result = getResultMessage();
  const moodCategory = getMoodCategory(score);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Mental Health Check-In</CardTitle>
          <CardDescription className="text-center">
            Answer a few questions to assess your current mental state
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showAuthPrompt ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <div className="bg-purple-100 rounded-full p-4">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Sign in to save results</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Create an account or sign in to track your mental health
                progress over time
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Link href="/login">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setShowAuthPrompt(false)}
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          ) : showSavePrompt ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <div className="bg-purple-100 rounded-full p-4">
                  <Save className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Add notes (optional)</h3>
              <div className="max-w-md mx-auto">
                <Textarea
                  placeholder="Add any additional context about how you're feeling..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleSaveResult}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Result
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSavePrompt(false);
                    setShowResults(true);
                  }}
                >
                  Skip
                </Button>
              </div>
            </div>
          ) : showResources ? (
            <MentalHealthResources
              riskLevel={
                score >= 70 ? "low" : score >= 40 ? "moderate" : "high"
              }
            />
          ) : showResults ? (
            <div className="space-y-6">
              <div
                className={`rounded-lg p-4 ${result.color} flex items-start gap-4`}
              >
                {result.icon}
                <div>
                  <h3 className="font-semibold text-lg">{result.title}</h3>
                  <p>{result.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-center">
                  Your Score: {score}/100
                </h3>
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      score >= 70
                        ? "bg-green-500"
                        : score >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-500">
                  {score >= 70
                    ? "Your mental health appears to be in a good place"
                    : score >= 40
                    ? "You're experiencing some stress"
                    : "You may benefit from additional support"}
                </div>
              </div>

              {user && resultSaved && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  <p>Result saved successfully to your history!</p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <Button onClick={resetQuiz} variant="outline">
                  Retake Quiz
                </Button>
                <Button onClick={viewResources}>View Resources</Button>
                {user && (
                  <Button
                    onClick={viewHistory}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    View History
                  </Button>
                )}
                <Button
                  onClick={goHome}
                  variant="outline"
                  className="border-gray-200"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          ) : (
            // Display current question
            <div>
              <div className="mb-8 space-y-2">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-purple-600"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-lg font-medium">
                  {questions[currentQuestionIndex].text}
                </div>

                <RadioGroup
                  value={
                    answers[questions[currentQuestionIndex].id]?.toString() ||
                    ""
                  }
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {answerOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-gray-50"
                    >
                      <RadioGroupItem
                        value={option.value.toString()}
                        id={`option-${option.value}`}
                      />
                      <Label
                        htmlFor={`option-${option.value}`}
                        className="flex-grow cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!showResults &&
            !showAuthPrompt &&
            !showSavePrompt &&
            !showResources && (
              <Button
                onClick={handleNextQuestion}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={
                  !answers[questions[currentQuestionIndex].id] && !showResults
                }
              >
                {currentQuestionIndex === questions.length - 1
                  ? "Submit"
                  : "Next"}
              </Button>
            )}
          {showResources && (
            <Button onClick={() => setShowResources(false)} variant="outline">
              Back to Results
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
