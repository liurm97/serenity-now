"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import {
  CircleXIcon,
  BarChart2,
  Loader2,
  Calendar,
  List,
  Grid3X3,
  PieChart,
} from "lucide-react";
import { getUserQuizResults, getUserQuizStats } from "@/lib/quiz-service";
import { EnhancedQuizResult } from "@/lib/models";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function HistoryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<EnhancedQuizResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login?redirectTo=/history");
      } else {
        fetchUserData();
      }
    }
  }, [user, isLoading, router]);

  const fetchUserData = async () => {
    if (!user) return;
    setLoadingData(true);

    try {
      const [quizResults, quizStats] = await Promise.all([
        getUserQuizResults(user.id),
        getUserQuizStats(user.id),
      ]);

      setResults(quizResults);
      setStats(quizStats);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (isLoading || loadingData) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto py-16 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <h2 className="text-lg font-medium text-gray-700">
              Loading your results...
            </h2>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SiteHeader />
        <div className="container mx-auto py-16 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <CircleXIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to view your quiz history.
            </p>
            <Button
              onClick={() => router.push("/login?redirectTo=/history")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />

      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-purple-900">
              Your Mental Health Tracker
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">View:</span>
              <div className="bg-gray-100 rounded-full p-1 flex">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("list")}
                  className={`rounded-full px-3 ${
                    view === "list" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("grid")}
                  className={`rounded-full px-3 ${
                    view === "grid" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Grid
                </Button>
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
              <Calendar className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-amber-800 mb-2">
                No Quiz Results Yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't completed any mental health quizzes yet. Take your
                first quiz to start tracking your mental wellbeing.
              </p>
              <Button
                onClick={() => router.push("/quiz")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Take Quiz Now
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="results" className="space-y-8">
              <TabsList className="bg-purple-50 p-1 rounded-full mx-auto flex w-auto">
                <TabsTrigger
                  value="results"
                  className="rounded-full data-[state=active]:bg-white"
                >
                  <List className="h-4 w-4 mr-2" />
                  Quiz Results
                </TabsTrigger>
                <TabsTrigger
                  value="summary"
                  className="rounded-full data-[state=active]:bg-white"
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Summary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-6">
                {view === "list" ? (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <Card key={result.id} className="overflow-hidden">
                        <div
                          className={`h-2 ${result.colorClass.split(" ")[0]}`}
                        ></div>
                        <div className="flex flex-col md:flex-row">
                          <div className="p-6 flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">
                                  Mental Health Check
                                </h3>
                                <p className="text-gray-500 text-sm">
                                  {result.formattedDate}
                                </p>
                              </div>
                              <div
                                className={`rounded-full px-3 py-1 text-sm font-medium ${result.colorClass}`}
                              >
                                {result.mood_category.charAt(0).toUpperCase() +
                                  result.mood_category.slice(1)}
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Score</span>
                                <span className="font-medium">
                                  {Math.round(result.score)}%
                                </span>
                              </div>
                              <Progress value={result.score} className="h-2" />
                            </div>

                            {result.notes && (
                              <div className="mt-3 text-sm">
                                <p className="font-medium text-gray-700">
                                  Notes:
                                </p>
                                <p className="text-gray-600 italic mt-1">
                                  {result.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="border-t md:border-t-0 md:border-l border-gray-200 p-6 md:w-64 bg-gray-50">
                            <h4 className="font-medium text-sm text-gray-500 mb-3">
                              Responses
                            </h4>
                            <div className="space-y-3">
                              {result.parsedAnswers.map((answer) => (
                                <div
                                  key={answer.questionId}
                                  className="text-sm"
                                >
                                  <div className="flex justify-between mb-1">
                                    <span
                                      className="text-gray-600 truncate"
                                      title={answer.questionText}
                                    >
                                      {answer.questionText.length > 30
                                        ? answer.questionText.substring(0, 27) +
                                          "..."
                                        : answer.questionText}
                                    </span>
                                    <span className="font-medium">
                                      {answer.answer}/5
                                    </span>
                                  </div>
                                  <Progress
                                    value={answer.answer * 20}
                                    className="h-1.5"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((result) => (
                      <Card key={result.id} className="overflow-hidden h-full">
                        <div
                          className={`h-2 ${result.colorClass.split(" ")[0]}`}
                        ></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                Mental Health Check
                              </CardTitle>
                              <CardDescription>
                                {result.formattedDate}
                              </CardDescription>
                            </div>
                            <div
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${result.colorClass}`}
                            >
                              {result.mood_category.charAt(0).toUpperCase() +
                                result.mood_category.slice(1)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Score</span>
                              <span className="font-medium">
                                {Math.round(result.score)}%
                              </span>
                            </div>
                            <Progress value={result.score} className="h-2" />
                          </div>

                          {result.notes && (
                            <div className="mt-3 text-sm">
                              <p className="font-medium text-gray-700">
                                Notes:
                              </p>
                              <p className="text-gray-600 italic mt-1 line-clamp-2">
                                {result.notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="summary">
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Overview</CardTitle>
                        <CardDescription>
                          Summary of your mental health tracking
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500">
                                Total Entries
                              </span>
                              <span className="font-medium">{stats.count}</span>
                            </div>
                            <Progress
                              value={Math.min(stats.count * 10, 100)}
                              className="h-2"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-500">
                                Average Score
                              </span>
                              <span className="font-medium">
                                {Math.round(stats.avgScore)}%
                              </span>
                            </div>
                            <Progress value={stats.avgScore} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-gray-500">
                              Recent Trend
                            </span>
                            <div
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                stats.recentTrend === "improved"
                                  ? "bg-green-100 text-green-800"
                                  : stats.recentTrend === "worsened"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {stats.recentTrend.charAt(0).toUpperCase() +
                                stats.recentTrend.slice(1)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Mood Categories
                        </CardTitle>
                        <CardDescription>
                          Distribution of your results
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-green-600 font-medium">
                                Excellent
                              </span>
                              <span className="font-medium">
                                {stats.categories.excellent}
                              </span>
                            </div>
                            <Progress
                              value={
                                (stats.categories.excellent / stats.count) * 100
                              }
                              className="h-2 bg-green-100 [&>div]:bg-green-500"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-blue-600 font-medium">
                                Good
                              </span>
                              <span className="font-medium">
                                {stats.categories.good}
                              </span>
                            </div>
                            <Progress
                              value={
                                (stats.categories.good / stats.count) * 100
                              }
                              className="h-2 bg-blue-100 [&>div]:bg-blue-500"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-yellow-600 font-medium">
                                Moderate
                              </span>
                              <span className="font-medium">
                                {stats.categories.moderate}
                              </span>
                            </div>
                            <Progress
                              value={
                                (stats.categories.moderate / stats.count) * 100
                              }
                              className="h-2 bg-yellow-100 [&>div]:bg-yellow-500"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-red-600 font-medium">
                                Concerning
                              </span>
                              <span className="font-medium">
                                {stats.categories.concerning}
                              </span>
                            </div>
                            <Progress
                              value={
                                (stats.categories.concerning / stats.count) *
                                100
                              }
                              className="h-2 bg-red-100 [&>div]:bg-red-500"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
}
