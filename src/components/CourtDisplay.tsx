
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import CourtCard from "./court/CourtCard";
import { Court, Rotation } from "@/types/scheduler";

interface CourtDisplayProps {
  rotations: Rotation[];
  isKingCourt: boolean;
  sessionId?: string;
  sessionStatus?: string;
}

const CourtDisplay = ({ rotations, isKingCourt, sessionId, sessionStatus }: CourtDisplayProps) => {
  const [scores, setScores] = useState<{ [key: string]: { team1: string; team2: string } }>({});
  const [localRotations, setLocalRotations] = useState<Rotation[]>(rotations);
  const [players, setPlayers] = useState<{ [key: string]: { name: string; gender: string } }>({});
  const [dragData, setDragData] = useState<{
    player: string;
    teamType: 'team1' | 'team2';
    courtIndex: number;
    rotationIndex: number;
  } | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('name, gender');
      
      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      const playersMap = data.reduce((acc: { [key: string]: { name: string; gender: string } }, player) => {
        acc[player.name] = { name: player.name, gender: player.gender };
        return acc;
      }, {});

      setPlayers(playersMap);
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchRotationIds = async () => {
      if (!sessionId) return;
      
      const { data, error } = await supabase
        .from('rotations')
        .select('id, rotation_number')
        .eq('session_id', sessionId)
        .order('rotation_number', { ascending: true });
      
      if (error) {
        console.error('Error fetching rotation IDs:', error);
        return;
      }

      setLocalRotations(prevRotations => 
        prevRotations.map((rotation, index) => ({
          ...rotation,
          id: data.find(r => r.rotation_number === index + 1)?.id
        }))
      );
    };

    fetchRotationIds();
  }, [sessionId]);

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

  const handleDragStart = async (
    e: React.DragEvent,
    data: {
      player: string;
      teamType: 'team1' | 'team2';
      courtIndex: number;
      rotationIndex: number;
    }
  ) => {
    setDragData(data);
    await handleDrop(e, data.teamType, data.courtIndex, data.rotationIndex);
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetTeamType: 'team1' | 'team2',
    targetCourtIndex: number,
    targetRotationIndex: number
  ) => {
    e.preventDefault();
    if (!dragData) return;

    const newRotations = [...localRotations];
    const sourceRotation = newRotations[dragData.rotationIndex];
    const targetRotation = newRotations[targetRotationIndex];

    if (!sourceRotation || !targetRotation) return;

    const sourceCourt = sourceRotation.courts[dragData.courtIndex];
    const targetCourt = targetRotation.courts[targetCourtIndex];

    if (!sourceCourt || !targetCourt) return;

    const targetTeamPlayers = targetCourt[targetTeamType];
    const sourceTeamPlayers = sourceCourt[dragData.teamType];
    const draggedPlayerIndex = sourceTeamPlayers.indexOf(dragData.player);
    const targetIndex = Math.min(draggedPlayerIndex, targetTeamPlayers.length - 1);
    const playerToSwap = targetTeamPlayers[targetIndex];

    const newSourceTeamPlayers = [...sourceTeamPlayers];
    const newTargetTeamPlayers = [...targetTeamPlayers];

    if (playerToSwap) {
      newSourceTeamPlayers[draggedPlayerIndex] = playerToSwap;
    }

    if (targetIndex < newTargetTeamPlayers.length) {
      newTargetTeamPlayers[targetIndex] = dragData.player;
    } else {
      newTargetTeamPlayers.push(dragData.player);
    }

    sourceCourt[dragData.teamType] = newSourceTeamPlayers;
    targetCourt[targetTeamType] = newTargetTeamPlayers;

    setLocalRotations(newRotations);

    try {
      const rotationsToUpdate = [sourceRotation.id, targetRotation.id];
      for (const rotationId of rotationsToUpdate) {
        const { error: rotationError } = await supabase
          .from('rotations')
          .update({ manually_modified: true })
          .eq('id', rotationId);

        if (rotationError) throw rotationError;
      }

      const updates = [
        {
          rotation_id: sourceRotation.id,
          court_number: dragData.courtIndex + 1,
          data: {
            team1_players: sourceCourt.team1,
            team2_players: sourceCourt.team2
          }
        },
        {
          rotation_id: targetRotation.id,
          court_number: targetCourtIndex + 1,
          data: {
            team1_players: targetCourt.team1,
            team2_players: targetCourt.team2
          }
        }
      ];

      for (const update of updates) {
        const { error: courtError } = await supabase
          .from('court_assignments')
          .update(update.data)
          .eq('rotation_id', update.rotation_id)
          .eq('court_number', update.court_number);

        if (courtError) throw courtError;
      }

      toast.success("Player positions updated successfully");
    } catch (error) {
      console.error('Error updating player positions:', error);
      toast.error("Failed to update player positions");
      setLocalRotations(rotations);
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
                  allPlayers={Object.values(players)}
                  playerGenders={Object.fromEntries(
                    Object.entries(players).map(([name, data]) => [name, data.gender])
                  )}
                  showScores={sessionStatus === 'Ready' && !isKingCourt}
                  scores={scores[`${idx}-${courtIdx}`] || { team1: '', team2: '' }}
                  onScoreChange={(team, value) => handleScoreChange(idx, courtIdx, team, value)}
                  onSubmitScore={() => handleSubmitScore(idx, courtIdx, court)}
                />
              ))}
            </div>

            {rotation.resters.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-600">Resting:</span>{" "}
                <span>
                  {rotation.resters.map((player, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1">
                      {player}
                      <span className="text-xs text-gray-500">({players[player]?.gender || 'M'})</span>
                      {idx < rotation.resters.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourtDisplay;
