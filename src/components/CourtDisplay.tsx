import { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import CourtCard from "./court/CourtCard";
import RestingPlayers from "./court/RestingPlayers";
import { usePlayersData } from "@/hooks/usePlayersData";
import { useRotationData } from "@/hooks/useRotationData";
import { handlePlayerSwap, updateRotationInDatabase } from "@/services/playerSwapService";
import { Court } from "@/types/scheduler";
import { CourtDisplayProps, SwapData } from "@/types/court-display";

const CourtDisplay = ({ rotations, isKingCourt, sessionId, sessionStatus }: CourtDisplayProps) => {
  const [scores, setScores] = useState<{ [key: string]: { team1: string; team2: string } }>({});
  const players = usePlayersData();
  const { localRotations, setLocalRotations } = useRotationData(rotations, sessionId);

  const handleScoreChange = (
    rotationIndex: number,
    courtIndex: number,
    team: 'team1' | 'team2',
    value: string
  ) => {
    const key = `${rotationIndex}-${courtIndex}`;
    setScores(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [team]: value
      }
    }));
  };

  const handleDragStart = async (e: React.DragEvent, data: SwapData) => {
    const newRotations = [...localRotations];
    const targetRotation = newRotations[data.rotationIndex];
    
    const updatedRotation = handlePlayerSwap(
      data.player,
      data.teamType,
      data.courtIndex,
      targetRotation
    );

    if (!updatedRotation) return;

    newRotations[data.rotationIndex] = updatedRotation;

    if (sessionId && targetRotation.id) {
      const success = await updateRotationInDatabase(updatedRotation, sessionId);
      if (!success) {
        toast.error("Failed to update player positions");
        setLocalRotations(rotations);
        return;
      }
      setLocalRotations(newRotations);
      toast.success("Player position updated successfully");
    } else {
      setLocalRotations(newRotations);
      toast.success("Player position updated");
    }
  };

  const handleSubmitScore = async (rotationIndex: number, courtIndex: number, court: Court) => {
    const key = `${rotationIndex}-${courtIndex}`;
    const scoreData = scores[key];

    if (!scoreData?.team1 || !scoreData?.team2) {
      toast.error("Please enter scores for both teams");
      return;
    }

    const team1Score = parseInt(scoreData.team1);
    const team2Score = parseInt(scoreData.team2);

    if (isNaN(team1Score) || isNaN(team2Score)) {
      toast.error("Please enter valid numbers for scores");
      return;
    }

    if (team1Score === team2Score) {
      toast.error("Scores cannot be equal");
      return;
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
      
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[key];
        return newScores;
      });

    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error("Failed to submit score");
    }
  };

  return (
    <div className="space-y-8">
      <div id="court-rotations" className="bg-white">
        {localRotations.map((rotation, idx) => (
          <Card key={idx} className="p-6 mb-6 bg-white">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              {isKingCourt ? "King of the Court Initial Rotation" : `Rotation ${idx + 1}`}
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {rotation.courts.map((court, courtIdx) => (
                <CourtCard
                  key={courtIdx}
                  court={court}
                  courtIndex={courtIdx}
                  rotationIndex={idx}
                  onDragStart={handleDragStart}
                  playerGenders={Object.fromEntries(
                    Object.entries(players).map(([name, data]) => [name, data.gender])
                  )}
                  showScores={sessionStatus === 'Ready' && !isKingCourt}
                  scores={scores[`${idx}-${courtIdx}`] || { team1: '', team2: '' }}
                  onScoreChange={(team, value) => handleScoreChange(idx, courtIdx, team, value)}
                  onSubmitScore={() => handleSubmitScore(idx, courtIdx, court)}
                  allCourts={rotation.courts}
                  restingPlayers={rotation.resters}
                />
              ))}
            </div>

            <RestingPlayers 
              resters={rotation.resters} 
              players={players}
              rotationIndex={idx}
              onDragStart={handleDragStart}
              allCourts={rotation.courts}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourtDisplay;
