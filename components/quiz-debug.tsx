"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "./auth-provider";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info, Bug, Check, X } from "lucide-react";

export function QuizDebug() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Skip in production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const runDiagnostics = async () => {
    if (!user) {
      setErrorMessage("You must be logged in to run diagnostics");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Call debug endpoint with test data
      const response = await fetch("/api/debug-quiz-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          score: 75,
          answers: {
            q1: 4,
            q2: 3,
            q3: 4,
            q4: 5,
            q5: 3,
          },
          notes: "This is a test note from quiz debug",
        }),
      });

      const data = await response.json();
      setTestResult(data);

      if (!response.ok) {
        setErrorMessage(`API error: ${data.error || response.statusText}`);
      }
    } catch (error: any) {
      setErrorMessage(`Error: ${error.message || "Unknown error"}`);
      console.error("Quiz diagnostic error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTable = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/fix-tables");
      const data = await response.json();

      setTestResult(data);

      if (!response.ok) {
        setErrorMessage(`API error: ${data.error || response.statusText}`);
      }
    } catch (error: any) {
      setErrorMessage(`Error: ${error.message || "Unknown error"}`);
      console.error("Table creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <CardTitle className="text-amber-800 flex items-center gap-2">
          <Bug className="h-5 w-5" /> Quiz Debug Tools (Development Only)
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={runDiagnostics}
            disabled={loading || !user}
            size="sm"
            variant="secondary"
          >
            {loading ? "Running..." : "Run Diagnostics"}
          </Button>

          <Button
            onClick={createTable}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? "Creating..." : "Create Quiz Table"}
          </Button>
        </div>

        {testResult && (
          <div className="mt-4 space-y-2 text-sm">
            <h3 className="font-medium">Test Results:</h3>
            <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {!user && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Not logged in</AlertTitle>
            <AlertDescription>
              You need to be logged in to run diagnostics
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
