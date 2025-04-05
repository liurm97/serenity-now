import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // Create a Supabase client with admin permissions (needed for table creation)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if we have the service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          error: "Missing SUPABASE_SERVICE_ROLE_KEY environment variable",
          note: "You need to add this to your .env.local file",
        },
        { status: 400 }
      );
    }

    // 1. Check if tables exist
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from("quiz_results")
      .select("id")
      .limit(1);

    // If no error, table exists
    if (!tableError) {
      return NextResponse.json({
        message: "Table quiz_results already exists",
        test_data: tableData,
      });
    }

    // 2. Create the tables
    const createQuizResultsTable = `
      CREATE TABLE IF NOT EXISTS public.quiz_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        score DECIMAL NOT NULL,
        answers JSONB NOT NULL,
        mood_category TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    const enableRLS = `
      ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
    `;

    const createPolicies = `
      CREATE POLICY "Users can view own quiz results"
        ON public.quiz_results
        FOR SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own quiz results"
        ON public.quiz_results
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `;

    const { error: createError } = await supabaseAdmin.rpc("pgadmin_exec", {
      sql: createQuizResultsTable,
    });

    if (createError) {
      return NextResponse.json(
        {
          error: "Failed to create quiz_results table",
          details: createError,
        },
        { status: 500 }
      );
    }

    const { error: rlsError } = await supabaseAdmin.rpc("pgadmin_exec", {
      sql: enableRLS,
    });

    if (rlsError) {
      return NextResponse.json(
        {
          error: "Failed to enable RLS",
          details: rlsError,
        },
        { status: 500 }
      );
    }

    const { error: policiesError } = await supabaseAdmin.rpc("pgadmin_exec", {
      sql: createPolicies,
    });

    if (policiesError) {
      return NextResponse.json(
        {
          error: "Failed to create policies",
          details: policiesError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully created quiz_results table with RLS policies",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fix tables",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
