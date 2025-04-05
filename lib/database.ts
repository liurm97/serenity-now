import { supabase } from "./supabase";
import { getMoodCategory } from "./models";

/**
 * Check if the quiz_results table exists
 */
export async function checkTablesExist(): Promise<{
  quiz_results: boolean;
  error?: any;
}> {
  try {
    // Try to select from the table
    const { data, error } = await supabase
      .from("quiz_results")
      .select("count(*)")
      .limit(1);

    if (error) {
      // Most likely table doesn't exist
      console.error("Error checking if quiz_results exists:", error);
      return { quiz_results: false, error };
    }

    return { quiz_results: true };
  } catch (error) {
    console.error("Failed to check if quiz_results exists:", error);
    return { quiz_results: false, error };
  }
}

/**
 * Save quiz result directly to Supabase
 */
export async function saveQuizResultDirect(
  userId: string,
  score: number,
  answers: Record<string, number>,
  notes?: string
) {
  try {
    console.log("Saving quiz result for user:", userId);

    // Create the data structure for the insert
    const resultData = {
      user_id: userId,
      score: score,
      answers: answers,
      mood_category: getMoodCategory(score),
      notes: notes || null,
    };

    console.log("Quiz result data:", resultData);

    // Use raw SQL query directly
    const { data, error } = await supabase
      .from("quiz_results")
      .insert([resultData])
      .select();

    if (error) {
      console.error("Error saving quiz result:", error);
      throw error;
    }

    console.log("Quiz result saved successfully:", data);
    return { success: true, result: data };
  } catch (error) {
    console.error("Failed to save quiz result:", error);
    return { success: false, error };
  }
}
