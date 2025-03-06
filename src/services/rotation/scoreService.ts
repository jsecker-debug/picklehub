
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Court } from "@/types/scheduler";
import { ScoreData } from "@/types/court-display";

export const validateAndSubmitScore = async (
  scoreData: ScoreData | undefined,
  court: Court,
  sessionId: string,
  courtIndex: number,
  rotationIndex: number,
  isKingCourt: boolean
): Promise<boolean> => {
  if (!scoreData?.team1 || !scoreData?.team2) {
    toast.error("Please enter scores for both teams");
    return false;
  }

  const team1Score = parseInt(scoreData.team1);
  const team2Score = parseInt(scoreData.team2);

  if (isNaN(team1Score) || isNaN(team2Score)) {
    toast.error("Please enter valid numbers for scores");
    return false;
  }

  if (team1Score === team2Score) {
    toast.error("Scores cannot be equal");
    return false;
  }

  const winningTeam = team1Score > team2Score ? court.team1 : court.team2;
  const losingTeam = team1Score > team2Score ? court.team2 : court.team1;
  const winningScore = Math.max(team1Score, team2Score);
  const losingScore = Math.min(team1Score, team2Score);

  try {
    const { error } = await supabase
      .from('game_results')
      .insert({
        session_id: sessionId,
        court_number: courtIndex + 1,
        winning_team_players: winningTeam,
        losing_team_players: losingTeam,
        winning_team_score: winningScore,
        losing_team_score: losingScore,
        game_number: rotationIndex + 1,
        is_best_of_three: isKingCourt
      });

    if (error) throw error;

    toast.success("Score submitted successfully");
    return true;
  } catch (error) {
    console.error('Error submitting score:', error);
    toast.error("Failed to submit score");
    return false;
  }
};
