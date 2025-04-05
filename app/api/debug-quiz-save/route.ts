import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getMoodCategory } from "@/lib/models";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, score, answers, notes } = body;

    // Validate inputs
    if (!userId || typeof score !== "number" || !answers) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: { userId: "string", score: "number", answers: "object" },
          received: { userId, score, answers },
        },
        { status: 400 }
      );
    }

    // Log request details
    console.log("Debug quiz save request:", { userId, score, answers });

    // Step 1: Check database connection
    const { data: healthCheck, error: healthError } = await supabase.rpc(
      "pg_stat_database",
      {
        dbname: "postgres",
      }
    );

    // Step 2: Check if table exists by describing it
    const { data: tableInfo, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "quiz_results");

    const tableExists = tableInfo && tableInfo.length > 0;

    // Step 3: Log all details before trying to save
    console.log("Database diagnostics:", {
      health: healthError ? "Error" : "Connected",
      tables: {
        quiz_results_exists: tableExists,
        error: tableError,
      },
    });

    // Step 4: Try to save the data
    const moodCategory = getMoodCategory(score);

    const { data: saveResult, error: saveError } = await supabase
      .from("quiz_results")
      .insert([
        {
          user_id: userId,
          score,
          answers,
          mood_category: moodCategory,
          notes: notes || null,
        },
      ])
      .select();

    // Return all diagnostic information
    return NextResponse.json({
      diagnostics: {
        database_connection: {
          status: healthError ? "error" : "connected",
          error: healthError,
        },
        tables: {
          quiz_results_exists: tableExists,
          error: tableError,
        },
        save_attempt: {
          success: !saveError,
          error: saveError,
          data: saveResult,
        },
      },
      input_received: {
        userId,
        score,
        answers_count: Object.keys(answers).length,
        notes: notes ? "provided" : "not provided",
      },
    });
  } catch (error: any) {
    console.error("Error in debug quiz save:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
