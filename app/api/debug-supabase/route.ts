import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Check if the quiz_results table exists
    const { data: tables, error: tablesError } = await supabase
      .from("pg_catalog.pg_tables")
      .select("tablename")
      .eq("schemaname", "public");

    if (tablesError) {
      return NextResponse.json(
        { error: "Error checking tables", details: tablesError },
        { status: 500 }
      );
    }

    // Check database version and schema
    const { data: schemaData, error: schemaError } = await supabase
      .rpc("get_schema_info")
      .select();

    // Attempt to query the quiz_results table
    const { data: quizResults, error: quizError } = await supabase
      .from("quiz_results")
      .select("*")
      .limit(1);

    return NextResponse.json({
      tables,
      quiz_results_exists: !quizError,
      quiz_results_error: quizError,
      quiz_results_data: quizResults,
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      schema_data: schemaData,
      schema_error: schemaError,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error checking database", details: error },
      { status: 500 }
    );
  }
}
