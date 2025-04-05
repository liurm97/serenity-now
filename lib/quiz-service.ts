import { supabase } from "./supabase";
import {
  QuizResult,
  EnhancedQuizResult,
  getMoodCategory,
  enhanceQuizResult,
} from "./models";

// Interface for creating a new quiz result
interface CreateQuizResultParams {
  userId: string;
  score: number;
  answers: Record<string, number>;
  notes?: string;
}

/**
 * Save a quiz result to the database
 */
export async function saveQuizResult({
  userId,
  score,
  answers,
  notes,
}: CreateQuizResultParams): Promise<QuizResult | null> {
  try {
    // Debug the Supabase client and connection
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("User ID:", userId);

    const moodCategory = getMoodCategory(score);

    // Create the data to insert
    const insertData = {
      // In SQL schema, user_id references auth.users directly
      user_id: userId,
      score,
      answers,
      mood_category: moodCategory,
      notes: notes || null,
    };

    console.log("Attempting to save quiz result:", insertData);

    const { data, error } = await supabase
      .from("quiz_results")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error saving quiz result:", error);
      throw error;
    }

    console.log("Quiz result saved successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to save quiz result:", error);
    return null;
  }
}

/**
 * Get all quiz results for a user
 */
export async function getUserQuizResults(
  userId: string
): Promise<EnhancedQuizResult[]> {
  try {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching quiz results:", error);
      throw error;
    }

    // Enhance each result with computed properties
    return (data || []).map((result) =>
      enhanceQuizResult(result as QuizResult)
    );
  } catch (error) {
    console.error("Failed to fetch quiz results:", error);
    return [];
  }
}

/**
 * Get a single quiz result by ID
 */
export async function getQuizResultById(
  resultId: string
): Promise<EnhancedQuizResult | null> {
  try {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("id", resultId)
      .single();

    if (error) {
      console.error("Error fetching quiz result:", error);
      throw error;
    }

    return enhanceQuizResult(data as QuizResult);
  } catch (error) {
    console.error("Failed to fetch quiz result:", error);
    return null;
  }
}

/**
 * Update notes for a quiz result
 */
export async function updateQuizResultNotes(
  resultId: string,
  notes: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("quiz_results")
      .update({ notes })
      .eq("id", resultId);

    if (error) {
      console.error("Error updating quiz result notes:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Failed to update quiz result notes:", error);
    return false;
  }
}

/**
 * Delete a quiz result
 */
export async function deleteQuizResult(resultId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("quiz_results")
      .delete()
      .eq("id", resultId);

    if (error) {
      console.error("Error deleting quiz result:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Failed to delete quiz result:", error);
    return false;
  }
}

/**
 * Get quiz result stats for a user (average score, count, etc.)
 */
export async function getUserQuizStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching quiz results for stats:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        count: 0,
        avgScore: 0,
        recentTrend: "neutral",
        latestResult: null,
        categories: {
          excellent: 0,
          good: 0,
          moderate: 0,
          concerning: 0,
        },
      };
    }

    // Calculate stats
    const results = data as QuizResult[];
    const count = results.length;
    const totalScore = results.reduce(
      (sum, result) => sum + Number(result.score),
      0
    );
    const avgScore = totalScore / count;

    // Count by category
    const categories = {
      excellent: 0,
      good: 0,
      moderate: 0,
      concerning: 0,
    };

    results.forEach((result) => {
      categories[result.mood_category as keyof typeof categories]++;
    });

    // Calculate trend (improved, worsened, neutral)
    let recentTrend = "neutral";
    if (count >= 2) {
      const latest = Number(results[0].score);
      const previous = Number(results[1].score);

      if (latest > previous + 5) {
        recentTrend = "improved";
      } else if (latest < previous - 5) {
        recentTrend = "worsened";
      }
    }

    return {
      count,
      avgScore,
      recentTrend,
      latestResult: enhanceQuizResult(results[0]),
      categories,
    };
  } catch (error) {
    console.error("Failed to calculate user quiz stats:", error);
    return null;
  }
}
