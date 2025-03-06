import { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import CourtCard from "./court/CourtCard";
import RestingPlayers from "./court/RestingPlayers";
import { usePlayersData } from "@/hooks/usePlayersData";
import { useRotationData } from "@/hooks/useRotationData";
import { handlePlayerSwap, updateRotationInDatabase } from "@/services/rotation/playerSwapService";
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
    setScores(prev => ({
      ...prev,
      [`${rotationIndex}-${courtIndex}`]: {
        ...prev[`${rotationIndex}-${courtIndex}`],
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
      targetRotation,
      data.targetPlayer
    );

    if (!updatedRotation) return;

    if (sessionId && targetRotation.id) {
      const success = await updateRotationInDatabase(updatedRotation, sessionId);
      if (!success) {
        toast.error("Failed to update player positions");
        return;
      }
      newRotations[data.rotationIndex] = updatedRotation;
      setLocalRotations(newRotations);
      toast.success("Player position updated successfully");
    } else {
      newRotations[data.rotationIndex] = updatedRotation;
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
    <div className="space-y-12">
      <div id="court-rotations">
        {localRotations.map((rotation, rotationIdx) => (
          <Card key={rotationIdx} className="p-6 mb-10 bg-white">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 text-4xl font-bold bg-primary text-white rounded-full">
                {rotationIdx + 1}
              </div>
              <h2 className="text-3xl font-semibold text-primary">
                {isKingCourt ? "King of the Court Initial Rotation" : `Rotation ${rotationIdx + 1}`}
              </h2>
            </div>
            
            <div className="overflow-x-auto pb-6">
              <div className="flex flex-wrap gap-6">
                {rotation.courts.map((court, courtIdx) => (
                  <div key={courtIdx} className="min-w-[300px] flex-1">
                    <div className="bg-gray-100 rounded-t-lg text-center text-2xl font-semibold py-3">
                      Court {courtIdx + 1}
                    </div>
                    
                    <div className="bg-green-100 p-4 rounded-t-lg text-center min-h-[150px] flex flex-col justify-center">
                      {court.team1.map((player, idx) => (
                        <div key={idx} className="text-xl font-medium mb-2">{player}</div>
                      ))}
                    </div>
                    
                    <div className="text-center font-bold text-2xl py-2 bg-gray-100">VS</div>
                    
                    <div className="bg-blue-100 p-4 rounded-b-lg text-center min-h-[150px] flex flex-col justify-center">
                      {court.team2.map((player, idx) => (
                        <div key={idx} className="text-xl font-medium mb-2">{player}</div>
                      ))}
                    </div>
                    
                    {sessionStatus === 'Ready' && !isKingCourt && (
                      <div className="mt-4 flex gap-2">
                        <input 
                          type="number" 
                          className="flex-1 p-2 border rounded text-lg"
                          placeholder="Team 1"
                          value={scores[`${rotationIdx}-${courtIdx}`]?.team1 || ''}
                          onChange={(e) => handleScoreChange(rotationIdx, courtIdx, 'team1', e.target.value)}
                        />
                        <input 
                          type="number" 
                          className="flex-1 p-2 border rounded text-lg"
                          placeholder="Team 2"
                          value={scores[`${rotationIdx}-${courtIdx}`]?.team2 || ''}
                          onChange={(e) => handleScoreChange(rotationIdx, courtIdx, 'team2', e.target.value)}
                        />
                        <button 
                          className="px-4 py-2 bg-primary text-white rounded text-lg"
                          onClick={() => handleSubmitScore(rotationIdx, courtIdx, court)}
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Sitting Out</h3>
              <div className="flex flex-wrap gap-3">
                {rotation.resters.map((player, idx) => (
                  <div key={idx} className="bg-yellow-100 px-4 py-2 rounded-lg text-xl">
                    {player}
                  </div>
                ))}
                {rotation.resters.length === 0 && (
                  <div className="text-gray-500 text-xl">No players sitting out in this rotation</div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourtDisplay;
