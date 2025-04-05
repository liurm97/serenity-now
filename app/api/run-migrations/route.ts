import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Load migration SQL files
    const migrationDir = path.join(process.cwd(), "supabase", "migrations");

    // Check if directory exists
    if (!fs.existsSync(migrationDir)) {
      return NextResponse.json(
        {
          error: "Migration directory not found",
          path: migrationDir,
        },
        { status: 404 }
      );
    }

    const files = fs
      .readdirSync(migrationDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      return NextResponse.json(
        {
          error: "No SQL migration files found",
          directory: migrationDir,
        },
        { status: 404 }
      );
    }

    // Execute each migration file
    const results = [];

    for (const file of files) {
      const filePath = path.join(migrationDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      // Split SQL into statements (simple implementation)
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Run each statement
      const statementResults = [];
      for (const statement of statements) {
        try {
          const { data, error } = await supabase.rpc("exec_sql", {
            sql_query: statement,
          });

          statementResults.push({
            success: !error,
            error: error ? error.message : null,
            result: data,
          });
        } catch (err: any) {
          statementResults.push({
            success: false,
            error: err.message || "Unknown error",
          });
        }
      }

      results.push({
        file,
        statements: statements.length,
        results: statementResults,
      });
    }

    return NextResponse.json({
      success: true,
      migrations: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to run migrations",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
