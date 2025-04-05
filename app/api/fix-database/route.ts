import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Check if tables exist first
    const { data: tableCheck, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (checkError) {
      return NextResponse.json(
        {
          error: "Failed to check tables",
          details: checkError,
        },
        { status: 500 }
      );
    }

    const existingTables = tableCheck?.map((t) => t.table_name) || [];
    const results: { tables_created: string[]; tables_exist: string[] } = {
      tables_created: [],
      tables_exist: existingTables,
    };

    // Create user_profiles table if it doesn't exist
    if (!existingTables.includes("user_profiles")) {
      const { error: profilesError } = await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE,
            created_at TIMESTAMPTZ DEFAULT now()
          );

          ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

          CREATE POLICY "Users can view own profile"
            ON public.user_profiles
            FOR SELECT
            USING (auth.uid() = id);

          CREATE POLICY "Users can update own profile"
            ON public.user_profiles
            FOR UPDATE
            USING (auth.uid() = id);
        `,
      });

      if (profilesError) {
        return NextResponse.json(
          {
            error: "Failed to create user_profiles table",
            details: profilesError,
          },
          { status: 500 }
        );
      }

      results.tables_created.push("user_profiles");
    }

    // Create quiz_results table if it doesn't exist
    if (!existingTables.includes("quiz_results")) {
      const { error: quizError } = await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS public.quiz_results (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id),
            score DECIMAL NOT NULL,
            answers JSONB NOT NULL,
            mood_category TEXT NOT NULL,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
          );

          ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

          CREATE POLICY "Users can view own quiz results"
            ON public.quiz_results
            FOR SELECT
            USING (auth.uid() = user_id);

          CREATE POLICY "Users can insert own quiz results"
            ON public.quiz_results
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        `,
      });

      if (quizError) {
        return NextResponse.json(
          {
            error: "Failed to create quiz_results table",
            details: quizError,
          },
          { status: 500 }
        );
      }

      results.tables_created.push("quiz_results");
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fix database",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
